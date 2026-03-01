from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, Table, MetaData, text
from pydantic import BaseModel
from .. import models, schemas, auth
from ..database import get_db
from ..rate_limit import check_rate_limit, record_ai_usage, get_usage_stats
from ..services import gemini_service
from ..services import claude_story_service
from app.config import settings

# Route AI calls: use Claude when ANTHROPIC_API_KEY is set, else fall back to Gemini
def _use_claude() -> bool:
    return bool(settings.ANTHROPIC_API_KEY)

async def _generate_story(*args, **kwargs):
    if _use_claude():
        return await claude_story_service.generate_story(*args, **kwargs)
    return await gemini_service.generate_story(*args, **kwargs)

async def _generate_story_quiz(*args, **kwargs):
    if _use_claude():
        return await claude_story_service.generate_story_quiz(*args, **kwargs)
    return await gemini_service.generate_story_quiz(*args, **kwargs)

router = APIRouter(prefix="/stories", tags=["stories"])

# Define the story_bookmarks table
metadata = MetaData()
story_bookmarks = Table('story_bookmarks', metadata, autoload_with=None)


class StoryGenerateRequest(BaseModel):
    hsk_level: int
    topic: Optional[str] = None
    character_names: Optional[List[str]] = None
    length: str = "short"  # short, medium, long
    mode: str = "quick"    # quick (free cascade) or advanced (Claude premium)


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


@router.get("/ai-usage-stats")
def get_ai_usage(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI usage statistics for current user"""
    return {
        "story_generation": get_usage_stats(db, current_user, 'story_generation'),
        "story_generation_simple": get_usage_stats(db, current_user, 'story_generation_simple'),
        "sentence_validation": get_usage_stats(db, current_user, 'sentence_validation'),
    }


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
    Generate a new story using AI and save it to database.
    Modes:
      - quick: Uses free AI cascade (Gemini→Groq→OpenRouter). 10/day limit.
      - advanced: Uses Claude for premium quality stories. 5/day limit.
    """
    # Determine rate-limit feature based on mode
    is_advanced = request.mode == "advanced"
    rate_feature = 'story_generation' if is_advanced else 'story_generation_simple'

    # Check rate limit
    check_rate_limit(db, current_user, rate_feature)

    try:
        # Route to appropriate provider
        if is_advanced and _use_claude():
            story_data = await claude_story_service.generate_story(
                hsk_level=request.hsk_level,
                topic=request.topic,
                character_names=request.character_names,
                length=request.length
            )
        else:
            # Quick mode always uses free cascade, advanced falls back here if no Claude key
            story_data = await gemini_service.generate_story(
                hsk_level=request.hsk_level,
                topic=request.topic,
                character_names=request.character_names,
                length=request.length
            )

        # Save generated story to database
        db_story = models.Story(
            title=story_data.get('title', 'Generated Story'),
            title_english=story_data.get('title_english', ''),
            content=story_data.get('content', ''),
            content_pinyin=story_data.get('content_pinyin', ''),  # Save context-aware pinyin from AI
            english_translation=story_data.get('content_english', ''),
            hsk_level=request.hsk_level,
            author_id=current_user.id,
            is_published=True  # Auto-publish AI generated stories
        )
        db.add(db_story)
        db.commit()
        db.refresh(db_story)

        # Record AI usage
        record_ai_usage(
            db=db,
            user=current_user,
            feature=rate_feature,
            request_data={
                'hsk_level': request.hsk_level,
                'topic': request.topic,
                'length': request.length,
                'mode': request.mode,
                'story_id': db_story.id
            }
        )

        # Associate words with the story
        words_used = story_data.get('words_used', [])
        if words_used:
            # Find word IDs from simplified characters
            word_ids = []
            for word_char in words_used:
                word = db.query(models.HanziWord).filter(
                    models.HanziWord.simplified == word_char,
                    models.HanziWord.hsk_level <= request.hsk_level
                ).first()
                if word:
                    word_ids.append(word.id)

            # Associate words with story using the many-to-many relationship
            if word_ids:
                story_words = db.query(models.HanziWord).filter(
                    models.HanziWord.id.in_(word_ids)
                ).all()
                db_story.words = story_words
                db.commit()
                db.refresh(db_story)

        # Get updated usage stats for the mode that was used
        usage_stats = get_usage_stats(db, current_user, rate_feature)

        return {
            "story": story_data,
            "story_id": db_story.id,
            "word_count": len(db_story.words),
            "mode": request.mode,
            "usage_stats": usage_stats
        }

    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        import logging
        logging.error(f"Story generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate story. Please try again later."
        )


@router.post("/generate-stream")
async def generate_ai_story_stream(
    request: StoryGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream a Claude-generated story token-by-token via Server-Sent Events.
    The client receives JSON chunks as they arrive, giving a live "typing" feel.
    Requires ANTHROPIC_API_KEY to be configured (falls back to 404 otherwise).
    """
    if not _use_claude():
        raise HTTPException(
            status_code=404,
            detail="Streaming requires ANTHROPIC_API_KEY to be configured."
        )

    # Check rate limit (same quota as non-streaming)
    check_rate_limit(db, current_user, 'story_generation')

    return StreamingResponse(
        claude_story_service.stream_story_chunks(
            hsk_level=request.hsk_level,
            topic=request.topic,
            character_names=request.character_names,
            length=request.length,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{story_id}/quiz")
async def generate_quiz_for_story(
    story_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered quiz questions specific to this story
    No authentication required - anyone can get quiz for a story
    """
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    try:
        quiz_data = await _generate_story_quiz(
            story_title=story.title,
            story_content=story.content,
            hsk_level=story.hsk_level
        )
        return quiz_data
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        import logging
        logging.error(f"Quiz generation failed for story {story_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate quiz. Please try again later."
        )


# Bookmark endpoints
@router.post("/{story_id}/bookmark", status_code=status.HTTP_201_CREATED)
def bookmark_story(
    story_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a story"""
    # Check if story exists
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    # Check if already bookmarked
    existing = db.execute(
        text("SELECT 1 FROM story_bookmarks WHERE user_id = :user_id AND story_id = :story_id"),
        {"user_id": current_user.id, "story_id": story_id}
    ).first()

    if existing:
        return {"message": "Story already bookmarked"}

    # Add bookmark
    db.execute(
        text("INSERT INTO story_bookmarks (user_id, story_id) VALUES (:user_id, :story_id)"),
        {"user_id": current_user.id, "story_id": story_id}
    )
    db.commit()

    return {"message": "Story bookmarked successfully"}


@router.delete("/{story_id}/bookmark", status_code=status.HTTP_204_NO_CONTENT)
def unbookmark_story(
    story_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Remove bookmark from a story"""
    result = db.execute(
        text("DELETE FROM story_bookmarks WHERE user_id = :user_id AND story_id = :story_id"),
        {"user_id": current_user.id, "story_id": story_id}
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return None


@router.get("/bookmarks/my-bookmarks", response_model=List[schemas.Story])
def get_my_bookmarks(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookmarked stories for current user"""
    bookmarked_story_ids = db.execute(
        text("SELECT story_id FROM story_bookmarks WHERE user_id = :user_id ORDER BY created_at DESC"),
        {"user_id": current_user.id}
    ).fetchall()

    if not bookmarked_story_ids:
        return []

    story_ids = [row[0] for row in bookmarked_story_ids]
    stories = db.query(models.Story).filter(models.Story.id.in_(story_ids)).all()

    return stories


@router.get("/{story_id}/is-bookmarked")
def check_if_bookmarked(
    story_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a story is bookmarked by current user"""
    bookmarked = db.execute(
        text("SELECT 1 FROM story_bookmarks WHERE user_id = :user_id AND story_id = :story_id"),
        {"user_id": current_user.id, "story_id": story_id}
    ).first()

    return {"is_bookmarked": bookmarked is not None}


@router.post("/admin/regenerate-all-pinyin")
async def regenerate_all_story_pinyin(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to regenerate context-aware pinyin for all existing stories
    that don't have content_pinyin yet
    """
    from pinyin import get as pinyin_get

    # Get all stories without content_pinyin
    stories_without_pinyin = db.query(models.Story).filter(
        (models.Story.content_pinyin == None) | (models.Story.content_pinyin == '')
    ).all()

    if not stories_without_pinyin:
        return {
            "message": "All stories already have pinyin",
            "updated_count": 0
        }

    updated_count = 0

    for story in stories_without_pinyin:
        try:
            # Use pinyin library with better context handling
            # This is not perfect but better than nothing for old stories
            import pypinyin

            # Get pinyin with heteronym handling (multiple pronunciations)
            pinyin_list = pypinyin.lazy_pinyin(
                story.content,
                style=pypinyin.Style.TONE,
                neutral_tone_with_five=False,
                errors='ignore'
            )

            # Join with spaces
            content_pinyin = ' '.join(pinyin_list)

            # Update story
            story.content_pinyin = content_pinyin
            updated_count += 1

        except Exception as e:
            print(f"Failed to generate pinyin for story {story.id}: {e}")
            continue

    # Commit all updates
    db.commit()

    return {
        "message": f"Successfully regenerated pinyin for {updated_count} stories",
        "updated_count": updated_count,
        "total_stories_checked": len(stories_without_pinyin)
    }
