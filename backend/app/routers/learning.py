"""
Learning routes for Learn/Review/Test modes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User, HanziWord
from app.services.learning_service import LearningService
from app.services.gamification_service import record_word_review
from app import schemas

router = APIRouter(prefix="/learning", tags=["learning"])


class SeedRequest(BaseModel):
    simplified_chars: List[str]


class ReviewRequest(BaseModel):
    word_id: int
    quality: int  # 0-5 rating


class ReviewResponse(BaseModel):
    success: bool
    mastery_level: int
    next_review_days: int
    message: str


class CourseResultItem(BaseModel):
    zh: str
    correct: bool


class CourseResultsRequest(BaseModel):
    results: List[CourseResultItem]


class WordImagesRequest(BaseModel):
    chars: List[str]


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


@router.post("/seed")
def seed_words_from_session(
    request: SeedRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Seed words from a completed LearningSession into the SRS queue.
    Creates UserProgress entries for words not yet tracked.
    """
    seeded = LearningService.seed_words_from_session(
        db=db,
        user=current_user,
        simplified_chars=request.simplified_chars,
    )
    return {"seeded": seeded, "total": len(request.simplified_chars)}


@router.post("/course-results")
def record_course_results(
    request: CourseResultsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Feed per-word results from a completed course session into the SRS.
    Each answer becomes an SM-2 review: correct → quality 4, wrong → quality 2,
    so hard words resurface sooner in Review instead of starting from zero.
    No gamification here — session XP is already awarded by /learning-path/complete.
    """
    updated = 0
    for item in request.results[:100]:  # sane cap per session
        word = db.query(HanziWord).filter(HanziWord.simplified == item.zh).first()
        if not word:
            continue
        LearningService.record_review(
            db=db,
            user=current_user,
            word_id=word.id,
            quality=4 if item.correct else 2,
        )
        updated += 1
    return {"updated": updated, "total": len(request.results)}


# Only categories where a stock photo genuinely depicts the word. Abstract
# words (greetings, particles, pronouns, verbs, grammar…) get mismatched
# photos from the keyword-based Pexels fetch — worse than no image at all.
VISUAL_CATEGORIES = {
    "noun", "food", "transport", "place", "nature", "body", "clothing",
    "home", "object", "weather", "school", "education", "media",
    "people", "person",
}


@router.post("/word-images")
def get_word_images(
    request: WordImagesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return image URLs for the given simplified characters (course intro cards)."""
    chars = request.chars[:50]
    rows = (
        db.query(HanziWord.simplified, HanziWord.image_url)
        .filter(
            HanziWord.simplified.in_(chars),
            HanziWord.image_url.isnot(None),
            HanziWord.category.in_(VISUAL_CATEGORIES),
        )
        .all()
    )
    return {"images": {simplified: url for simplified, url in rows if url}}


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

    # Record for gamification (XP, streaks, achievements)
    is_correct = request.quality >= 3
    is_perfect = request.quality == 5
    gamification_result = record_word_review(db, current_user, is_correct, is_perfect)

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


@router.get("/stats/all")
def get_all_learning_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Single-query endpoint: returns overall + all 6 HSK level stats in one call."""
    return LearningService.get_all_learning_stats(db=db, user=current_user)


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
