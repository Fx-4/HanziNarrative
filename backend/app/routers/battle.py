"""
Multiplayer Battle router — Battle Royale & Team vs Team
Real-time via FastAPI WebSockets, in-memory room state.

Question Types (6 total):
  character_match  – Show 汉字 → pick English meaning
  multiple_choice  – Show English meaning → pick 汉字
  pinyin_match     – Show 汉字 → pick correct pinyin
  tone_select      – Show bare syllable → pick correct tone marks
  sentence_blank   – Show sentence with ___ → pick word that fits
  definition_match – Show a Chinese-language hint/desc → pick the word

Buff/Debuff System:
  After each question reveal there is a 50% chance a power-up fires.
  It is randomly a buff or debuff and targets a random living player.
  Server-side effects are applied immediately; client-side effects are
  signalled via the `buff_event` message and honoured by the frontend.
"""

import asyncio
import json
import logging
import random
import string
import time
from dataclasses import dataclass, field
from typing import Optional, Dict, List

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
MAX_PLAYERS_BATTLE = 20
MAX_PLAYERS_TEAM   = 20
STARTING_LIVES     = 3
QUESTION_TIME_LIMIT = 15   # seconds
REVEAL_PAUSE        = 3.0  # seconds between reveal → next question (longer so buff anim shows)
COUNTDOWN_FROM      = 3
BUFF_CHANCE         = 0.50  # 50% chance of a buff/debuff event per question

# Question type rotation (6 types)
_Q_ROTATION = [
    "character_match",
    "multiple_choice",
    "pinyin_match",
    "tone_select",
    "sentence_blank",
    "definition_match",
]

# ---------------------------------------------------------------------------
# Buff / Debuff definitions
# ---------------------------------------------------------------------------
# Fields: id, name, emoji, description, is_buff, server_effect, duration_rounds
# server_effect values:
#   None               – purely client-side (visual/timing)
#   "double_points"    – next correct answer = +20
#   "shield"           – next wrong answer in BR doesn't cost a life
#   "score_boost_5"    – immediate +5 pts
#   "score_boost_10"   – immediate +10 pts
#   "point_leak_3"     – immediate -3 pts
#   "point_leak_5"     – immediate -5 pts
#   "extra_life"       – +1 life (BR only)
#   "steal_points"     – steal 5 pts from the highest scorer
#   "double_damage"    – next wrong answer loses 2 lives (BR only)
#   "answer_reveal"    – the correct option is highlighted for 2s before disable (client handles)

BUFFS: List[dict] = [
    {
        "id": "double_points",
        "name": "Double Points",
        "emoji": "⚡",
        "description": "Your next correct answer is worth 20 pts!",
        "server_effect": "double_points",
        "duration_rounds": 1,
    },
    {
        "id": "shield",
        "name": "Iron Shield",
        "emoji": "🛡️",
        "description": "You're protected — next wrong answer won't cost a life!",
        "server_effect": "shield",
        "duration_rounds": 1,
    },
    {
        "id": "score_boost",
        "name": "Score Surge",
        "emoji": "🌟",
        "description": "Instant +10 bonus points!",
        "server_effect": "score_boost_10",
        "duration_rounds": 0,
    },
    {
        "id": "extra_life",
        "name": "Extra Life",
        "emoji": "💖",
        "description": "+1 life restored!",
        "server_effect": "extra_life",
        "duration_rounds": 0,
    },
    {
        "id": "time_bonus",
        "name": "Time Warp",
        "emoji": "⏰",
        "description": "You get +7 seconds on the next question!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "answer_reveal",
        "name": "Answer Hint",
        "emoji": "🔍",
        "description": "The correct option briefly glows before the timer starts!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "steal_points",
        "name": "Pickpocket",
        "emoji": "🦊",
        "description": "You steal 5 points from the leading player!",
        "server_effect": "steal_points",
        "duration_rounds": 0,
    },
    {
        "id": "skip_immunity",
        "name": "Skip Immunity",
        "emoji": "🌀",
        "description": "You're immune to the next debuff thrown at you!",
        "server_effect": None,
        "duration_rounds": 2,
    },
]

DEBUFFS: List[dict] = [
    {
        "id": "blind",
        "name": "Blindfolded",
        "emoji": "🙈",
        "description": "Your answer options are shuffled randomly!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "time_cut",
        "name": "Time Pressure",
        "emoji": "⏱️",
        "description": "You get 7 fewer seconds on the next question!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "freeze",
        "name": "Frozen",
        "emoji": "❄️",
        "description": "You can't answer for the first 4 seconds!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "point_leak",
        "name": "Score Drain",
        "emoji": "💸",
        "description": "Oops! -5 points drained from your score!",
        "server_effect": "point_leak_5",
        "duration_rounds": 0,
    },
    {
        "id": "double_damage",
        "name": "Glass Cannon",
        "emoji": "💥",
        "description": "Your next wrong answer costs 2 lives!",
        "server_effect": "double_damage",
        "duration_rounds": 1,
    },
    {
        "id": "reverse_controls",
        "name": "Mirrored",
        "emoji": "🔀",
        "description": "Answer options are displayed in reverse order!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "answer_hidden",
        "name": "Hidden Options",
        "emoji": "🫣",
        "description": "One random wrong option is hidden from you!",
        "server_effect": None,
        "duration_rounds": 1,
    },
    {
        "id": "score_leech",
        "name": "Score Leech",
        "emoji": "🧛",
        "description": "One of your correct answers gives 0 points this round!",
        "server_effect": "score_leech",
        "duration_rounds": 1,
    },
]

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
    # active effects: effect_id → rounds_remaining
    active_effects: Dict[str, int] = field(default_factory=dict)
    # inventory: earned items not yet used
    inventory: List[str] = field(default_factory=list)

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
            "active_effects": dict(self.active_effects),
            "inventory": list(self.inventory),
        }

    def has_effect(self, effect_id: str) -> bool:
        return self.active_effects.get(effect_id, 0) > 0

    def add_effect(self, effect_id: str, duration: int):
        if duration > 0:
            self.active_effects[effect_id] = duration

    def tick_effects(self):
        expired = [k for k, v in self.active_effects.items() if v <= 1]
        for k in expired:
            del self.active_effects[k]
        for k in self.active_effects:
            self.active_effects[k] -= 1


@dataclass
class RoomState:
    room_code: str
    host_id: int
    mode: str                          # "battle_royale" | "team_vs_team"
    hsk_level: int = 1
    num_questions: int = 10
    time_limit: int = 15               # seconds per question
    starting_lives: int = 3            # lives for battle_royale
    question_type: str = "mixed"       # mixed|char_to_meaning|meaning_to_char|pinyin
    buff_mode: str = "both"            # both|buffs_only|debuffs_only|none
    state: str = "lobby"               # lobby|countdown|question|reveal|game_over
    players: dict = field(default_factory=dict)   # user_id -> PlayerState
    questions: list = field(default_factory=list)
    current_q_index: int = 0
    connections: dict = field(default_factory=dict)  # user_id -> WebSocket
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
# Question generation — 6 types
# ---------------------------------------------------------------------------

def _generate_battle_questions(
    db: Session, hsk_level: int, num_questions: int, question_type: str = "mixed"
) -> list:
    all_words = db.query(models.HanziWord).filter(
        models.HanziWord.hsk_level == hsk_level
    ).all()

    if len(all_words) < max(num_questions, 4):
        all_words = db.query(models.HanziWord).filter(
            models.HanziWord.hsk_level <= hsk_level
        ).all()

    if len(all_words) < 4:
        raise HTTPException(status_code=400, detail="Not enough vocabulary for this HSK level")

    n = min(num_questions, len(all_words))
    selected = random.sample(all_words, n)
    questions = []

    for idx, word in enumerate(selected):
        # Determine question type for this slot
        if question_type == "char_to_meaning":
            q_type = "character_match"
        elif question_type == "meaning_to_char":
            q_type = "multiple_choice"
        elif question_type == "pinyin":
            q_type = "pinyin_match"
        elif question_type == "tone_select":
            q_type = "tone_select"
        elif question_type == "sentence_blank":
            q_type = "sentence_blank"
        elif question_type == "definition_match":
            q_type = "definition_match"
        else:  # mixed — cycle through all 6 types
            q_type = _Q_ROTATION[idx % len(_Q_ROTATION)]

        pool = [w for w in all_words if w.id != word.id]
        q = _build_question(idx, word, pool, q_type)
        questions.append(q)

    return questions


def _build_question(idx: int, word, pool: list, q_type: str) -> dict:
    """Build a single question dict for the given type."""

    base = {
        "id": idx,
        "question_type": q_type,
        "chinese": word.simplified,
        "pinyin": word.pinyin,
        "english": word.english,
        "word_id": word.id,
        "hsk_level": word.hsk_level,
    }

    # ── character_match: Show 汉字 → pick English meaning ──────────────────
    if q_type == "character_match":
        wrong = random.sample(pool, min(3, len(pool)))
        correct = word.english
        options = [w.english for w in wrong] + [correct]
        random.shuffle(options)
        return {**base, "options": options, "correct_answer": options.index(correct),
                "prompt_label": "What is the meaning of this character?"}

    # ── multiple_choice: Show English → pick 汉字 ──────────────────────────
    elif q_type == "multiple_choice":
        wrong = random.sample(pool, min(3, len(pool)))
        correct = word.simplified
        options = [w.simplified for w in wrong] + [correct]
        random.shuffle(options)
        return {**base, "options": options, "correct_answer": options.index(correct),
                "prompt_label": "Which character means this?"}

    # ── pinyin_match: Show 汉字 → pick correct pinyin ──────────────────────
    elif q_type == "pinyin_match":
        distinct_pool = [w for w in pool if w.pinyin != word.pinyin]
        wrong = random.sample(distinct_pool if len(distinct_pool) >= 3 else pool, min(3, len(pool)))
        correct = word.pinyin
        raw_options = [w.pinyin for w in wrong] + [correct]
        seen: set = set()
        unique: list = []
        for opt in raw_options:
            if opt not in seen:
                seen.add(opt)
                unique.append(opt)
        if correct not in unique:
            unique[-1] = correct
        while len(unique) < 4:
            unique.append("—")
        options = unique[:4]
        random.shuffle(options)
        return {**base, "options": options, "correct_answer": options.index(correct),
                "prompt_label": "Which pronunciation is correct?"}

    # ── tone_select: Show bare syllable → pick correct toned pinyin ────────
    elif q_type == "tone_select":
        # Strip tone marks to create bare syllable prompt
        import unicodedata
        def strip_tones(text: str) -> str:
            normalized = unicodedata.normalize("NFD", text)
            return "".join(c for c in normalized if unicodedata.category(c) != "Mn").lower()

        correct_pinyin = word.pinyin
        bare = strip_tones(correct_pinyin)

        # Build distractors: prefer words with same/similar bare syllable but different tones
        tone_pool = [w for w in pool if strip_tones(w.pinyin) == bare and w.pinyin != correct_pinyin]
        # Fill the rest with random different-pinyin words
        fill_pool = [w for w in pool if w.pinyin != correct_pinyin and w not in tone_pool]
        random.shuffle(tone_pool)
        random.shuffle(fill_pool)
        wrong_sources = (tone_pool + fill_pool)[:3]
        wrong_pinyins = [w.pinyin for w in wrong_sources]

        options = wrong_pinyins + [correct_pinyin]
        # Deduplicate
        seen = set()
        options_dedup = []
        for o in options:
            if o not in seen:
                seen.add(o)
                options_dedup.append(o)
        while len(options_dedup) < 4:
            options_dedup.append("—")
        options = options_dedup[:4]
        random.shuffle(options)
        correct_idx = options.index(correct_pinyin) if correct_pinyin in options else 0

        return {
            **base,
            "bare_syllable": bare,   # shown as prompt
            "options": options,
            "correct_answer": correct_idx,
            "prompt_label": "Choose the correct tone for this syllable:",
        }

    # ── sentence_blank: Show example sentence with blank → pick word ───────
    elif q_type == "sentence_blank":
        # Try to use example_sentence attribute; fallback to a constructed sentence
        ex_sentence = getattr(word, "example_sentence", None) or ""

        if ex_sentence and word.simplified in ex_sentence:
            display_sentence = ex_sentence.replace(word.simplified, "___", 1)
        else:
            # Construct a minimal display: "{pinyin} means ___"
            display_sentence = f"___ ({word.pinyin})"

        wrong = random.sample(pool, min(3, len(pool)))
        correct = word.simplified
        options = [w.simplified for w in wrong] + [correct]
        random.shuffle(options)
        return {
            **base,
            "display_sentence": display_sentence,
            "options": options,
            "correct_answer": options.index(correct),
            "prompt_label": "Fill in the blank:",
        }

    # ── definition_match: Show English definition → pick 汉字 ──────────────
    else:  # definition_match
        # Build a contextual clue from available fields
        hints = []
        if word.pinyin:
            hints.append(f"Pinyin: {word.pinyin}")
        if word.hsk_level:
            hints.append(f"HSK {word.hsk_level}")

        definition_text = word.english if word.english else word.pinyin
        # Add a visual hint that makes it feel like a definition card
        clue = f'"{definition_text}"'
        if hints:
            clue += f" ({', '.join(hints)})"

        wrong = random.sample(pool, min(3, len(pool)))
        correct = word.simplified
        options = [w.simplified for w in wrong] + [correct]
        random.shuffle(options)
        return {
            **base,
            "definition_clue": clue,
            "options": options,
            "correct_answer": options.index(correct),
            "prompt_label": "Which character matches this definition?",
        }


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
# Buff / Debuff application
# ---------------------------------------------------------------------------

ALL_EFFECTS: List[dict] = BUFFS + DEBUFFS
EFFECT_MAP: Dict[str, dict] = {e['id']: e for e in ALL_EFFECTS}


async def _apply_single_effect(room: RoomState, effect_def: dict, target: PlayerState):
    """Apply one effect to a specific target and broadcast."""
    is_buff = effect_def in BUFFS
    effect = effect_def["server_effect"]

    if effect == "score_boost_5":
        target.score += 5
    elif effect == "score_boost_10":
        target.score += 10
    elif effect == "point_leak_3":
        target.score = max(0, target.score - 3)
    elif effect == "point_leak_5":
        target.score = max(0, target.score - 5)
    elif effect == "extra_life":
        if room.mode == "battle_royale":
            target.lives = min(target.lives + 1, room.starting_lives + 1)
    elif effect == "steal_points":
        active = room.active_players()
        others = [p for p in active if p.user_id != target.user_id]
        if others:
            richest = max(others, key=lambda p: p.score)
            steal = min(5, richest.score)
            richest.score -= steal
            target.score += steal

    duration = effect_def.get("duration_rounds", 0)
    if duration > 0:
        target.add_effect(effect_def["id"], duration)

    await _broadcast(room, {
        "type": "buff_event",
        "target_user_id": target.user_id,
        "target_username": target.username,
        "effect_id": effect_def["id"],
        "effect_name": effect_def["name"],
        "effect_emoji": effect_def["emoji"],
        "is_buff": is_buff,
        "description": effect_def["description"],
        "duration_rounds": duration,
        "players": room.player_list(),
    })


async def _apply_buff_event(room: RoomState):
    """
    Randomly pick a buff/debuff (filtered by room.buff_mode),
    pick a random living player as target, apply, then broadcast.
    """
    if room.buff_mode == "none":
        return
    if random.random() > BUFF_CHANCE:
        return

    # Build eligible pool based on buff_mode
    if room.buff_mode == "buffs_only":
        pool = BUFFS
    elif room.buff_mode == "debuffs_only":
        pool = DEBUFFS
    else:  # "both"
        pool = BUFFS if random.random() < 0.5 else DEBUFFS

    event_def = random.choice(pool)

    active = room.active_players()
    if not active:
        return

    # Check skip_immunity — exclude players immune to debuffs
    is_debuff = event_def not in BUFFS
    eligible = active
    if is_debuff:
        eligible = [p for p in active if not p.has_effect("skip_immunity")]
        if not eligible:
            eligible = active  # immunity blocked everything; apply anyway

    target: PlayerState = random.choice(eligible)

    # ── Apply server-side effects immediately ────────────────────────────
    # The logic for applying effects is now in _apply_single_effect
    await _apply_single_effect(room, event_def, target)


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
                "time_limit": room.time_limit,
                "starting_lives": room.starting_lives,
                **question,
                # Hide correct_answer from payload
                "correct_answer": None,
            })

            # Wait for time limit (check every 0.25s for early all-answered)
            deadline = time.time() + room.time_limit
            while time.time() < deadline:
                active = room.active_players()
                if all(p.answered for p in active):
                    break
                await asyncio.sleep(0.25)

            # ── Reveal phase ──────────────────────────────────────────────
            room.state = "reveal"
            correct_idx = question["correct_answer"]
            results = []

            for p in room.players.values():
                if p.eliminated:
                    results.append({**p.to_dict(), "result": "eliminated"})
                    continue

                answered_correctly = (p.answered and p.answer == correct_idx)

                if answered_correctly:
                    pts = 10
                    if p.has_effect("double_points"):
                        pts = 20
                    elif p.has_effect("score_leech"):
                        pts = 0
                    p.score += pts
                    result = "correct"
                    # Award a random inventory item (70% chance), filtered by buff_mode
                    if room.buff_mode != "none" and random.random() < 0.70:
                        if room.buff_mode == "buffs_only":
                            item_pool = BUFFS
                        elif room.buff_mode == "debuffs_only":
                            item_pool = DEBUFFS
                        else:
                            item_pool = ALL_EFFECTS
                        earned = random.choice(item_pool)
                        p.inventory.append(earned["id"])
                else:
                    if room.mode == "battle_royale":
                        dmg = 2 if p.has_effect("double_damage") else 1
                        if p.has_effect("shield"):
                            dmg = 0
                        p.lives = max(0, p.lives - dmg)
                        if p.lives == 0:
                            p.eliminated = True
                    result = "wrong"

                p.tick_effects()
                results.append({**p.to_dict(), "result": result})

            await _broadcast(room, {
                "type": "reveal",
                "correct_answer": correct_idx,
                "correct_text": question["options"][correct_idx],
                "players": results,
            })

            # Update room player list (scores changed)
            for r in results:
                uid = r["user_id"]
                if uid in room.players:
                    room.players[uid].score = r["score"]
                    room.players[uid].lives = r["lives"]
                    room.players[uid].eliminated = r["eliminated"]
                    room.players[uid].inventory = r["inventory"] # Update inventory from to_dict

            # Fire buff/debuff event — give players a moment to read reveal first
            await asyncio.sleep(1.2)
            await _apply_buff_event(room)

            # Remaining reveal pause
            await asyncio.sleep(REVEAL_PAUSE - 1.2)

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
# REST: list active buffs/debuffs (for UI display)
# ---------------------------------------------------------------------------

@router.get("/effects")
def get_effects(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "buffs": BUFFS,
        "debuffs": DEBUFFS,
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

            # ── PING (heartbeat keep-alive) ─────────────────────────────────
            if mtype == "ping":
                await _send(websocket, {"type": "pong"})
                continue

            # ── START GAME ─────────────────────────────────────────────────
            if mtype == "start_game" and current_user.id == room.host_id:
                if room.state != "lobby":
                    await _send(websocket, {"type": "error", "message": "Game already started"})
                    continue
                if len(room.players) < 2:
                    await _send(websocket, {"type": "error", "message": "Need at least 2 players"})
                    continue

                hsk_level      = int(msg.get("hsk_level", 1))
                num_q          = int(msg.get("num_questions", 10))
                time_limit     = max(5, min(60, int(msg.get("time_limit", 15))))
                starting_lives = max(1, min(5, int(msg.get("lives", 3))))
                question_type  = msg.get("question_type", "mixed")
                if question_type not in (
                    "mixed", "char_to_meaning", "meaning_to_char", "pinyin",
                    "tone_select", "sentence_blank", "definition_match"
                ):
                    question_type = "mixed"

                room.hsk_level      = hsk_level
                room.num_questions  = num_q
                room.time_limit     = time_limit
                room.starting_lives = starting_lives
                room.question_type  = question_type

                buff_mode = msg.get("buff_mode", "both")
                if buff_mode not in ("both", "buffs_only", "debuffs_only", "none"):
                    buff_mode = "both"
                room.buff_mode = buff_mode

                try:
                    room.questions = _generate_battle_questions(db, hsk_level, num_q, question_type)
                except HTTPException as e:
                    await _send(websocket, {"type": "error", "message": e.detail})
                    continue

                # Reset player states
                for p in room.players.values():
                    p.lives = starting_lives
                    p.score = 0
                    p.eliminated = False
                    p.answered = False
                    p.active_effects = {}
                    p.inventory = [] # Reset inventory on game start

                if room.game_task and not room.game_task.done():
                    room.game_task.cancel()
                room.game_task = asyncio.create_task(_run_game(room))

            # ── PLAY AGAIN (return to lobby after game_over) ────────────────
            elif mtype == "play_again" and current_user.id == room.host_id:
                if room.state != "game_over":
                    continue
                # Reset room to lobby
                room.state = "lobby"
                room.questions = []
                room.current_q_index = 0
                for p in room.players.values():
                    p.lives = room.starting_lives
                    p.score = 0
                    p.eliminated = False
                    p.answered = False
                    p.active_effects = {}
                    p.inventory = []
                await _broadcast(room, {
                    "type": "lobby_update",
                    "room_code": room.room_code,
                    "mode": room.mode,
                    "host_id": room.host_id,
                    "players": room.player_list(),
                    "state": "lobby",
                })

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

                    await _broadcast(room, {
                        "type": "player_answered",
                        "user_id": current_user.id,
                        "username": current_user.username,
                    })

            # ── USE EFFECT (player manually activates an inventory item) ──────────
            elif mtype == "use_effect":
                player = room.players.get(current_user.id)
                effect_id = str(msg.get("effect_id", ""))
                target_uid = int(msg.get("target_user_id", current_user.id))

                if not player or player.eliminated or room.state != "question":
                    await _send(websocket, {"type": "error", "message": "Cannot use item now."})
                    continue
                if effect_id not in player.inventory:
                    await _send(websocket, {"type": "error", "message": "Item not in inventory"})
                    continue

                effect_def = EFFECT_MAP.get(effect_id)
                if not effect_def:
                    await _send(websocket, {"type": "error", "message": "Invalid effect ID."})
                    continue

                target = room.players.get(target_uid)
                if not target or target.eliminated:
                    await _send(websocket, {"type": "error", "message": "Invalid target"})
                    continue

                # Debuffs blocked by skip_immunity
                is_debuff = effect_def in DEBUFFS # Check if it's a debuff
                if is_debuff and target.has_effect("skip_immunity"):
                    await _send(websocket, {"type": "error", "message": f"{target.username} is immune to debuffs!"})
                    continue

                # Consume item and apply
                player.inventory.remove(effect_id)
                await _apply_single_effect(room, effect_def, target)

            # ── KICK ──────────────────────────────────────────────────────────────────
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
            if room.game_task and not room.game_task.done():
                room.game_task.cancel()
            rooms.pop(room_code, None)
            logger.info("Room %s cleaned up (empty)", room_code)
