from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

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
