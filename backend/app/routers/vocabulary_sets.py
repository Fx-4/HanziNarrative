from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/vocabulary-sets", tags=["vocabulary-sets"])


@router.get("/", response_model=List[schemas.VocabularySet])
def get_vocabulary_sets(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    sets = db.query(models.VocabularySet).filter(
        models.VocabularySet.user_id == current_user.id
    ).all()
    return sets


@router.post("/", response_model=schemas.VocabularySet)
def create_vocabulary_set(
    vocab_set: schemas.VocabularySetCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = models.VocabularySet(
        **vocab_set.dict(),
        user_id=current_user.id
    )
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    return db_set


@router.post("/{set_id}/words/{word_id}")
def add_word_to_set(
    set_id: int,
    word_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    vocab_set = db.query(models.VocabularySet).filter(
        models.VocabularySet.id == set_id,
        models.VocabularySet.user_id == current_user.id
    ).first()
    if not vocab_set:
        raise HTTPException(status_code=404, detail="Vocabulary set not found")

    word = db.query(models.HanziWord).filter(models.HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    if word not in vocab_set.words:
        vocab_set.words.append(word)
        db.commit()

    return {"message": "Word added to set successfully"}


@router.delete("/{set_id}/words/{word_id}")
def remove_word_from_set(
    set_id: int,
    word_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    vocab_set = db.query(models.VocabularySet).filter(
        models.VocabularySet.id == set_id,
        models.VocabularySet.user_id == current_user.id
    ).first()
    if not vocab_set:
        raise HTTPException(status_code=404, detail="Vocabulary set not found")

    word = db.query(models.HanziWord).filter(models.HanziWord.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    if word in vocab_set.words:
        vocab_set.words.remove(word)
        db.commit()

    return {"message": "Word removed from set successfully"}
