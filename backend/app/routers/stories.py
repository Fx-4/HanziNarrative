from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import models, schemas, auth
from ..database import get_db
from ..rate_limit import check_rate_limit, record_ai_usage, get_usage_stats
from ..services.gemini_service import generate_story

router = APIRouter(prefix="/stories", tags=["stories"])


class StoryGenerateRequest(BaseModel):
    hsk_level: int
    topic: Optional[str] = None
    character_names: Optional[List[str]] = None
    length: str = "short"  # short, medium, long


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


@router.post("/generate")
async def generate_ai_story(
    request: StoryGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new story using AI
    Rate limited to 5 requests per day per user
    """
    # Check rate limit
    check_rate_limit(db, current_user, 'story_generation')

    try:
        # Generate story using Gemini
        story_data = await generate_story(
            hsk_level=request.hsk_level,
            topic=request.topic,
            character_names=request.character_names,
            length=request.length
        )

        # Record AI usage
        record_ai_usage(
            db=db,
            user=current_user,
            feature='story_generation',
            request_data={
                'hsk_level': request.hsk_level,
                'topic': request.topic,
                'length': request.length
            }
        )

        # Get updated usage stats
        usage_stats = get_usage_stats(db, current_user, 'story_generation')

        return {
            "story": story_data,
            "usage_stats": usage_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai-usage-stats")
def get_ai_usage(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI usage statistics for current user"""
    return {
        "story_generation": get_usage_stats(db, current_user, 'story_generation'),
        "sentence_validation": get_usage_stats(db, current_user, 'sentence_validation'),
    }
