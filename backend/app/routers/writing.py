"""
Writing Practice Router
API endpoints for character writing practice
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user
from app.models import User, HanziWord
from app.schemas import (
    HanziWord as HanziWordSchema,
    WritingAttemptCreate,
    WritingProgress as WritingProgressSchema,
    WritingProgressWithWord,
    WritingStatsResponse
)
from app.services.writing_service import WritingService


router = APIRouter(prefix="/writing", tags=["writing"])


@router.get("/characters", response_model=List[HanziWordSchema])
async def get_characters_for_practice(
    hsk_level: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get characters for writing practice by HSK level

    - Prioritizes new characters (not yet practiced)
    - Falls back to characters with low mastery if needed
    - Returns up to `limit` characters
    """
    if hsk_level < 1 or hsk_level > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    characters = WritingService.get_characters_for_practice(
        db=db,
        user=current_user,
        hsk_level=hsk_level,
        limit=limit
    )

    return characters


@router.post("/attempt", response_model=WritingProgressSchema)
async def record_writing_attempt(
    attempt: WritingAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a writing practice attempt

    - Updates progress tracking
    - Calculates mastery level
    - Returns updated progress
    """
    # Verify word exists
    word = db.query(HanziWord).filter(HanziWord.id == attempt.word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Word with id {attempt.word_id} not found"
        )

    # Validate accuracy score
    if attempt.accuracy_score < 0 or attempt.accuracy_score > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accuracy score must be between 0 and 100"
        )

    # Record the attempt
    progress = WritingService.record_attempt(
        db=db,
        user=current_user,
        word_id=attempt.word_id,
        accuracy_score=attempt.accuracy_score,
        time_taken=attempt.time_taken,
        stroke_accuracy=attempt.stroke_accuracy
    )

    return progress


@router.get("/progress", response_model=List[WritingProgressSchema])
async def get_writing_progress(
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's writing progress

    - Optionally filter by HSK level
    - Returns all writing progress records
    """
    if hsk_level and (hsk_level < 1 or hsk_level > 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    progress_list = WritingService.get_user_progress(
        db=db,
        user=current_user,
        hsk_level=hsk_level
    )

    return progress_list


@router.get("/stats", response_model=WritingStatsResponse)
async def get_writing_statistics(
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get writing practice statistics

    - Total characters practiced
    - Average accuracy
    - Mastery breakdown (new/in-progress/mastered)
    - Optionally filter by HSK level
    """
    if hsk_level and (hsk_level < 1 or hsk_level > 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    stats = WritingService.get_statistics(
        db=db,
        user=current_user,
        hsk_level=hsk_level
    )

    return stats


@router.get("/character/{word_id}/progress", response_model=Optional[WritingProgressSchema])
async def get_character_progress(
    word_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get writing progress for a specific character

    - Returns progress if exists
    - Returns None if character not yet practiced
    """
    # Verify word exists
    word = db.query(HanziWord).filter(HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Word with id {word_id} not found"
        )

    progress = WritingService.get_progress_by_character(
        db=db,
        user=current_user,
        word_id=word_id
    )

    return progress
