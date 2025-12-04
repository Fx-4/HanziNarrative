"""
Learning routes for Learn/Review/Test modes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.services.learning_service import LearningService
from app import schemas

router = APIRouter(prefix="/learning", tags=["learning"])


class ReviewRequest(BaseModel):
    word_id: int
    quality: int  # 0-5 rating


class ReviewResponse(BaseModel):
    success: bool
    mastery_level: int
    next_review_days: int
    message: str


@router.get("/words/new")
def get_new_words(
    hsk_level: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get new words for learning (Learn mode)
    """
    words = LearningService.get_words_for_learning(
        db=db,
        user=current_user,
        hsk_level=hsk_level,
        limit=limit,
        category=category
    )

    return {
        "mode": "learn",
        "hsk_level": hsk_level,
        "category": category,
        "words": words,
        "count": len(words)
    }


@router.get("/words/review")
def get_review_words(
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get words due for review (Review mode)
    """
    reviews = LearningService.get_words_for_review(
        db=db,
        user=current_user,
        hsk_level=hsk_level
    )

    return {
        "mode": "review",
        "hsk_level": hsk_level,
        "reviews": reviews,
        "count": len(reviews)
    }


@router.get("/words/test")
def get_test_words(
    hsk_level: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get words for testing (Test mode)
    """
    test_words = LearningService.get_words_for_test(
        db=db,
        user=current_user,
        hsk_level=hsk_level,
        limit=limit,
        category=category
    )

    return {
        "mode": "test",
        "hsk_level": hsk_level,
        "category": category,
        "words": test_words,
        "count": len(test_words)
    }


@router.post("/review", response_model=ReviewResponse)
def record_review(
    request: ReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a review and update spaced repetition schedule
    Quality scale: 0=wrong, 1=hard, 2=difficult, 3=good, 4=easy, 5=perfect
    """
    if request.quality < 0 or request.quality > 5:
        raise HTTPException(status_code=400, detail="Quality must be between 0 and 5")

    progress = LearningService.record_review(
        db=db,
        user=current_user,
        word_id=request.word_id,
        quality=request.quality
    )

    # Generate feedback message
    if request.quality >= 4:
        message = "Excellent! You know this word well!"
    elif request.quality == 3:
        message = "Good job! Keep practicing."
    elif request.quality == 2:
        message = "Not bad, but needs more review."
    else:
        message = "Keep trying! Practice makes perfect."

    return ReviewResponse(
        success=True,
        mastery_level=progress.mastery_level,
        next_review_days=progress.interval,
        message=message
    )


@router.get("/stats")
def get_learning_stats(
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get learning statistics for the current user
    """
    stats = LearningService.get_learning_stats(
        db=db,
        user=current_user,
        hsk_level=hsk_level
    )

    return {
        "hsk_level": hsk_level if hsk_level else "all",
        "stats": stats
    }


@router.get("/review-count")
def get_review_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the count of words due for review (lightweight endpoint for notifications)
    """
    from datetime import datetime, timezone
    from app.models import UserProgress

    now = datetime.now(timezone.utc)
    count = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.next_review <= now
    ).count()

    return {
        "count": count
    }


@router.get("/progress/{word_id}")
def get_word_progress(
    word_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress for a specific word
    """
    from app.models import UserProgress, HanziWord

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.word_id == word_id
    ).first()

    if not progress:
        return {
            "word_id": word_id,
            "started": False,
            "mastery_level": 0,
            "correct_count": 0,
            "incorrect_count": 0
        }

    word = db.query(HanziWord).filter(HanziWord.id == word_id).first()

    return {
        "word_id": word_id,
        "word": word,
        "started": True,
        "mastery_level": progress.mastery_level,
        "correct_count": progress.correct_count,
        "incorrect_count": progress.incorrect_count,
        "last_reviewed": progress.last_reviewed,
        "next_review": progress.next_review,
        "interval": progress.interval
    }
