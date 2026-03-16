from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db
from ..services.gemini_service import generate_mnemonic
from ..services.image_service import get_image_for_word, should_skip_image

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


# Specific routes must come before path parameter routes
@router.get("/search", response_model=List[schemas.HanziWord])
def search_words(
    q: str,
    hsk_level: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.HanziWord).filter(
        (models.HanziWord.simplified.ilike(f"%{q}%")) |
        (models.HanziWord.pinyin.ilike(f"%{q}%")) |
        (models.HanziWord.english.ilike(f"%{q}%"))
    )
    if hsk_level:
        query = query.filter(models.HanziWord.hsk_level == hsk_level)
    return query.limit(50).all()


@router.get("/word-of-the-day")
def get_word_of_the_day(db: Session = Depends(get_db)):
    """
    Get word of the day - consistent for the same date
    Uses date as seed for deterministic random selection
    """
    # Use today's date as seed for consistent daily word
    today = date.today()
    seed = int(today.strftime("%Y%m%d"))

    # Get total count of words
    total_words = db.query(func.count(models.HanziWord.id)).scalar()

    if not total_words:
        raise HTTPException(status_code=404, detail="No words available")

    # Use seed to select a word deterministically
    word_index = seed % total_words

    # Get the word at that index
    word = db.query(models.HanziWord).offset(word_index).limit(1).first()

    return {
        "word": word,
        "date": today.isoformat(),
        "message": "每日一词 - Word of the Day"
    }


@router.get("/categories/all")
def get_all_categories(db: Session = Depends(get_db)):
    """Get list of all unique categories"""
    categories = db.query(models.HanziWord.category).distinct().filter(
        models.HanziWord.category.isnot(None)
    ).all()
    return [{"value": cat[0], "label": cat[0].title()} for cat in categories if cat[0]]


@router.get("/categories/hsk/{level}")
def get_categories_by_hsk(level: int, db: Session = Depends(get_db)):
    """Get categories available for a specific HSK level"""
    categories = db.query(models.HanziWord.category).distinct().filter(
        models.HanziWord.hsk_level == level,
        models.HanziWord.category.isnot(None)
    ).all()
    return [{"value": cat[0], "label": cat[0].title()} for cat in categories if cat[0]]


@router.get("/hsk/{level}", response_model=List[schemas.HanziWord])
def get_words_by_hsk_level(
    level: int,
    skip: int = 0,
    limit: int = 1000,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.HanziWord).filter(
        models.HanziWord.hsk_level == level
    )
    if category:
        query = query.filter(models.HanziWord.category == category)

    words = query.offset(skip).limit(limit).all()
    return words


@router.get("/{word_id}", response_model=schemas.HanziWord)
def get_word(word_id: int, db: Session = Depends(get_db)):
    word = db.query(models.HanziWord).filter(models.HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    return word


@router.post("/", response_model=schemas.HanziWord)
def create_word(word: schemas.HanziWordCreate, db: Session = Depends(get_db)):
    db_word = models.HanziWord(**word.dict())
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word


@router.get("/{word_id}/mnemonic")
async def get_word_mnemonic(word_id: int, db: Session = Depends(get_db)):
    """
    Generate AI-powered mnemonic for a specific word
    No authentication required - helps all learners
    """
    word = db.query(models.HanziWord).filter(models.HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    try:
        mnemonic_data = await generate_mnemonic(
            hanzi=word.simplified,
            pinyin=word.pinyin,
            english=word.english,
            hsk_level=word.hsk_level
        )
        return mnemonic_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{word_id}/fetch-image")
async def fetch_word_image(
    word_id: int,
    save: bool = True,
    db: Session = Depends(get_db)
):
    """
    Fetch a matching image for a vocabulary word via Pixabay.

    - Returns the stored image_url if one already exists in the database.
    - Otherwise searches Pixabay and (by default) saves the result to DB.
    - Returns {"image_url": "..."} or {"image_url": null} for grammar words.

    Query params:
        save (bool, default True): persist the fetched URL to the database.
    """
    word = db.query(models.HanziWord).filter(models.HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Already stored — return immediately
    if word.image_url:
        return {"image_url": word.image_url, "source": "database"}

    # Grammar/function words don't benefit from images
    if should_skip_image(word.category):
        return {"image_url": None, "source": "skipped"}

    image_url = await get_image_for_word(word.english, word.category)

    if image_url and save:
        word.image_url = image_url
        db.commit()

    return {
        "image_url": image_url,
        "source": "pexels" if image_url else "not_found",
    }

