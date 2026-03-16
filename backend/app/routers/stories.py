from typing import List, Optional
from datetime import datetime, timezone
import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, Table, MetaData, text
from pydantic import BaseModel
from .. import models, schemas, auth
from ..database import get_db
from ..rate_limit import check_rate_limit, record_ai_usage, get_usage_stats
from ..services import gemini_service

logger = logging.getLogger(__name__)

# Route AI calls: free providers only (Gemini → Groq → Mistral → OpenRouter → Cohere)
async def _generate_story(*args, **kwargs):
    return await gemini_service.generate_story(*args, **kwargs)

async def _generate_story_quiz(*args, **kwargs):
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
    mode: str = "quick"    # quick (minimal options) or advanced (full customization)
    # --- Advanced mode customization fields ---
    genre: Optional[str] = None           # e.g., "adventure", "romance", "mystery", "comedy", "slice-of-life", "fable"
    tone: Optional[str] = None            # e.g., "humorous", "serious", "heartwarming", "suspenseful"
    setting: Optional[str] = None         # e.g., "modern city", "ancient China", "countryside", "school"
    narrative_perspective: Optional[str] = None  # "first-person", "third-person"
    target_grammar: Optional[List[str]] = None   # specific grammar patterns to include
    target_vocabulary: Optional[List[str]] = None # specific words to use in the story
    include_dialogue: Optional[bool] = None       # whether to include dialogue
    cultural_theme: Optional[str] = None          # e.g., "Spring Festival", "Mid-Autumn", "Tea Culture"


@router.get("/", response_model=List[schemas.Story])
def get_stories(
    hsk_level: Optional[int] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Story).filter(
        models.Story.is_published == True,
        models.Story.soft_deleted_at.is_(None),
    )
    if hsk_level:
        query = query.filter(models.Story.hsk_level == hsk_level)
    if category:
        query = query.filter(models.Story.category == category)
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
        "sentence_validation": get_usage_stats(db, current_user, 'sentence_validation'),
    }


@router.get("/{story_id}", response_model=schemas.Story)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.is_(None),
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@router.get("/{story_id}/words", response_model=List[schemas.HanziWord])
def get_story_words(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.is_(None),
    ).first()
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
        models.Story.author_id == current_user.id,
        models.Story.soft_deleted_at.is_(None),
    ).first()
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")

    # Soft delete — preserve data, just mark as deleted
    db_story.soft_deleted_at = datetime.now(timezone.utc)
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
      - quick: Minimal options — generates a story quickly with basic settings.
      - advanced: Full customization — genre, tone, setting, grammar targets, etc.
    Both modes use the same AI provider (Claude when available, else free cascade).
    """
    # Both modes share the same rate limit
    rate_feature = 'story_generation'
    check_rate_limit(db, current_user, rate_feature)

    try:
        # Build the enriched topic string from advanced fields
        enriched_topic = request.topic or ""
        advanced_instructions = ""

        if request.mode == "advanced":
            parts = []
            if request.genre:
                parts.append(f"Genre: {request.genre}")
            if request.tone:
                parts.append(f"Tone: {request.tone}")
            if request.setting:
                parts.append(f"Setting: {request.setting}")
            if request.narrative_perspective:
                parts.append(f"Narrative perspective: {request.narrative_perspective}")
            if request.include_dialogue is not None:
                parts.append(f"Include dialogue: {'yes, plenty of it' if request.include_dialogue else 'minimal or none'}")
            if request.cultural_theme:
                parts.append(f"Cultural theme to weave in: {request.cultural_theme}")
            if request.target_grammar:
                parts.append(f"Must use these grammar patterns: {', '.join(request.target_grammar)}")
            if request.target_vocabulary:
                parts.append(f"Must incorporate these vocabulary words: {', '.join(request.target_vocabulary)}")
            if parts:
                advanced_instructions = "\n".join(parts)

        # Combine topic with advanced instructions for the AI prompt
        full_topic = enriched_topic
        if advanced_instructions:
            full_topic = f"{enriched_topic}\n\nAdditional creative requirements:\n{advanced_instructions}" if enriched_topic else f"Additional creative requirements:\n{advanced_instructions}"

        # Use same AI routing for both modes
        story_data = await _generate_story(
            hsk_level=request.hsk_level,
            topic=full_topic or None,
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
            is_published=True,  # Auto-publish AI generated stories
            category="ai_generated"
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
    """Stream story generation progress via Server-Sent Events."""

    def sse(data: dict) -> str:
        return f"data: {json.dumps(data)}\n\n"

    async def event_generator():
        rate_feature = 'story_generation'

        # ── Rate limit check ────────────────────────────────────────
        try:
            check_rate_limit(db, current_user, rate_feature)
        except HTTPException as e:
            yield sse({"type": "error", "message": e.detail})
            return

        yield sse({"type": "progress", "step": 1, "message": "Starting AI generation..."})

        try:
            # ── Build enriched topic ─────────────────────────────────
            enriched_topic = request.topic or ""
            advanced_instructions = ""

            if request.mode == "advanced":
                parts = []
                if request.genre:
                    parts.append(f"Genre: {request.genre}")
                if request.tone:
                    parts.append(f"Tone: {request.tone}")
                if request.setting:
                    parts.append(f"Setting: {request.setting}")
                if request.narrative_perspective:
                    parts.append(f"Narrative perspective: {request.narrative_perspective}")
                if request.include_dialogue is not None:
                    parts.append(f"Include dialogue: {'yes, plenty of it' if request.include_dialogue else 'minimal or none'}")
                if request.cultural_theme:
                    parts.append(f"Cultural theme to weave in: {request.cultural_theme}")
                if request.target_grammar:
                    parts.append(f"Must use these grammar patterns: {', '.join(request.target_grammar)}")
                if request.target_vocabulary:
                    parts.append(f"Must incorporate these vocabulary words: {', '.join(request.target_vocabulary)}")
                if parts:
                    advanced_instructions = "\n".join(parts)

            full_topic = enriched_topic
            if advanced_instructions:
                full_topic = (
                    f"{enriched_topic}\n\nAdditional creative requirements:\n{advanced_instructions}"
                    if enriched_topic
                    else f"Additional creative requirements:\n{advanced_instructions}"
                )

            # ── Call AI ──────────────────────────────────────────────
            yield sse({"type": "progress", "step": 2, "message": "AI is writing your story..."})

            story_data = await _generate_story(
                hsk_level=request.hsk_level,
                topic=full_topic or None,
                character_names=request.character_names,
                length=request.length
            )

            # ── Save to DB ───────────────────────────────────────────
            yield sse({"type": "progress", "step": 3, "message": "Saving story..."})

            db_story = models.Story(
                title=story_data.get('title', 'Generated Story'),
                title_english=story_data.get('title_english', ''),
                content=story_data.get('content', ''),
                content_pinyin=story_data.get('content_pinyin', ''),
                english_translation=story_data.get('content_english', ''),
                hsk_level=request.hsk_level,
                author_id=current_user.id,
                is_published=True,
                category="ai_generated"
            )
            db.add(db_story)
            db.commit()
            db.refresh(db_story)

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

            words_used = story_data.get('words_used', [])
            if words_used:
                word_ids = []
                for word_char in words_used:
                    word = db.query(models.HanziWord).filter(
                        models.HanziWord.simplified == word_char,
                        models.HanziWord.hsk_level <= request.hsk_level
                    ).first()
                    if word:
                        word_ids.append(word.id)
                if word_ids:
                    story_words = db.query(models.HanziWord).filter(
                        models.HanziWord.id.in_(word_ids)
                    ).all()
                    db_story.words = story_words
                    db.commit()
                    db.refresh(db_story)

            usage_stats = get_usage_stats(db, current_user, rate_feature)

            # ── Done — send result ───────────────────────────────────
            yield sse({
                "type": "done",
                "story": story_data,
                "story_id": db_story.id,
                "word_count": len(db_story.words),
                "mode": request.mode,
                "usage_stats": usage_stats
            })

        except HTTPException as e:
            yield sse({"type": "error", "message": e.detail})
        except Exception as e:
            logger.error(f"SSE story generation failed: {str(e)}", exc_info=True)
            yield sse({"type": "error", "message": "Failed to generate story. Please try again later."})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable Nginx/Render proxy buffering
            "Connection": "keep-alive",
        }
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
