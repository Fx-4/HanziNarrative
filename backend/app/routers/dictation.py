"""
Dictation (听写) router
Provides sentences from existing stories for listen-and-type exercises.
Zero AI cost — purely database queries.
"""

import random
import re
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_user
from ..models import Story, User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dictation", tags=["dictation"])


class DictationSentence(BaseModel):
    text: str
    pinyin: str
    english_hint: str
    story_id: int
    story_title: str


def split_into_sentences(content: str) -> List[str]:
    """Split Chinese content into sentences at punctuation boundaries."""
    # Split at Chinese sentence-ending punctuation
    sentences = re.split(r'(?<=[。！？])', content)
    # Clean up: strip whitespace, remove empty strings, skip very short ones
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) >= 4]
    return sentences


@router.get("/sentences", response_model=List[DictationSentence])
def get_dictation_sentences(
    hsk_level: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get random sentences from published stories for dictation practice.
    No AI cost — purely database.
    """
    # Get stories at the requested HSK level
    stories = db.query(Story).filter(
        Story.hsk_level == hsk_level,
        Story.is_published == True,
    ).all()

    if not stories:
        raise HTTPException(status_code=404, detail=f"No stories found for HSK {hsk_level}")

    all_sentences: List[DictationSentence] = []

    for story in stories:
        sentences = split_into_sentences(story.content)
        pinyin_sentences = []
        if story.content_pinyin:
            pinyin_sentences = split_into_sentences(story.content_pinyin)

        english_sentences = []
        if story.english_translation:
            english_sentences = re.split(r'(?<=[.!?])\s*', story.english_translation)
            english_sentences = [s.strip() for s in english_sentences if s.strip()]

        for i, sentence in enumerate(sentences):
            # Skip sentences that are too long (>60 chars) for dictation
            if len(sentence) > 60:
                continue

            pinyin_hint = ""
            if i < len(pinyin_sentences):
                pinyin_hint = pinyin_sentences[i]

            english_hint = ""
            if i < len(english_sentences):
                english_hint = english_sentences[i]
            elif story.english_translation:
                english_hint = "(Translation available for full story)"

            all_sentences.append(DictationSentence(
                text=sentence,
                pinyin=pinyin_hint,
                english_hint=english_hint,
                story_id=story.id,
                story_title=story.title,
            ))

    if not all_sentences:
        raise HTTPException(status_code=404, detail="No suitable sentences found")

    # Shuffle and limit
    random.shuffle(all_sentences)
    return all_sentences[:limit]
