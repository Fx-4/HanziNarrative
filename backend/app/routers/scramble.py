"""
Sentence Scramble router — extracts sentences from stories and shuffles them.
Zero AI cost — uses existing story data only.
"""

import re
import random
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Story

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scramble", tags=["scramble"])


def split_chinese_words(sentence: str) -> list[str]:
    """
    Split a Chinese sentence into individual characters/words.
    For simplicity, split by character (since Chinese doesn't use spaces).
    Group punctuation with preceding character.
    """
    chars = list(sentence.strip())
    words = []
    for ch in chars:
        if re.match(r'[\u4e00-\u9fff]', ch):
            words.append(ch)
        elif words and re.match(r'[，。！？、；：""''（）《》【】…—]', ch):
            words[-1] += ch  # Attach punctuation to previous word
        # Skip other characters
    return words


@router.get("/sentences")
async def get_scramble_sentences(
    hsk_level: int = 1,
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get shuffled sentences from published stories for the scramble game."""

    stories = db.query(Story).filter(
        Story.hsk_level == hsk_level,
        Story.is_published == True,
    ).all()

    if not stories:
        raise HTTPException(status_code=404, detail="No stories found for this level")

    # Extract sentences from stories
    all_sentences = []
    for story in stories:
        content = story.content or ""
        pinyin = story.content_pinyin or ""
        english = story.content_english or ""

        # Split at Chinese punctuation
        sents = re.split(r'[。！？]', content)
        pinyin_sents = re.split(r'[。！？]', pinyin) if pinyin else []
        english_sents = re.split(r'[.!?]', english) if english else []

        for i, s in enumerate(sents):
            s = s.strip()
            if len(s) < 4 or len(s) > 30:
                continue

            words = split_chinese_words(s)
            if len(words) < 3 or len(words) > 12:
                continue

            # Shuffle words
            shuffled = words.copy()
            attempts = 0
            while shuffled == words and attempts < 10:
                random.shuffle(shuffled)
                attempts += 1

            all_sentences.append({
                "original": s,
                "words": words,
                "shuffled": shuffled,
                "pinyin": pinyin_sents[i].strip() if i < len(pinyin_sents) else "",
                "english": english_sents[i].strip() if i < len(english_sents) else "",
            })

    if not all_sentences:
        raise HTTPException(status_code=404, detail="No suitable sentences found")

    # Randomly select
    random.shuffle(all_sentences)
    selected = all_sentences[:min(count, len(all_sentences))]

    return {"sentences": selected, "total_available": len(all_sentences)}
