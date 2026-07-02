"""
Learning Path Router — Structured HSK curriculum progress tracking.
Curriculum content lives in the frontend (curriculum.ts).
This router only stores/retrieves user progress per session.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import User, UserLessonProgress
from ..auth import get_current_user
from ..services.gamification_service import add_xp, update_streak

router = APIRouter(prefix="/learning-path", tags=["learning-path"])

BASE_XP        = 20   # awarded for any session completion
PERFECT_BONUS  = 15   # extra XP when score >= 90
GOOD_BONUS     = 5    # extra XP when score >= 70


# ── Schemas ──────────────────────────────────────────────────────────────────

class CompleteSessionRequest(BaseModel):
    session_id: str   # e.g. "h1-u1-s1"
    unit_id: str      # e.g. "h1-u1"
    hsk_level: int
    score: int        # 0–100
    base_xp: int | None = None  # session XP from curriculum.ts (20–35); clamped server-side


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/progress")
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all completed session records for the current user."""
    rows = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == current_user.id,
            UserLessonProgress.completed == True,  # noqa: E712
        )
        .all()
    )
    return [
        {
            "session_id":   r.session_id,
            "unit_id":      r.unit_id,
            "hsk_level":    r.hsk_level,
            "score":        r.score,
            "xp_earned":    r.xp_earned,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r in rows
    ]


@router.post("/complete")
def complete_session(
    body: CompleteSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a session as completed.
    - First completion: saves record + awards XP.
    - Repeat attempt: updates score if better, no extra XP.
    """
    score = max(0, min(100, body.score))

    # Calculate XP — base comes from the curriculum session definition so the
    # award matches what the UI shows (20/25/30/35 per type); clamp so a
    # tampered client can't inflate it beyond curriculum range
    base = max(15, min(40, body.base_xp)) if body.base_xp is not None else BASE_XP
    bonus = PERFECT_BONUS if score >= 90 else (GOOD_BONUS if score >= 70 else 0)
    xp = base + bonus

    existing = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == current_user.id,
            UserLessonProgress.session_id == body.session_id,
        )
        .first()
    )

    is_new = existing is None

    if is_new:
        row = UserLessonProgress(
            user_id     = current_user.id,
            session_id  = body.session_id,
            unit_id     = body.unit_id,
            hsk_level   = body.hsk_level,
            score       = score,
            xp_earned   = xp,
            completed   = True,
            completed_at = datetime.now(timezone.utc),
        )
        db.add(row)
        db.commit()

        # Award XP and update streak only for new completions
        xp_result    = add_xp(db, current_user, xp, f"Completed session {body.session_id}")
        streak_result = update_streak(db, current_user)
    else:
        # Update score if this attempt is better
        if score > existing.score:
            existing.score = score
            existing.completed_at = datetime.now(timezone.utc)
            db.commit()
        xp_result    = {"xp_gained": 0}
        streak_result = {}

    return {
        "is_new":       is_new,
        "xp_earned":    xp if is_new else 0,
        "score":        score,
        "xp_result":    xp_result,
        "streak_result": streak_result,
    }


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregate stats: sessions completed, XP earned, progress per HSK level."""
    rows = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == current_user.id,
            UserLessonProgress.completed == True,  # noqa: E712
        )
        .all()
    )

    total_sessions = len(rows)
    total_xp       = sum(r.xp_earned for r in rows)

    by_level: dict[str, int] = {}
    for r in rows:
        key = str(r.hsk_level)
        by_level[key] = by_level.get(key, 0) + 1

    return {
        "total_sessions": total_sessions,
        "total_xp":       total_xp,
        "by_hsk_level":   by_level,
    }
