from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/", response_model=List[schemas.UserProgress])
def get_user_progress(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id
    ).all()
    return progress


@router.post("/", response_model=schemas.UserProgress)
def update_progress(
    progress_data: schemas.UserProgressCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.word_id == progress_data.word_id
    ).first()

    if existing:
        existing.familiarity_level = progress_data.familiarity_level
        existing.review_count += 1
        existing.last_reviewed = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_progress = models.UserProgress(
            user_id=current_user.id,
            word_id=progress_data.word_id,
            familiarity_level=progress_data.familiarity_level,
            review_count=1
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return new_progress
