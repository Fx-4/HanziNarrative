"""
HSK Ladder Race — multiplayer snakes & ladders with per-player HSK handicap.
Real-time via FastAPI WebSockets, in-memory room state (same pattern as battle.py).

Fairness model:
  * Every player answers questions at THEIR OWN HSK level (golf-style handicap).
    Level = max(onboarding assessment, highest course level with progress);
    players may raise it in the lobby, never lower it (anti-sandbagging).
  * Dice + answer validation are server-side; the answering client never
    receives the correct index.
  * Wrong answer still moves 1 tile — no death spiral for beginners.
  * Rubber-band: the trailing player gets +1 movement on correct answers.
  * Final-round rule: when someone reaches the last tile, every remaining
    player in that round still takes their turn (equal turn counts).

Turn flow:
  turn_start → player sends `roll` → dice_result → question (their level,
  15 s) → answer_result → move (+ ladder/snake gate question) → next turn.
"""

import asyncio
import json
import logging
import random
import string
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from .. import models, auth
from ..database import get_db, SessionLocal
from ..services.question_service import generate_level_questions
from ..services.gamification_service import add_xp

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ladder", tags=["ladder"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MIN_PLAYERS          = 2
MAX_PLAYERS          = 4
BOARD_SIZES          = (50, 100)
QUESTION_TIME_LIMIT  = 15    # seconds to answer
ROLL_TIME_LIMIT      = 20    # seconds to press roll before AFK skip
FAST_ANSWER_SECONDS  = 5     # answer under this → +1 movement
AFK_FORFEIT_STRIKES  = 3
QUESTION_POOL_SIZE   = 40    # per player, refilled when exhausted
STREAK_FOR_BONUS     = 3     # consecutive correct → extra roll
ROOM_IDLE_SECONDS    = 30 * 60
XP_PER_CORRECT       = 5
XP_PLACEMENT         = {1: 25, 2: 15, 3: 10, 4: 5}


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class PlayerState:
    user_id: int
    username: str
    profile_picture: Optional[str]
    hsk_level: int = 1            # question difficulty for THIS player (handicap)
    min_level: int = 1            # computed floor — cannot go below (anti-sandbag)
    position: int = 0             # 0 = start, board_size = finish
    streak: int = 0
    correct_count: int = 0
    wrong_count: int = 0
    afk_strikes: int = 0
    forfeited: bool = False
    finished: bool = False
    connected: bool = True

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "profile_picture": self.profile_picture,
            "hsk_level": self.hsk_level,
            "position": self.position,
            "streak": self.streak,
            "correct_count": self.correct_count,
            "wrong_count": self.wrong_count,
            "forfeited": self.forfeited,
            "finished": self.finished,
            "connected": self.connected,
        }


@dataclass
class TurnState:
    """Mailbox between the WS receive loop and the game loop."""
    uid: int = 0
    phase: str = "idle"            # idle | await_roll | await_answer
    deadline: float = 0.0
    rolled: bool = False
    answer: Optional[int] = None
    answer_time: Optional[float] = None
    question: Optional[dict] = None
    question_sent_at: float = 0.0


@dataclass
class RoomState:
    room_code: str
    host_id: int
    board_size: int = 50
    state: str = "lobby"           # lobby | playing | game_over
    players: Dict[int, PlayerState] = field(default_factory=dict)
    turn_order: List[int] = field(default_factory=list)
    turn_idx: int = 0
    ladders: Dict[int, int] = field(default_factory=dict)   # start → end (up)
    snakes: Dict[int, int] = field(default_factory=dict)    # start → end (down)
    question_pools: Dict[int, List[dict]] = field(default_factory=dict)
    connections: Dict[int, WebSocket] = field(default_factory=dict)
    game_task: Optional[asyncio.Task] = None
    turn: TurnState = field(default_factory=TurnState)
    final_round: bool = False
    finish_order: List[int] = field(default_factory=list)
    rematch_votes: set = field(default_factory=set)
    last_activity: float = field(default_factory=time.time)

    def player_list(self) -> list:
        return [p.to_dict() for p in self.players.values()]

    def active_uids(self) -> List[int]:
        return [
            uid for uid in self.turn_order
            if uid in self.players
            and not self.players[uid].forfeited
            and not self.players[uid].finished
        ]

    def board_dict(self) -> dict:
        return {
            "size": self.board_size,
            "ladders": {str(k): v for k, v in self.ladders.items()},
            "snakes": {str(k): v for k, v in self.snakes.items()},
        }


rooms: Dict[str, RoomState] = {}


def _gen_room_code() -> str:
    chars = string.ascii_uppercase + string.digits
    for _ in range(50):
        code = "".join(random.choices(chars, k=6))
        if code not in rooms:
            return code
    raise RuntimeError("Could not generate unique room code")


def _purge_idle_rooms():
    now = time.time()
    dead = [c for c, r in rooms.items() if now - r.last_activity > ROOM_IDLE_SECONDS]
    for code in dead:
        room = rooms.pop(code)
        if room.game_task and not room.game_task.done():
            room.game_task.cancel()
        logger.info("Purged idle ladder room %s", code)


# ---------------------------------------------------------------------------
# Board generation
# ---------------------------------------------------------------------------

def _generate_board(size: int) -> tuple[Dict[int, int], Dict[int, int]]:
    """Seeded random ladders/snakes. Keys never collide; last tile stays clean."""
    n_each = 5 if size <= 50 else 8
    used: set[int] = {1, size}
    ladders: Dict[int, int] = {}
    snakes: Dict[int, int] = {}

    attempts = 0
    while len(ladders) < n_each and attempts < 300:
        attempts += 1
        start = random.randint(2, size - 8)
        end = start + random.randint(5, min(20, size - start - 1))
        if start in used or end in used or end in ladders.values():
            continue
        ladders[start] = end
        used.add(start)
        used.add(end)

    attempts = 0
    while len(snakes) < n_each and attempts < 300:
        attempts += 1
        start = random.randint(10, size - 1)
        end = start - random.randint(5, min(15, start - 2))
        if start in used or end in used or end in snakes.values():
            continue
        snakes[start] = end
        used.add(start)
        used.add(end)

    return ladders, snakes


# ---------------------------------------------------------------------------
# Player level (handicap floor)
# ---------------------------------------------------------------------------

def _compute_min_level(db: Session, user_id: int) -> int:
    """Highest of: onboarding assessment level, highest course level with progress."""
    level = 1
    ob = (
        db.query(models.UserOnboarding)
        .filter(models.UserOnboarding.user_id == user_id)
        .first()
    )
    if ob and ob.determined_hsk_level:
        level = max(level, int(ob.determined_hsk_level))
    progress_max = (
        db.query(sa_func.max(models.UserLessonProgress.hsk_level))
        .filter(
            models.UserLessonProgress.user_id == user_id,
            models.UserLessonProgress.completed == True,  # noqa: E712
        )
        .scalar()
    )
    if progress_max:
        level = max(level, int(progress_max))
    return min(level, 6)


# ---------------------------------------------------------------------------
# Broadcast helpers
# ---------------------------------------------------------------------------

async def _broadcast(room: RoomState, message: dict):
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


def _room_state_message(room: RoomState) -> dict:
    """Full resync payload — sent on join/rejoin."""
    return {
        "type": "room_state",
        "room_code": room.room_code,
        "host_id": room.host_id,
        "state": room.state,
        "board": room.board_dict(),
        "players": room.player_list(),
        "turn_order": room.turn_order,
        "current_turn_uid": (
            room.turn.uid if room.state == "playing" and room.turn.phase != "idle" else None
        ),
    }


# ---------------------------------------------------------------------------
# Question helpers
# ---------------------------------------------------------------------------

def _next_question(room: RoomState, uid: int) -> dict:
    pool = room.question_pools.get(uid) or []
    if not pool:
        player = room.players[uid]
        db = SessionLocal()
        try:
            pool = generate_level_questions(db, player.hsk_level, QUESTION_POOL_SIZE)
        finally:
            db.close()
        room.question_pools[uid] = pool
    return room.question_pools[uid].pop(0)


async def _ask_question(room: RoomState, uid: int, context: str) -> tuple[bool, bool]:
    """
    Send a question to `uid`, wait for the answer (or timeout).
    Returns (correct, fast). `context` ∈ main|ladder|snake.
    """
    player = room.players[uid]
    question = _next_question(room, uid)

    room.turn.phase = "await_answer"
    room.turn.uid = uid
    room.turn.answer = None
    room.turn.answer_time = None
    room.turn.question = question
    room.turn.question_sent_at = time.time()
    room.turn.deadline = time.time() + QUESTION_TIME_LIMIT

    ws = room.connections.get(uid)
    if ws:
        # The answering player NEVER receives the correct index
        await _send(ws, {
            "type": "question",
            "context": context,
            "question_type": question["question_type"],
            "prompt": question["prompt"],
            "prompt_hint": question.get("prompt_hint"),
            "prompt_label": question["prompt_label"],
            "options": question["options"],
            "hsk_level": question["hsk_level"],
            "time_limit": QUESTION_TIME_LIMIT,
        })
    await _broadcast(room, {
        "type": "question_wait",
        "user_id": uid,
        "username": player.username,
        "context": context,
        "hsk_level": player.hsk_level,
    })

    # Poll for answer or timeout (0.2 s tick, same pattern as battle.py)
    while time.time() < room.turn.deadline:
        if room.turn.answer is not None:
            break
        await asyncio.sleep(0.2)

    elapsed = (room.turn.answer_time or time.time()) - room.turn.question_sent_at
    correct = room.turn.answer == question["correct_answer"]
    fast = correct and elapsed <= FAST_ANSWER_SECONDS

    if correct:
        player.correct_count += 1
        player.streak += 1
    else:
        player.wrong_count += 1
        player.streak = 0

    await _broadcast(room, {
        "type": "answer_result",
        "user_id": uid,
        "context": context,
        "correct": correct,
        "answered": room.turn.answer is not None,
        "correct_answer": question["correct_answer"],
        "correct_text": question["options"][question["correct_answer"]],
        "reveal": question["reveal"],
        "fast": fast,
        "elapsed": round(elapsed, 1),
    })
    room.turn.phase = "idle"
    room.turn.question = None
    await asyncio.sleep(1.5)  # let everyone read the reveal
    return correct, fast


# ---------------------------------------------------------------------------
# Movement
# ---------------------------------------------------------------------------

async def _move_player(room: RoomState, uid: int, from_pos: int, to_pos: int,
                       dice: int, via: Optional[dict] = None):
    player = room.players[uid]
    player.position = min(to_pos, room.board_size)
    await _broadcast(room, {
        "type": "move",
        "user_id": uid,
        "from": from_pos,
        "to": player.position,
        "dice": dice,
        "via": via,
        "streak": player.streak,
        "players": room.player_list(),
    })
    await asyncio.sleep(0.8)  # movement animation window


async def _handle_tile_events(room: RoomState, uid: int, dice: int):
    """Ladder = bonus question to climb; snake = rescue question to resist."""
    player = room.players[uid]
    pos = player.position

    if pos in room.ladders:
        top = room.ladders[pos]
        await _broadcast(room, {
            "type": "tile_event", "user_id": uid, "tile": "ladder",
            "at": pos, "target": top,
        })
        correct, _ = await _ask_question(room, uid, context="ladder")
        if correct:
            await _move_player(room, uid, pos, top, dice,
                               via={"kind": "ladder", "from": pos, "to": top})
        # wrong → stays, no extra penalty

    elif pos in room.snakes:
        tail = room.snakes[pos]
        await _broadcast(room, {
            "type": "tile_event", "user_id": uid, "tile": "snake",
            "at": pos, "target": tail,
        })
        correct, _ = await _ask_question(room, uid, context="snake")
        if not correct:
            await _move_player(room, uid, pos, tail, dice,
                               via={"kind": "snake", "from": pos, "to": tail})
        # correct → resists the snake, stays


# ---------------------------------------------------------------------------
# Game loop
# ---------------------------------------------------------------------------

async def _run_game(room: RoomState):
    try:
        await _broadcast(room, {
            "type": "game_started",
            "board": room.board_dict(),
            "turn_order": room.turn_order,
            "players": room.player_list(),
        })
        await asyncio.sleep(1.5)

        turn_no = 0
        while room.state == "playing":
            active = room.active_uids()
            if len(active) == 0:
                break
            if len(active) == 1 and len(room.finish_order) == 0 and len(room.players) > 1:
                # Everyone else forfeited — last player standing wins
                room.finish_order.append(active[0])
                break

            uid = room.turn_order[room.turn_idx % len(room.turn_order)]
            is_last_slot = (room.turn_idx % len(room.turn_order)) == len(room.turn_order) - 1
            room.turn_idx += 1
            player = room.players.get(uid)
            if player is None or player.forfeited or player.finished:
                if room.final_round and is_last_slot:
                    break
                continue

            turn_no += 1

            # ── Await roll ────────────────────────────────────────────────
            room.turn = TurnState(
                uid=uid, phase="await_roll",
                deadline=time.time() + ROLL_TIME_LIMIT,
            )
            await _broadcast(room, {
                "type": "turn_start",
                "user_id": uid,
                "username": player.username,
                "turn_no": turn_no,
                "roll_deadline": ROLL_TIME_LIMIT,
                "final_round": room.final_round,
            })

            while time.time() < room.turn.deadline and not room.turn.rolled:
                await asyncio.sleep(0.2)

            if not room.turn.rolled:
                # AFK — skip turn
                player.afk_strikes += 1
                if player.afk_strikes >= AFK_FORFEIT_STRIKES:
                    player.forfeited = True
                await _broadcast(room, {
                    "type": "turn_skipped",
                    "user_id": uid,
                    "afk_strikes": player.afk_strikes,
                    "forfeited": player.forfeited,
                    "players": room.player_list(),
                })
                if room.final_round and is_last_slot:
                    break
                continue

            player.afk_strikes = 0

            # ── Dice (server RNG) ─────────────────────────────────────────
            dice = random.randint(1, 6)
            await _broadcast(room, {"type": "dice_result", "user_id": uid, "dice": dice})
            await asyncio.sleep(1.0)

            # ── Main question at player's own level ───────────────────────
            correct, fast = await _ask_question(room, uid, context="main")

            movement = dice if correct else 1
            if fast:
                movement += 1
            # Rubber-band: trailing player gets +1 on correct answers
            if correct and len(room.players) > 1:
                min_pos = min(
                    p.position for p in room.players.values()
                    if not p.forfeited and not p.finished
                )
                if player.position == min_pos:
                    movement += 1

            from_pos = player.position
            await _move_player(room, uid, from_pos, from_pos + movement, dice)

            # ── Tile events (ladder/snake gate questions) ─────────────────
            if player.position < room.board_size:
                await _handle_tile_events(room, uid, dice)

            # ── Finish check ──────────────────────────────────────────────
            if player.position >= room.board_size and not player.finished:
                player.finished = True
                room.finish_order.append(uid)
                await _broadcast(room, {
                    "type": "player_finished",
                    "user_id": uid,
                    "place": len(room.finish_order),
                    "players": room.player_list(),
                })
                if not room.final_round:
                    room.final_round = True
                    await _broadcast(room, {"type": "final_round", "triggered_by": uid})

            # ── Streak bonus: extra roll (does not consume the streak grant twice)
            if (not player.finished and not room.final_round
                    and player.streak >= STREAK_FOR_BONUS):
                player.streak = 0
                await _broadcast(room, {"type": "streak_bonus", "user_id": uid})
                room.turn_idx -= 1  # same player goes again

            # Equal turns: game ends once the last slot of the round has played
            if room.final_round and is_last_slot:
                break

        await _finish_game(room)

    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.exception("Ladder game loop error in room %s: %s", room.room_code, e)
        await _broadcast(room, {"type": "error", "message": "Game error occurred"})
        room.state = "game_over"


async def _finish_game(room: RoomState):
    room.state = "game_over"

    def rank_key(p: PlayerState):
        total = p.correct_count + p.wrong_count
        accuracy = p.correct_count / total if total else 0.0
        finished_rank = (
            room.finish_order.index(p.user_id)
            if p.user_id in room.finish_order else 999
        )
        return (finished_rank, -p.position, -accuracy, -p.correct_count)

    ranked = sorted(
        [p for p in room.players.values()],
        key=rank_key,
    )

    placements = []
    db = SessionLocal()
    try:
        for place, p in enumerate(ranked, start=1):
            xp = p.correct_count * XP_PER_CORRECT
            if not p.forfeited:
                xp += XP_PLACEMENT.get(place, 0)
            user = db.query(models.User).filter(models.User.id == p.user_id).first()
            if user and xp > 0:
                try:
                    add_xp(db, user, xp, f"Ladder Race {room.room_code} — place {place}")
                except Exception:
                    logger.exception("XP award failed for user %s", p.user_id)
            total = p.correct_count + p.wrong_count
            placements.append({
                **p.to_dict(),
                "place": place,
                "accuracy": round(p.correct_count / total * 100) if total else 0,
                "xp_earned": xp,
            })
    finally:
        db.close()

    await _broadcast(room, {"type": "game_over", "placements": placements})


# ---------------------------------------------------------------------------
# REST
# ---------------------------------------------------------------------------

class CreateRoomRequest(BaseModel):
    board_size: int = 50


class CreateRoomResponse(BaseModel):
    room_code: str
    board_size: int
    host_id: int


@router.post("/rooms", response_model=CreateRoomResponse)
def create_room(
    req: CreateRoomRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    _purge_idle_rooms()
    if req.board_size not in BOARD_SIZES:
        raise HTTPException(status_code=400, detail="board_size must be 50 or 100")
    code = _gen_room_code()
    rooms[code] = RoomState(
        room_code=code,
        host_id=current_user.id,
        board_size=req.board_size,
    )
    logger.info("Ladder room %s created by user %s (size=%s)",
                code, current_user.id, req.board_size)
    return CreateRoomResponse(
        room_code=code, board_size=req.board_size, host_id=current_user.id
    )


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
        "board_size": room.board_size,
        "host_id": room.host_id,
        "state": room.state,
        "player_count": len(room.players),
        "players": room.player_list(),
    }


# ---------------------------------------------------------------------------
# WebSocket: /ladder/ws/{room_code}?token=<jwt>
# ---------------------------------------------------------------------------

@router.websocket("/ws/{room_code}")
async def ladder_websocket(
    websocket: WebSocket,
    room_code: str,
    token: str,
    db: Session = Depends(get_db),
):
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

    is_rejoin = current_user.id in room.players
    if room.state != "lobby" and not is_rejoin:
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Game already in progress"}))
        await websocket.close()
        return
    if len(room.players) >= MAX_PLAYERS and not is_rejoin:
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Room is full"}))
        await websocket.close()
        return

    await websocket.accept()
    room.last_activity = time.time()

    if not is_rejoin:
        min_level = _compute_min_level(db, current_user.id)
        room.players[current_user.id] = PlayerState(
            user_id=current_user.id,
            username=current_user.username,
            profile_picture=getattr(current_user, "profile_picture", None),
            hsk_level=min_level,
            min_level=min_level,
        )
        logger.info("Player %s joined ladder room %s (level %s)",
                    current_user.username, room_code, min_level)
    else:
        room.players[current_user.id].connected = True
        await _broadcast(room, {
            "type": "player_rejoined",
            "user_id": current_user.id,
            "players": room.player_list(),
        })

    room.connections[current_user.id] = websocket

    # Full state to the (re)joiner, lobby update to everyone
    await _send(websocket, _room_state_message(room))
    await _broadcast(room, {
        "type": "lobby_update",
        "room_code": room.room_code,
        "host_id": room.host_id,
        "board_size": room.board_size,
        "players": room.player_list(),
        "state": room.state,
    })

    try:
        while True:
            raw = await websocket.receive_text()
            room.last_activity = time.time()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            mtype = msg.get("type")

            if mtype == "ping":
                await _send(websocket, {"type": "pong"})
                continue

            # ── Raise question level (never below computed floor) ──────────
            if mtype == "set_level" and room.state == "lobby":
                p = room.players[current_user.id]
                requested = int(msg.get("hsk_level", p.min_level))
                p.hsk_level = max(p.min_level, min(6, requested))
                await _broadcast(room, {
                    "type": "lobby_update",
                    "room_code": room.room_code,
                    "host_id": room.host_id,
                    "board_size": room.board_size,
                    "players": room.player_list(),
                    "state": room.state,
                })
                continue

            # ── Host starts the game ────────────────────────────────────────
            if mtype == "start_game" and current_user.id == room.host_id:
                if room.state != "lobby":
                    await _send(websocket, {"type": "error", "message": "Game already started"})
                    continue
                if len(room.players) < MIN_PLAYERS:
                    await _send(websocket, {"type": "error",
                                            "message": f"Need at least {MIN_PLAYERS} players"})
                    continue

                # Per-player question pools at each player's own level
                try:
                    for uid, p in room.players.items():
                        room.question_pools[uid] = generate_level_questions(
                            db, p.hsk_level, QUESTION_POOL_SIZE
                        )
                except ValueError as e:
                    await _send(websocket, {"type": "error", "message": str(e)})
                    continue

                room.ladders, room.snakes = _generate_board(room.board_size)
                room.turn_order = list(room.players.keys())
                random.shuffle(room.turn_order)
                room.turn_idx = 0
                room.final_round = False
                room.finish_order = []
                room.rematch_votes = set()
                for p in room.players.values():
                    p.position = 0
                    p.streak = 0
                    p.correct_count = 0
                    p.wrong_count = 0
                    p.afk_strikes = 0
                    p.forfeited = False
                    p.finished = False
                room.state = "playing"

                if room.game_task and not room.game_task.done():
                    room.game_task.cancel()
                room.game_task = asyncio.create_task(_run_game(room))
                continue

            # ── Gameplay messages (only valid from the player whose turn it is)
            if mtype == "roll":
                if (room.state == "playing"
                        and room.turn.phase == "await_roll"
                        and room.turn.uid == current_user.id):
                    room.turn.rolled = True
                continue

            if mtype == "answer":
                if (room.state == "playing"
                        and room.turn.phase == "await_answer"
                        and room.turn.uid == current_user.id
                        and room.turn.answer is None):
                    try:
                        idx = int(msg.get("index", -1))
                    except (TypeError, ValueError):
                        idx = -1
                    room.turn.answer = idx
                    room.turn.answer_time = time.time()
                continue

            # ── Rematch vote ────────────────────────────────────────────────
            if mtype == "vote_rematch" and room.state == "game_over":
                room.rematch_votes.add(current_user.id)
                connected = set(room.connections.keys())
                voted = len(room.rematch_votes & connected)
                await _broadcast(room, {
                    "type": "rematch_vote_update",
                    "votes": list(room.rematch_votes),
                    "voted_count": voted,
                    "total_needed": len(connected),
                })
                if connected and room.rematch_votes >= connected:
                    room.state = "lobby"
                    room.rematch_votes = set()
                    for p in room.players.values():
                        p.position = 0
                        p.finished = False
                        p.forfeited = False
                    await _broadcast(room, {
                        "type": "lobby_update",
                        "room_code": room.room_code,
                        "host_id": room.host_id,
                        "board_size": room.board_size,
                        "players": room.player_list(),
                        "state": room.state,
                    })
                continue

    except WebSocketDisconnect:
        pass
    finally:
        room.connections.pop(current_user.id, None)
        if current_user.id in room.players:
            if room.state == "lobby":
                # Leaving the lobby removes the player entirely
                room.players.pop(current_user.id, None)
                # Host migration
                if current_user.id == room.host_id and room.players:
                    room.host_id = next(iter(room.players.keys()))
            else:
                room.players[current_user.id].connected = False
        if room.players:
            await _broadcast(room, {
                "type": "player_left",
                "user_id": current_user.id,
                "host_id": room.host_id,
                "players": room.player_list(),
                "state": room.state,
            })
        else:
            if room.game_task and not room.game_task.done():
                room.game_task.cancel()
            rooms.pop(room_code, None)
