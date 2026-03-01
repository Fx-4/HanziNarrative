"""
AI Conversation Partner Router — Gemini free tier.
Rate limited to stay within free tier: 3 starts/day, 20 replies/day.
"""
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..rate_limit import check_rate_limit, record_ai_usage
from ..services.conversation_service import (
    TOPICS,
    start_conversation,
    reply_to_message,
)

router = APIRouter(prefix="/conversation", tags=["conversation"])


class StartRequest(BaseModel):
    hsk_level: int = 1
    topic: str = "daily_life"


class MessageItem(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ReplyRequest(BaseModel):
    message: str
    hsk_level: int = 1
    history: List[MessageItem] = []


@router.get("/topics")
def get_topics():
    """Get available conversation topics (zero cost)."""
    return TOPICS


@router.post("/start")
async def start(
    req: StartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a new conversation. Rate: 3/day."""
    check_rate_limit(db, current_user, "conversation_start")

    if req.hsk_level < 1 or req.hsk_level > 6:
        raise HTTPException(status_code=400, detail="HSK level must be 1-6")

    result = await start_conversation(req.hsk_level, req.topic)
    record_ai_usage(db, current_user, "conversation_start")
    return result


@router.post("/reply")
async def reply(
    req: ReplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message and get AI reply. Rate: 20/day, 8/hour."""
    check_rate_limit(db, current_user, "conversation_reply")

    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [{"role": m.role, "content": m.content} for m in req.history]
    result = await reply_to_message(req.message, req.hsk_level, history)
    record_ai_usage(db, current_user, "conversation_reply")
    return result
