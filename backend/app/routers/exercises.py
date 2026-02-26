"""
Exercise routes for sentence building and validation
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.services.gemini_service import (
    validate_chinese_sentence,
    generate_sentence_exercise
)
from app.auth import get_current_user
from app.models import User
from app.database import get_db
from app.rate_limit import check_rate_limit, record_ai_usage

router = APIRouter(prefix="/exercises", tags=["exercises"])


class SentenceValidationRequest(BaseModel):
    sentence: str
    expected_meaning: Optional[str] = None
    hsk_level: int = 1


class SentenceValidationResponse(BaseModel):
    is_correct: bool
    score: int
    feedback: str
    corrections: List[str]
    grammar_issues: List[str]
    suggestions: List[str]


class ExerciseGenerationRequest(BaseModel):
    words: List[str]
    difficulty: str = "easy"
    hsk_level: int = 1


class ExerciseGenerationResponse(BaseModel):
    prompt: str
    correct_answers: List[str]
    hints: List[str]
    english_translation: str


@router.post("/validate-sentence", response_model=SentenceValidationResponse)
async def validate_sentence(
    request: SentenceValidationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validate a Chinese sentence using AI
    Rate limited to 15 requests per day per user

    Checks grammar, naturalness, and provides detailed feedback
    """
    # Check rate limit
    check_rate_limit(db, current_user, 'sentence_validation')

    try:
        result = await validate_chinese_sentence(
            sentence=request.sentence,
            expected_meaning=request.expected_meaning,
            hsk_level=request.hsk_level
        )

        # Record AI usage
        record_ai_usage(
            db=db,
            user=current_user,
            feature='sentence_validation',
            request_data={
                'sentence': request.sentence,
                'hsk_level': request.hsk_level
            }
        )

        return SentenceValidationResponse(
            is_correct=result.is_correct,
            score=result.score,
            feedback=result.feedback,
            corrections=result.corrections,
            grammar_issues=result.grammar_issues,
            suggestions=result.suggestions
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        import logging
        logging.error(f"Sentence validation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to validate sentence. Please try again later."
        )


@router.post("/generate-exercise", response_model=ExerciseGenerationResponse)
async def generate_exercise(
    request: ExerciseGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a sentence building exercise from given words

    Creates prompts, correct answers, and hints for learning
    """
    try:
        result = await generate_sentence_exercise(
            words=request.words,
            difficulty=request.difficulty,
            hsk_level=request.hsk_level
        )

        return ExerciseGenerationResponse(
            prompt=result.get("prompt", ""),
            correct_answers=result.get("correct_answers", []),
            hints=result.get("hints", []),
            english_translation=result.get("english_translation", "")
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        import logging
        logging.error(f"Exercise generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate exercise. Please try again later."
        )
