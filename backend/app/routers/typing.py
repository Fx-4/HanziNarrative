"""
Typing Practice Router
API endpoints for typing practice (pinyin, IME, speed modes)
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user
from app.models import User, HanziWord
from app.schemas import (
    HanziWord as HanziWordSchema,
    TypingAttemptCreate,
    TypingProgress as TypingProgressSchema,
    TypingProgressWithWord,
    TypingStatsResponse
)
from app.services.typing_service import TypingService


router = APIRouter(prefix="/typing", tags=["typing"])


@router.get("/words", response_model=List[HanziWordSchema])
async def get_words_for_practice(
    hsk_level: int = 1,
    mode: str = 'pinyin',
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get words for typing practice by HSK level and mode

    - Prioritizes new words (not yet practiced in this mode)
    - Falls back to words with low mastery if needed
    - Returns up to `limit` words

    **Modes:**
    - `pinyin`: Type pinyin with tone marks
    - `ime`: Simulate Chinese IME (type pinyin, select character)
    - `speed`: Speed typing challenge
    """
    if hsk_level < 1 or hsk_level > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    if mode not in ['pinyin', 'ime', 'speed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode must be 'pinyin', 'ime', or 'speed'"
        )

    words = TypingService.get_words_for_practice(
        db=db,
        user=current_user,
        hsk_level=hsk_level,
        mode=mode,
        limit=limit
    )

    return words


@router.post("/attempt", response_model=TypingProgressSchema)
async def record_typing_attempt(
    attempt: TypingAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a typing practice attempt

    - Updates progress tracking for the specific mode
    - Calculates mode-specific metrics (pinyin accuracy, WPM, IME accuracy)
    - Calculates mastery level
    - Returns updated progress

    **Mode-specific fields:**
    - Pinyin mode: `tone_errors` (positions of incorrect tones)
    - IME mode: `ime_attempts` (number of candidate selections)
    - Speed mode: `wpm` (words per minute)
    """
    # Verify word exists
    word = db.query(HanziWord).filter(HanziWord.id == attempt.word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Word with id {attempt.word_id} not found"
        )

    # Validate mode
    if attempt.mode not in ['pinyin', 'ime', 'speed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode must be 'pinyin', 'ime', or 'speed'"
        )

    # Record the attempt
    progress = TypingService.record_attempt(
        db=db,
        user=current_user,
        word_id=attempt.word_id,
        mode=attempt.mode,
        is_correct=attempt.is_correct,
        time_taken=attempt.time_taken,
        typed_text=attempt.typed_text,
        expected_text=attempt.expected_text,
        wpm=attempt.wpm,
        ime_attempts=attempt.ime_attempts,
        tone_errors=attempt.tone_errors
    )

    return progress


@router.get("/progress", response_model=List[TypingProgressSchema])
async def get_typing_progress(
    mode: Optional[str] = None,
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's typing progress

    - Optionally filter by mode and/or HSK level
    - Returns all typing progress records matching the filters
    """
    if hsk_level and (hsk_level < 1 or hsk_level > 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    if mode and mode not in ['pinyin', 'ime', 'speed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode must be 'pinyin', 'ime', or 'speed'"
        )

    progress_list = TypingService.get_user_progress(
        db=db,
        user=current_user,
        mode=mode,
        hsk_level=hsk_level
    )

    return progress_list


@router.get("/stats", response_model=TypingStatsResponse)
async def get_typing_statistics(
    mode: Optional[str] = None,
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get typing practice statistics

    - Total words practiced
    - Average accuracy
    - WPM metrics (average and best)
    - Mastery breakdown (new/in-progress/mastered)
    - Optionally filter by mode and/or HSK level
    """
    if hsk_level and (hsk_level < 1 or hsk_level > 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HSK level must be between 1 and 6"
        )

    if mode and mode not in ['pinyin', 'ime', 'speed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode must be 'pinyin', 'ime', or 'speed'"
        )

    stats = TypingService.get_statistics(
        db=db,
        user=current_user,
        mode=mode,
        hsk_level=hsk_level
    )

    return stats


@router.get("/stats-stream")
async def get_typing_statistics_stream(
    mode: Optional[str] = None,
    hsk_level: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stream typing stats payload via SSE."""

    def sse(data: dict) -> str:
        return f"data: {json.dumps(jsonable_encoder(data))}\\n\\n"

    async def event_generator():
        try:
            yield sse({"type": "progress", "message": "Loading typing stats..."})
            payload = await get_typing_statistics(mode=mode, hsk_level=hsk_level, current_user=current_user, db=db)
            yield sse({"type": "done", "data": payload})
        except HTTPException as e:
            yield sse({"type": "error", "message": e.detail})
        except Exception:
            yield sse({"type": "error", "message": "Failed to load typing stats"})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@router.get("/word/{word_id}/progress/{mode}", response_model=Optional[TypingProgressSchema])
async def get_word_progress(
    word_id: int,
    mode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get typing progress for a specific word and mode

    - Returns progress if exists
    - Returns None if word not yet practiced in this mode
    """
    # Verify word exists
    word = db.query(HanziWord).filter(HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Word with id {word_id} not found"
        )

    if mode not in ['pinyin', 'ime', 'speed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode must be 'pinyin', 'ime', or 'speed'"
        )

    progress = TypingService.get_progress_by_word(
        db=db,
        user=current_user,
        word_id=word_id,
        mode=mode
    )

    return progress
