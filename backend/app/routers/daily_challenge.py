"""
Daily Story Challenge Router — Zero AI Cost
Deterministic daily story selection per user.
"""
import hashlib
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Story, DailyChallengeCompletion
from ..auth import get_current_user
from ..services.gamification_service import add_xp, update_streak

router = APIRouter(prefix="/daily-challenge", tags=["daily-challenge"])

DAILY_CHALLENGE_XP = 30


def _get_today_story(user_id: int, db: Session) -> Story | None:
    """Deterministic story selection: hash(user_id + date) % story_count."""
    stories = db.query(Story).filter(
        Story.is_published == True,
        Story.soft_deleted_at.is_(None),
    ).all()
    if not stories:
        return None
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    seed = f"{user_id}-{today_str}"
    hash_val = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    idx = hash_val % len(stories)
    return stories[idx]


def _get_today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


@router.get("/today")
def get_today_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get today's daily challenge story for the current user."""
    story = _get_today_story(current_user.id, db)
    if not story:
        raise HTTPException(status_code=404, detail="No stories available for daily challenge.")

    today = _get_today_str()
    completion = db.query(DailyChallengeCompletion).filter(
        DailyChallengeCompletion.user_id == current_user.id,
        DailyChallengeCompletion.completed_date == today,
    ).first()

    return {
        "story": {
            "id": story.id,
            "title": story.title,
            "title_english": story.title_english,
            "hsk_level": story.hsk_level,
            "content": story.content,
            "content_pinyin": story.content_pinyin,
            "english_translation": story.english_translation,
        },
        "completed": completion is not None,
        "date": today,
    }


@router.post("/complete")
def complete_daily_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark today's daily challenge as complete and award XP."""
    today = _get_today_str()

    # Check if already completed
    existing = db.query(DailyChallengeCompletion).filter(
        DailyChallengeCompletion.user_id == current_user.id,
        DailyChallengeCompletion.completed_date == today,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Daily challenge already completed today.")

    story = _get_today_story(current_user.id, db)
    if not story:
        raise HTTPException(status_code=404, detail="No stories available.")

    # Record completion
    completion = DailyChallengeCompletion(
        user_id=current_user.id,
        story_id=story.id,
        completed_date=today,
        xp_earned=DAILY_CHALLENGE_XP,
    )
    db.add(completion)
    db.commit()

    # Award XP
    xp_result = add_xp(db, current_user, DAILY_CHALLENGE_XP, "Daily challenge completed")

    # Update streak
    streak_result = update_streak(db, current_user)

    return {
        "message": "Daily challenge completed!",
        "xp_earned": DAILY_CHALLENGE_XP,
        "xp_result": xp_result,
        "streak": streak_result,
    }


@router.get("/stats")
def get_challenge_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get daily challenge stats: total completions, current streak, total XP earned."""
    completions = (
        db.query(DailyChallengeCompletion)
        .filter(DailyChallengeCompletion.user_id == current_user.id)
        .order_by(DailyChallengeCompletion.completed_date.desc())
        .all()
    )

    total_completions = len(completions)
    total_xp = sum(c.xp_earned for c in completions)

    # Calculate challenge streak
    streak = 0
    today = datetime.now(timezone.utc).date()
    dates = sorted([c.completed_date for c in completions], reverse=True)

    for i, date_str in enumerate(dates):
        expected = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        if date_str == expected:
            streak += 1
        else:
            break

    return {
        "total_completions": total_completions,
        "challenge_streak": streak,
        "total_xp_earned": total_xp,
    }
