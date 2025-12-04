from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get("/", response_model=List[schemas.Story])
def get_stories(
    hsk_level: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Story).filter(models.Story.is_published == True)
    if hsk_level:
        query = query.filter(models.Story.hsk_level == hsk_level)
    stories = query.offset(skip).limit(limit).all()
    return stories


@router.get("/{story_id}", response_model=schemas.Story)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@router.get("/{story_id}/words", response_model=List[schemas.HanziWord])
def get_story_words(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story.words


@router.post("/", response_model=schemas.Story)
def create_story(
    story: schemas.StoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_story = models.Story(
        **story.dict(),
        author_id=current_user.id
    )
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


@router.put("/{story_id}", response_model=schemas.Story)
def update_story(
    story_id: int,
    story: schemas.StoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.author_id == current_user.id
    ).first()
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")

    for key, value in story.dict().items():
        setattr(db_story, key, value)

    db.commit()
    db.refresh(db_story)
    return db_story


@router.delete("/{story_id}")
def delete_story(
    story_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.author_id == current_user.id
    ).first()
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")

    db.delete(db_story)
    db.commit()
    return {"message": "Story deleted successfully"}
