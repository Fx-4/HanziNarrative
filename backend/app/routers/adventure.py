"""
Adventure Stories router — AI-powered branching stories.
Uses Claude claude-opus-4-6 when ANTHROPIC_API_KEY is set, falls back to Gemini.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..rate_limit import check_rate_limit, record_ai_usage, get_usage_stats
from ..services import gemini_service, claude_story_service
from app.config import settings

def _use_claude() -> bool:
    return bool(settings.ANTHROPIC_API_KEY)

async def _adventure_start(*args, **kwargs):
    if _use_claude():
        return await claude_story_service.generate_adventure_start(*args, **kwargs)
    return await gemini_service.generate_adventure_start(*args, **kwargs)

async def _adventure_continue(*args, **kwargs):
    if _use_claude():
        return await claude_story_service.generate_adventure_continue(*args, **kwargs)
    return await gemini_service.generate_adventure_continue(*args, **kwargs)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/adventure", tags=["adventure"])


class AdventureStartRequest(BaseModel):
    hsk_level: int = 1
    topic: str = "daily life"


class AdventureContinueRequest(BaseModel):
    story_so_far: str
    chosen_option: str
    hsk_level: int = 1
    step_number: int = 2


@router.post("/start")
async def start_adventure(
    request: AdventureStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Start a new interactive adventure story.
    Rate limited: 3/day, 1/hour per user.
    """
    check_rate_limit(db, current_user, 'adventure_start')

    try:
        result = await _adventure_start(
            hsk_level=request.hsk_level,
            topic=request.topic,
        )

        record_ai_usage(
            db=db,
            user=current_user,
            feature='adventure_start',
            request_data={
                'hsk_level': request.hsk_level,
                'topic': request.topic,
            }
        )

        # Include usage stats so frontend can show remaining quota
        usage_stats = get_usage_stats(db, current_user, 'adventure_start')

        return {
            "adventure": result,
            "usage_stats": usage_stats,
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Adventure start failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start adventure: {str(e)}"
        )


@router.post("/continue")
async def continue_adventure(
    request: AdventureContinueRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Continue an adventure story based on user's choice.
    Rate limited: 10/day, 3/hour per user.
    """
    check_rate_limit(db, current_user, 'adventure_continue')

    try:
        result = await _adventure_continue(
            story_so_far=request.story_so_far,
            chosen_option=request.chosen_option,
            hsk_level=request.hsk_level,
            step_number=request.step_number,
        )

        record_ai_usage(
            db=db,
            user=current_user,
            feature='adventure_continue',
            request_data={
                'hsk_level': request.hsk_level,
                'step_number': request.step_number,
            }
        )

        usage_stats = get_usage_stats(db, current_user, 'adventure_continue')

        return {
            "adventure": result,
            "usage_stats": usage_stats,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Adventure continue failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to continue adventure. Please try again later."
        )


@router.get("/usage-stats")
def get_adventure_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current adventure AI usage stats."""
    return {
        "adventure_start": get_usage_stats(db, current_user, 'adventure_start'),
        "adventure_continue": get_usage_stats(db, current_user, 'adventure_continue'),
    }
