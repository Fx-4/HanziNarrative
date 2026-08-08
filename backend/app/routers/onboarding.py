"""
Onboarding routes for new user setup and level assessment
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timezone as dt_timezone
from .. import models, auth
from ..database import get_db
import random

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


# ========== SCHEMAS ==========

class GoalsCreate(BaseModel):
    daily_time_minutes: Optional[int] = Field(None, ge=1, le=480)   # 1 min – 8 hrs
    daily_words: Optional[int] = Field(None, ge=1, le=500)          # 1 – 500 words/day
    target_hsk_level: Optional[int] = Field(None, ge=1, le=6)
    target_date: Optional[date] = None
    weekly_xp: Optional[int] = Field(None, ge=0, le=100_000)


class PreferencesCreate(BaseModel):
    learning_style: Optional[Literal["visual", "auditory", "reading"]] = None
    difficulty_preference: Optional[Literal["easy", "medium", "hard"]] = "medium"
    reminder_enabled: bool = False
    reminder_time: Optional[str] = None
    show_pinyin_by_default: bool = True


class AssessmentAnswer(BaseModel):
    question_id: int
    word_id: int
    hsk_level: int
    user_answer: str | int
    correct_answer: str | int
    is_correct: bool
    time_taken: float  # seconds


class AssessmentSubmit(BaseModel):
    answers: List[AssessmentAnswer]
    total_time: float  # seconds


class OnboardingComplete(BaseModel):
    took_assessment: bool
    determined_hsk_level: int = Field(..., ge=1, le=6)
    goals: GoalsCreate
    preferences: PreferencesCreate


class OnboardingStatus(BaseModel):
    onboarding_completed: bool
    current_step: int
    determined_hsk_level: int
    goals: Optional[Dict] = None
    preferences: Optional[Dict] = None


class QuestionData(BaseModel):
    word_id: int
    hsk_level: int
    chinese: str
    pinyin: str
    english: str


# ========== ENDPOINTS ==========

@router.get("/status", response_model=OnboardingStatus)
def get_onboarding_status(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has completed onboarding"""
    onboarding = db.query(models.UserOnboarding).filter(
        models.UserOnboarding.user_id == current_user.id
    ).first()

    if not onboarding:
        # Backfill onboarding for legacy users that already have learning activity.
        progress_exists = (
            db.query(models.UserProgress.id)
            .filter(models.UserProgress.user_id == current_user.id)
            .first()
            is not None
        )
        story_exists = (
            db.query(models.Story.id)
            .filter(models.Story.author_id == current_user.id)
            .first()
            is not None
        )
        gamification = db.query(models.UserGamification).filter(
            models.UserGamification.user_id == current_user.id
        ).first()
        gamification_exists = bool(
            gamification and (
                (gamification.total_xp or 0) > 0
                or (gamification.total_words_reviewed or 0) > 0
                or (gamification.total_stories_read or 0) > 0
            )
        )
        has_legacy_activity = progress_exists or story_exists or gamification_exists

        max_hsk_level = (
            db.query(func.max(models.HanziWord.hsk_level))
            .join(models.UserProgress, models.UserProgress.word_id == models.HanziWord.id)
            .filter(models.UserProgress.user_id == current_user.id)
            .scalar()
        )
        inferred_level = max(1, min(6, int(max_hsk_level or 1)))

        # Create default onboarding record
        onboarding = models.UserOnboarding(
            user_id=current_user.id,
            onboarding_completed=has_legacy_activity,
            current_step=4 if has_legacy_activity else 0,
            determined_hsk_level=inferred_level,
            completed_at=datetime.now(dt_timezone.utc) if has_legacy_activity else None,
        )
        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)

    return {
        "onboarding_completed": onboarding.onboarding_completed,
        "current_step": onboarding.current_step,
        "determined_hsk_level": onboarding.determined_hsk_level,
        "goals": onboarding.goals,
        "preferences": onboarding.preferences
    }


@router.get("/assessment/questions")
def get_assessment_questions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get adaptive assessment questions pool
    Returns 10 words from each HSK level (1-6) for adaptive selection
    Provides a larger pool for more accurate level determination
    Frontend will implement adaptive algorithm
    """
    questions_pool = []

    for level in range(1, 7):
        # Get 10 random words from each HSK level for better assessment
        words = db.query(models.HanziWord).filter(
            models.HanziWord.hsk_level == level
        ).order_by(func.random()).limit(10).all()

        for word in words:
            questions_pool.append({
                "word_id": word.id,
                "hsk_level": level,
                "chinese": word.simplified,
                "pinyin": word.pinyin,
                "english": word.english
            })

    return {
        "questions_pool": questions_pool,
        "initial_level": 2,  # Start at HSK 2 (middle ground)
        "adaptive_strategy": "performance_based",
        "total_questions": len(questions_pool)
    }


@router.post("/assessment/submit")
def submit_assessment(
    submission: AssessmentSubmit,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit assessment results and determine HSK level
    Algorithm:
    - Calculate highest HSK level where user scored ≥70%
    - Default to HSK 1 if score too low
    - Award XP for completing assessment
    """
    # Re-grade SERVER-SIDE — jangan percaya is_correct/hsk_level dari klien.
    # Cocokkan user_answer dengan english kata sebenarnya & kelompokkan pakai
    # hsk_level asli kata. Menutup celah klien mengirim jawaban benar palsu di
    # level tinggi (integritas XP & penempatan).
    word_ids = [a.word_id for a in submission.answers]
    words = {
        w.id: w
        for w in db.query(models.HanziWord).filter(models.HanziWord.id.in_(word_ids)).all()
    } if word_ids else {}

    def _is_correct(a) -> bool:
        w = words.get(a.word_id)
        if w is None:
            return bool(a.is_correct)  # fallback bila kata tak ada di DB
        return str(a.user_answer).strip().lower() == (w.english or "").strip().lower()

    def _level_of(a) -> int:
        w = words.get(a.word_id)
        return w.hsk_level if w is not None else a.hsk_level

    # Group by server-verified HSK level
    level_performance = {}
    total_correct = 0
    for answer in submission.answers:
        grp = level_performance.setdefault(_level_of(answer), {"correct": 0, "total": 0})
        grp["total"] += 1
        if _is_correct(answer):
            grp["correct"] += 1
            total_correct += 1

    # Determine recommended level
    # Cap at HSK 4: the course (/path) only has content up to HSK 4 — recommending
    # 5/6 would land new users on locked units with nothing to study
    MAX_COURSE_LEVEL = 4
    MIN_SAMPLES = 3  # jangan tentukan level dari 1–2 jawaban beruntung
    determined_level = 1
    for level in sorted(level_performance.keys(), reverse=True):
        perf = level_performance[level]
        if perf["total"] < MIN_SAMPLES:
            continue
        accuracy = perf["correct"] / perf["total"]
        if accuracy >= 0.7:  # 70% threshold
            determined_level = min(level + 1, MAX_COURSE_LEVEL)  # Start one level above mastery
            break

    # Calculate overall score (server-graded)
    total_questions = len(submission.answers)
    score_percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0

    # Update onboarding record
    onboarding = db.query(models.UserOnboarding).filter(
        models.UserOnboarding.user_id == current_user.id
    ).first()

    if not onboarding:
        onboarding = models.UserOnboarding(user_id=current_user.id)
        db.add(onboarding)

    # Idempotency: beri XP hanya saat submit pertama (cegah XP dobel bila di-retry)
    already_assessed = bool(onboarding.took_assessment)

    onboarding.took_assessment = True
    onboarding.assessment_score = score_percentage
    onboarding.assessment_questions_answered = total_questions
    onboarding.assessment_correct_answers = total_correct
    onboarding.determined_hsk_level = determined_level
    onboarding.current_step = 3  # Move to preferences step

    db.commit()
    db.refresh(onboarding)

    # Award XP for completing assessment (sekali saja)
    xp_earned = 0
    if not already_assessed:
        from ..services.gamification_service import add_xp
        xp_result = add_xp(
            db,
            current_user,
            50 + (total_correct * 5),  # 50 base + 5 per correct
            f"Completed placement assessment: {total_correct}/{total_questions} correct"
        )
        xp_earned = xp_result["xp_gained"]

    # Generate personalized message
    if score_percentage >= 90:
        message = f"Excellent! You're ready to start at HSK {determined_level}!"
    elif score_percentage >= 70:
        message = f"Great job! You're ready to start at HSK {determined_level}!"
    elif score_percentage >= 50:
        message = f"Good effort! You'll start at HSK {determined_level}."
    else:
        message = f"Perfect! Starting from the basics at HSK {determined_level} is ideal for building a strong foundation."

    return {
        "determined_level": determined_level,
        "score_percentage": round(score_percentage, 2),
        "total_correct": total_correct,
        "total_questions": total_questions,
        "level_performance": level_performance,
        "xp_earned": xp_earned,
        "message": message
    }


@router.post("/goals")
def save_goals(
    goals: GoalsCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Save user learning goals"""
    onboarding = db.query(models.UserOnboarding).filter(
        models.UserOnboarding.user_id == current_user.id
    ).first()

    if not onboarding:
        onboarding = models.UserOnboarding(user_id=current_user.id)
        db.add(onboarding)

    # Convert to dict and handle date serialization
    goals_dict = goals.model_dump()
    if goals_dict.get('target_date'):
        goals_dict['target_date'] = goals_dict['target_date'].isoformat()

    onboarding.goals = goals_dict
    onboarding.current_step = max(onboarding.current_step, 2)
    db.commit()

    return {"message": "Goals saved successfully", "goals": goals_dict}


@router.post("/skip-assessment")
def skip_assessment(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Skip assessment and start from HSK 1
    """
    onboarding = db.query(models.UserOnboarding).filter(
        models.UserOnboarding.user_id == current_user.id
    ).first()

    if not onboarding:
        onboarding = models.UserOnboarding(user_id=current_user.id)
        db.add(onboarding)

    onboarding.took_assessment = False
    onboarding.determined_hsk_level = 1
    onboarding.current_step = 4  # Skip to preferences
    db.commit()

    return {
        "message": "Starting from HSK 1!",
        "determined_level": 1
    }


@router.post("/complete")
def complete_onboarding(
    completion: OnboardingComplete,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete onboarding process
    - Save all preferences
    - Initialize UserProgress for initial words
    - Award completion XP and achievement
    """
    onboarding = db.query(models.UserOnboarding).filter(
        models.UserOnboarding.user_id == current_user.id
    ).first()

    if not onboarding:
        onboarding = models.UserOnboarding(user_id=current_user.id)
        db.add(onboarding)

    # Convert goals to dict and handle date serialization
    goals_dict = completion.goals.model_dump()
    if goals_dict.get('target_date'):
        goals_dict['target_date'] = goals_dict['target_date'].isoformat()

    # Update onboarding record
    onboarding.took_assessment = completion.took_assessment
    onboarding.determined_hsk_level = completion.determined_hsk_level
    onboarding.goals = goals_dict
    onboarding.preferences = completion.preferences.model_dump()
    onboarding.onboarding_completed = True
    onboarding.completed_at = datetime.now(dt_timezone.utc)
    onboarding.current_step = 5  # Final step

    db.commit()
    db.refresh(onboarding)

    # Initialize learning progress for first batch of words (10 words)
    # Get words from determined level
    initial_words = db.query(models.HanziWord).filter(
        models.HanziWord.hsk_level == completion.determined_hsk_level
    ).order_by(func.random()).limit(10).all()

    for word in initial_words:
        # Check if progress already exists
        existing = db.query(models.UserProgress).filter(
            models.UserProgress.user_id == current_user.id,
            models.UserProgress.word_id == word.id
        ).first()

        if not existing:
            progress = models.UserProgress(
                user_id=current_user.id,
                word_id=word.id,
                mastery_level=0,
                next_review=datetime.now(dt_timezone.utc)
            )
            db.add(progress)

    db.commit()

    # Award completion XP and unlock achievement
    from ..services.gamification_service import add_xp

    # Get or create gamification record
    gamification = db.query(models.UserGamification).filter(
        models.UserGamification.user_id == current_user.id
    ).first()

    if not gamification:
        gamification = models.UserGamification(user_id=current_user.id)
        db.add(gamification)
        db.commit()
        db.refresh(gamification)

    # Create onboarding achievement if doesn't exist
    achievements = gamification.achievements or []
    leveled_up = False

    # Track BEFORE appending so the return value is correct
    achievement_just_unlocked = "onboarding_complete" not in achievements

    if achievement_just_unlocked:
        achievements.append("onboarding_complete")
        gamification.achievements = achievements
        gamification.total_xp += 100  # Bonus XP for achievement
        db.commit()

    # Award completion XP
    xp_result = add_xp(db, current_user, 150, "Completed onboarding journey!")
    leveled_up = xp_result.get("leveled_up", False)

    return {
        "message": "Onboarding completed successfully! Your Chinese learning journey begins now!",
        "xp_earned": xp_result["xp_gained"] + (100 if achievement_just_unlocked else 0),
        "level": xp_result["level"],
        "leveled_up": leveled_up,
        "initial_words_count": len(initial_words),
        "achievement_unlocked": achievement_just_unlocked,
        "redirect_to": "/"
    }
