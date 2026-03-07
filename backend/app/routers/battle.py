"""
Multiplayer Battle router — Battle Royale & Team vs Team
Real-time via FastAPI WebSockets, in-memory room state.
"""

import asyncio
import json
import logging
import random
import string
import time
from dataclasses import dataclass, field, asdict
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, auth
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/battle", tags=["battle"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAX_PLAYERS_BATTLE = 5
MAX_PLAYERS_TEAM = 6
STARTING_LIVES = 3
QUESTION_TIME_LIMIT = 15   # seconds
REVEAL_PAUSE = 2.5         # seconds between reveal → next question
COUNTDOWN_FROM = 3

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class PlayerState:
    user_id: int
    username: str
    profile_picture: Optional[str]
    lives: int = STARTING_LIVES
    score: int = 0
    team: Optional[str] = None        # "A" | "B" | None
    answered: bool = False
    answer: Optional[int] = None
    answer_time: Optional[float] = None
    eliminated: bool = False

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "profile_picture": self.profile_picture,
            "lives": self.lives,
            "score": self.score,
            "team": self.team,
            "answered": self.answered,
            "eliminated": self.eliminated,
        }


@dataclass
class RoomState:
    room_code: str
    host_id: int
    mode: str                          # "battle_royale" | "team_vs_team"
    hsk_level: int = 1
    num_questions: int = 10
    state: str = "lobby"              # lobby|countdown|question|reveal|game_over
    players: dict = field(default_factory=dict)   # user_id → PlayerState
    questions: list = field(default_factory=list)
    current_q_index: int = 0
    connections: dict = field(default_factory=dict)  # user_id → WebSocket
    game_task: Optional[asyncio.Task] = None

    def active_players(self) -> list:
        return [p for p in self.players.values() if not p.eliminated]

    def player_list(self) -> list:
        return [p.to_dict() for p in self.players.values()]

    def team_scores(self) -> dict:
        scores = {"A": 0, "B": 0}
        for p in self.players.values():
            if p.team in scores:
                scores[p.team] += p.score
        return scores


# ---------------------------------------------------------------------------
# In-memory room registry
# ---------------------------------------------------------------------------
rooms: dict[str, RoomState] = {}


def _gen_room_code() -> str:
    chars = string.ascii_uppercase + string.digits
    for _ in range(50):
        code = "".join(random.choices(chars, k=6))
        if code not in rooms:
            return code
    raise RuntimeError("Could not generate unique room code")


# ---------------------------------------------------------------------------
# Question generation (battle-specific: only 4-option questions)
# ---------------------------------------------------------------------------

def _generate_battle_questions(db: Session, hsk_level: int, num_questions: int) -> list:
    all_words = db.query(models.HanziWord).filter(
        models.HanziWord.hsk_level == hsk_level
    ).all()

    if len(all_words) < max(num_questions, 4):
        # fallback: pull from adjacent level
        all_words = db.query(models.HanziWord).filter(
            models.HanziWord.hsk_level <= hsk_level
        ).all()

    if len(all_words) < 4:
        raise HTTPException(status_code=400, detail="Not enough vocabulary for this HSK level")

    n = min(num_questions, len(all_words))
    selected = random.sample(all_words, n)
    questions = []

    for idx, word in enumerate(selected):
        pool = [w for w in all_words if w.id != word.id]
        wrong = random.sample(pool, min(3, len(pool)))

        # Alternate question types
        if idx % 2 == 0:
            # character_match: show Chinese → pick English meaning
            correct = word.english
            options = [w.english for w in wrong] + [correct]
            random.shuffle(options)
            questions.append({
                "id": idx,
                "question_type": "character_match",
                "chinese": word.simplified,
                "pinyin": word.pinyin,
                "english": word.english,
                "options": options,
                "correct_answer": options.index(correct),
                "word_id": word.id,
            })
        else:
            # multiple_choice: show English → pick Chinese character
            correct = word.simplified
            options = [w.simplified for w in wrong] + [correct]
            random.shuffle(options)
            questions.append({
                "id": idx,
                "question_type": "multiple_choice",
                "chinese": word.simplified,
                "pinyin": word.pinyin,
                "english": word.english,
                "options": options,
                "correct_answer": options.index(correct),
                "word_id": word.id,
            })

    return questions


# ---------------------------------------------------------------------------
# Broadcast helpers
# ---------------------------------------------------------------------------

async def _broadcast(room: RoomState, message: dict):
    """Send message to all connected players."""
    dead: list[int] = []
    payload = json.dumps(message)
    for uid, ws in room.connections.items():
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(uid)
    for uid in dead:
        room.connections.pop(uid, None)


async def _send(ws: WebSocket, message: dict):
    try:
        await ws.send_text(json.dumps(message))
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Game loop (runs as background asyncio task)
# ---------------------------------------------------------------------------

async def _run_game(room: RoomState):
    try:
        # 1. Countdown
        room.state = "countdown"
        for n in range(COUNTDOWN_FROM, 0, -1):
            await _broadcast(room, {"type": "countdown", "seconds": n})
            await asyncio.sleep(1)

        # 2. Questions
        for q_idx, question in enumerate(room.questions):
            # Skip if battle royale has ≤1 active player
            if room.mode == "battle_royale" and len(room.active_players()) <= 1:
                break

            room.state = "question"
            room.current_q_index = q_idx

            # Reset per-question player state
            for p in room.players.values():
                p.answered = False
                p.answer = None
                p.answer_time = None

            await _broadcast(room, {
                "type": "question",
                "index": q_idx + 1,
                "total": len(room.questions),
                "time_limit": QUESTION_TIME_LIMIT,
                **question,
                # Hide correct_answer from payload — clients must not see it
                "correct_answer": None,
            })

            # Wait for time limit (check every 0.25s for early all-answered)
            deadline = time.time() + QUESTION_TIME_LIMIT
            while time.time() < deadline:
                active = room.active_players()
                if all(p.answered for p in active):
                    break
                await asyncio.sleep(0.25)

            # Reveal phase
            room.state = "reveal"
            correct_idx = question["correct_answer"]
            results = []

            for p in room.players.values():
                if p.eliminated:
                    results.append({**p.to_dict(), "result": "eliminated"})
                    continue

                answered_correctly = (p.answered and p.answer == correct_idx)

                if answered_correctly:
                    p.score += 10
                    result = "correct"
                else:
                    if room.mode == "battle_royale":
                        p.lives = max(0, p.lives - 1)
                        if p.lives == 0:
                            p.eliminated = True
                    result = "wrong"

                results.append({**p.to_dict(), "result": result})

            await _broadcast(room, {
                "type": "reveal",
                "correct_answer": correct_idx,
                "correct_text": question["options"][correct_idx],
                "players": results,
            })

            # Announce eliminations
            for p in room.players.values():
                if p.eliminated and p.lives == 0:
                    # Only announce freshly eliminated (lives just hit 0 this round)
                    pass  # included in reveal payload

            await asyncio.sleep(REVEAL_PAUSE)

            # Early finish: battle royale → 1 survivor
            if room.mode == "battle_royale":
                survivors = room.active_players()
                if len(survivors) <= 1:
                    break

        # 3. Game over
        room.state = "game_over"
        final_scores = sorted(
            [p.to_dict() for p in room.players.values()],
            key=lambda x: (-x["score"], x["eliminated"])
        )

        if room.mode == "battle_royale":
            survivors = [p for p in room.players.values() if not p.eliminated]
            winner = (
                max(survivors, key=lambda p: p.score).to_dict()
                if survivors
                else max(room.players.values(), key=lambda p: p.score).to_dict()
            )
            payload = {
                "type": "game_over",
                "mode": "battle_royale",
                "winner": winner,
                "final_scores": final_scores,
            }
        else:
            ts = room.team_scores()
            if ts["A"] > ts["B"]:
                winning_team = "A"
            elif ts["B"] > ts["A"]:
                winning_team = "B"
            else:
                winning_team = "draw"
            payload = {
                "type": "game_over",
                "mode": "team_vs_team",
                "winning_team": winning_team,
                "team_scores": ts,
                "final_scores": final_scores,
            }

        await _broadcast(room, payload)

    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.exception("Game loop error in room %s: %s", room.room_code, e)
        await _broadcast(room, {"type": "error", "message": "Game error occurred"})
    finally:
        room.state = "game_over"


# ---------------------------------------------------------------------------
# REST: create room
# ---------------------------------------------------------------------------

class CreateRoomRequest(BaseModel):
    mode: str = "battle_royale"   # "battle_royale" | "team_vs_team"


class CreateRoomResponse(BaseModel):
    room_code: str
    mode: str
    host_id: int


@router.post("/rooms", response_model=CreateRoomResponse)
def create_room(
    req: CreateRoomRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    if req.mode not in ("battle_royale", "team_vs_team"):
        raise HTTPException(status_code=400, detail="Invalid mode")

    code = _gen_room_code()
    rooms[code] = RoomState(
        room_code=code,
        host_id=current_user.id,
        mode=req.mode,
    )
    logger.info("Room %s created by user %s (mode=%s)", code, current_user.id, req.mode)
    return CreateRoomResponse(room_code=code, mode=req.mode, host_id=current_user.id)


@router.get("/rooms/{room_code}")
def get_room(
    room_code: str,
    current_user: models.User = Depends(auth.get_current_user),
):
    room = rooms.get(room_code.upper())
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {
        "room_code": room.room_code,
        "mode": room.mode,
        "host_id": room.host_id,
        "state": room.state,
        "player_count": len(room.players),
        "players": room.player_list(),
    }


# ---------------------------------------------------------------------------
# WebSocket: /battle/ws/{room_code}?token=<jwt>
# ---------------------------------------------------------------------------

@router.websocket("/ws/{room_code}")
async def battle_websocket(
    websocket: WebSocket,
    room_code: str,
    token: str,
    db: Session = Depends(get_db),
):
    # Auth via query-param token (must await — get_current_user is async)
    try:
        current_user = await auth.get_current_user(token=token, db=db)
    except Exception:
        await websocket.close(code=4001)
        return

    room_code = room_code.upper()
    room = rooms.get(room_code)
    if not room:
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Room not found"}))
        await websocket.close()
        return

    max_players = MAX_PLAYERS_BATTLE if room.mode == "battle_royale" else MAX_PLAYERS_TEAM
    if room.state != "lobby" and current_user.id not in room.players:
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Game already in progress"}))
        await websocket.close()
        return

    if len(room.players) >= max_players and current_user.id not in room.players:
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Room is full"}))
        await websocket.close()
        return

    await websocket.accept()

    # Register player
    if current_user.id not in room.players:
        room.players[current_user.id] = PlayerState(
            user_id=current_user.id,
            username=current_user.username,
            profile_picture=getattr(current_user, "profile_picture", None),
        )
        logger.info("Player %s joined room %s", current_user.username, room_code)

    room.connections[current_user.id] = websocket

    # Send current lobby state to newcomer
    await _send(websocket, {
        "type": "lobby_update",
        "room_code": room.room_code,
        "mode": room.mode,
        "host_id": room.host_id,
        "players": room.player_list(),
        "state": room.state,
    })

    # Notify others
    await _broadcast(room, {
        "type": "lobby_update",
        "room_code": room.room_code,
        "mode": room.mode,
        "host_id": room.host_id,
        "players": room.player_list(),
        "state": room.state,
    })

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            mtype = msg.get("type")

            # ── START GAME ─────────────────────────────────────────────────
            if mtype == "start_game" and current_user.id == room.host_id:
                if room.state != "lobby":
                    await _send(websocket, {"type": "error", "message": "Game already started"})
                    continue
                if len(room.players) < 2:
                    await _send(websocket, {"type": "error", "message": "Need at least 2 players"})
                    continue

                hsk_level = int(msg.get("hsk_level", 1))
                num_q = int(msg.get("num_questions", 10))
                room.hsk_level = hsk_level
                room.num_questions = num_q

                try:
                    room.questions = _generate_battle_questions(db, hsk_level, num_q)
                except HTTPException as e:
                    await _send(websocket, {"type": "error", "message": e.detail})
                    continue

                # Reset player states
                for p in room.players.values():
                    p.lives = STARTING_LIVES
                    p.score = 0
                    p.eliminated = False
                    p.answered = False

                # Kick off game loop as background task
                if room.game_task and not room.game_task.done():
                    room.game_task.cancel()
                room.game_task = asyncio.create_task(_run_game(room))

            # ── ASSIGN TEAM ────────────────────────────────────────────────
            elif mtype == "assign_team" and current_user.id == room.host_id:
                if room.state != "lobby":
                    continue
                uid = int(msg.get("user_id", 0))
                team = msg.get("team")
                if uid in room.players and team in ("A", "B"):
                    room.players[uid].team = team
                    await _broadcast(room, {
                        "type": "lobby_update",
                        "room_code": room.room_code,
                        "mode": room.mode,
                        "host_id": room.host_id,
                        "players": room.player_list(),
                        "state": room.state,
                    })

            # ── ANSWER ─────────────────────────────────────────────────────
            elif mtype == "answer":
                player = room.players.get(current_user.id)
                if (
                    player
                    and not player.eliminated
                    and not player.answered
                    and room.state == "question"
                ):
                    player.answered = True
                    player.answer = int(msg.get("answer_index", -1))
                    player.answer_time = time.time()

                    # Tell everyone who answered (not what)
                    await _broadcast(room, {
                        "type": "player_answered",
                        "user_id": current_user.id,
                        "username": current_user.username,
                    })

            # ── KICK ───────────────────────────────────────────────────────
            elif mtype == "kick" and current_user.id == room.host_id:
                if room.state != "lobby":
                    continue
                uid = int(msg.get("user_id", 0))
                if uid in room.players and uid != room.host_id:
                    room.players.pop(uid, None)
                    ws = room.connections.pop(uid, None)
                    if ws:
                        await _send(ws, {"type": "kicked"})
                        await ws.close()
                    await _broadcast(room, {
                        "type": "lobby_update",
                        "room_code": room.room_code,
                        "mode": room.mode,
                        "host_id": room.host_id,
                        "players": room.player_list(),
                        "state": room.state,
                    })

    except WebSocketDisconnect:
        pass
    finally:
        room.connections.pop(current_user.id, None)
        logger.info("Player %s disconnected from room %s", current_user.username, room_code)

        # Notify remaining players
        if room.connections:
            await _broadcast(room, {
                "type": "lobby_update",
                "room_code": room.room_code,
                "mode": room.mode,
                "host_id": room.host_id,
                "players": room.player_list(),
                "state": room.state,
            })
        else:
            # Empty room — clean up
            if room.game_task and not room.game_task.done():
                room.game_task.cancel()
            rooms.pop(room_code, None)
            logger.info("Room %s cleaned up (empty)", room_code)
