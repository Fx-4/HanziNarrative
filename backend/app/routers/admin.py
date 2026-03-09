from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

TRASH_RETENTION_DAYS = 30


# ── Schemas ────────────────────────────────────────────────────────────────────

class AdminUserOut(schemas.User):
    google_id: Optional[str] = None
    soft_deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminStoryOut(schemas.Story):
    author_username: Optional[str] = None
    soft_deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SystemStats(BaseModel):
    total_users: int
    total_stories: int
    published_stories: int
    total_ai_requests: int
    total_vocabulary: int
    new_users_today: int
    new_users_this_week: int
    stories_by_hsk: dict
    ai_usage_by_feature: dict


class AIUsageEntry(BaseModel):
    feature: str
    count: int
    total_tokens: int


class UserListResponse(BaseModel):
    users: List[AdminUserOut]
    total: int
    page: int
    page_size: int


class StoryListResponse(BaseModel):
    stories: List[AdminStoryOut]
    total: int
    page: int
    page_size: int


# ── Trash purge helper ─────────────────────────────────────────────────────────

def _purge_expired_trash(db: Session) -> None:
    """Hard-delete items that have been in the trash for more than TRASH_RETENTION_DAYS."""
    cutoff = datetime.utcnow() - timedelta(days=TRASH_RETENTION_DAYS)

    # Stories first (no cascades on story side that need ordering)
    db.query(models.Story).filter(
        models.Story.soft_deleted_at.isnot(None),
        models.Story.soft_deleted_at < cutoff,
    ).delete(synchronize_session=False)

    # Users — must cascade in correct FK order before deleting
    expired_users = (
        db.query(models.User)
        .filter(
            models.User.soft_deleted_at.isnot(None),
            models.User.soft_deleted_at < cutoff,
        )
        .all()
    )
    for user in expired_users:
        uid = user.id
        db.query(models.Story).filter(models.Story.author_id == uid).delete(synchronize_session=False)
        db.query(models.UserProgress).filter(models.UserProgress.user_id == uid).delete(synchronize_session=False)
        db.query(models.VocabularySet).filter(models.VocabularySet.user_id == uid).delete(synchronize_session=False)
        db.query(models.WritingProgress).filter(models.WritingProgress.user_id == uid).delete(synchronize_session=False)
        db.query(models.TypingProgress).filter(models.TypingProgress.user_id == uid).delete(synchronize_session=False)
        db.query(models.AIUsage).filter(models.AIUsage.user_id == uid).delete(synchronize_session=False)
        db.query(models.QuizResult).filter(models.QuizResult.user_id == uid).delete(synchronize_session=False)
        db.query(models.UserGamification).filter(models.UserGamification.user_id == uid).delete(synchronize_session=False)
        db.query(models.UserOnboarding).filter(models.UserOnboarding.user_id == uid).delete(synchronize_session=False)
        db.query(models.DailyChallengeCompletion).filter(models.DailyChallengeCompletion.user_id == uid).delete(synchronize_session=False)
        db.query(models.PasswordResetToken).filter(models.PasswordResetToken.user_id == uid).delete(synchronize_session=False)
        db.delete(user)

    db.commit()


def _build_story_out(story: models.Story, db: Session) -> AdminStoryOut:
    author = db.query(models.User).filter(models.User.id == story.author_id).first()
    return AdminStoryOut(
        id=story.id,
        title=story.title,
        title_english=story.title_english,
        content=story.content,
        content_pinyin=story.content_pinyin,
        english_translation=story.english_translation,
        hsk_level=story.hsk_level,
        author_id=story.author_id,
        is_published=story.is_published,
        created_at=story.created_at,
        updated_at=story.updated_at,
        soft_deleted_at=story.soft_deleted_at,
        author_username=author.username if author else None,
    )


# ── Active-record endpoints ────────────────────────────────────────────────────

@router.get("/stats", response_model=SystemStats)
def get_system_stats(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    active_users = db.query(models.User).filter(models.User.soft_deleted_at.is_(None))
    active_stories = db.query(models.Story).filter(models.Story.soft_deleted_at.is_(None))

    total_users = active_users.count()
    total_stories = active_stories.count()
    published_stories = active_stories.filter(models.Story.is_published == True).count()
    total_ai_requests = db.query(func.count(models.AIUsage.id)).scalar()
    total_vocabulary = db.query(func.count(models.HanziWord.id)).scalar()

    new_users_today = active_users.filter(models.User.created_at >= today_start).count()
    new_users_this_week = active_users.filter(models.User.created_at >= week_start).count()

    hsk_rows = (
        active_stories
        .with_entities(models.Story.hsk_level, func.count(models.Story.id))
        .group_by(models.Story.hsk_level)
        .all()
    )
    stories_by_hsk = {str(row[0]): row[1] for row in hsk_rows}

    ai_rows = (
        db.query(models.AIUsage.feature, func.count(models.AIUsage.id))
        .group_by(models.AIUsage.feature)
        .all()
    )
    ai_usage_by_feature = {row[0]: row[1] for row in ai_rows}

    return SystemStats(
        total_users=total_users or 0,
        total_stories=total_stories or 0,
        published_stories=published_stories or 0,
        total_ai_requests=total_ai_requests or 0,
        total_vocabulary=total_vocabulary or 0,
        new_users_today=new_users_today or 0,
        new_users_this_week=new_users_this_week or 0,
        stories_by_hsk=stories_by_hsk,
        ai_usage_by_feature=ai_usage_by_feature,
    )


@router.get("/users", response_model=UserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    query = db.query(models.User).filter(models.User.soft_deleted_at.is_(None))
    if search:
        term = f"%{search}%"
        query = query.filter(
            (models.User.username.ilike(term)) |
            (models.User.email.ilike(term)) |
            (models.User.full_name.ilike(term))
        )
    total = query.count()
    users = query.order_by(desc(models.User.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return UserListResponse(users=users, total=total, page=page, page_size=page_size)


@router.put("/users/{user_id}/toggle-admin", response_model=AdminUserOut)
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.soft_deleted_at.is_(None),
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.soft_deleted_at.is_(None),
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.soft_deleted_at = datetime.utcnow()
    db.commit()


@router.get("/stories", response_model=StoryListResponse)
def list_stories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    hsk_level: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    query = db.query(models.Story).filter(models.Story.soft_deleted_at.is_(None))
    if search:
        term = f"%{search}%"
        query = query.filter(
            (models.Story.title.ilike(term)) |
            (models.Story.title_english.ilike(term))
        )
    if hsk_level:
        query = query.filter(models.Story.hsk_level == hsk_level)

    total = query.count()
    stories = query.order_by(desc(models.Story.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    results = [_build_story_out(s, db) for s in stories]
    return StoryListResponse(stories=results, total=total, page=page, page_size=page_size)


@router.put("/stories/{story_id}/toggle-publish", response_model=AdminStoryOut)
def toggle_story_publish(
    story_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.is_(None),
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.is_published = not story.is_published
    db.commit()
    db.refresh(story)
    return _build_story_out(story, db)


@router.delete("/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(
    story_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.is_(None),
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.soft_deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.get("/ai-usage")
def get_ai_usage(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    total = db.query(func.count(models.AIUsage.id)).scalar()
    rows = (
        db.query(models.AIUsage)
        .order_by(desc(models.AIUsage.timestamp))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    results = []
    for row in rows:
        user = db.query(models.User).filter(models.User.id == row.user_id).first()
        results.append({
            "id": row.id,
            "user_id": row.user_id,
            "username": user.username if user else "unknown",
            "feature": row.feature,
            "tokens_used": row.tokens_used,
            "timestamp": row.timestamp.isoformat() if row.timestamp else None,
        })
    return {"entries": results, "total": total or 0, "page": page, "page_size": page_size}


# ── Trash endpoints ────────────────────────────────────────────────────────────

@router.get("/trash/users", response_model=UserListResponse)
def list_trash_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    _purge_expired_trash(db)
    query = db.query(models.User).filter(models.User.soft_deleted_at.isnot(None))
    if search:
        term = f"%{search}%"
        query = query.filter(
            (models.User.username.ilike(term)) |
            (models.User.email.ilike(term)) |
            (models.User.full_name.ilike(term))
        )
    total = query.count()
    users = query.order_by(desc(models.User.soft_deleted_at)).offset((page - 1) * page_size).limit(page_size).all()
    return UserListResponse(users=users, total=total, page=page, page_size=page_size)


@router.get("/trash/stories", response_model=StoryListResponse)
def list_trash_stories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    hsk_level: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    _purge_expired_trash(db)
    query = db.query(models.Story).filter(models.Story.soft_deleted_at.isnot(None))
    if search:
        term = f"%{search}%"
        query = query.filter(
            (models.Story.title.ilike(term)) |
            (models.Story.title_english.ilike(term))
        )
    if hsk_level:
        query = query.filter(models.Story.hsk_level == hsk_level)

    total = query.count()
    stories = query.order_by(desc(models.Story.soft_deleted_at)).offset((page - 1) * page_size).limit(page_size).all()
    results = [_build_story_out(s, db) for s in stories]
    return StoryListResponse(stories=results, total=total, page=page, page_size=page_size)


@router.post("/trash/users/{user_id}/restore", response_model=AdminUserOut)
def restore_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.soft_deleted_at.isnot(None),
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in trash")
    user.soft_deleted_at = None
    db.commit()
    db.refresh(user)
    return user


@router.post("/trash/stories/{story_id}/restore", response_model=AdminStoryOut)
def restore_story(
    story_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.isnot(None),
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found in trash")
    story.soft_deleted_at = None
    db.commit()
    db.refresh(story)
    return _build_story_out(story, db)


@router.delete("/trash/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def permanent_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.soft_deleted_at.isnot(None),
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in trash")

    uid = user.id
    db.query(models.Story).filter(models.Story.author_id == uid).delete(synchronize_session=False)
    db.query(models.UserProgress).filter(models.UserProgress.user_id == uid).delete(synchronize_session=False)
    db.query(models.VocabularySet).filter(models.VocabularySet.user_id == uid).delete(synchronize_session=False)
    db.query(models.WritingProgress).filter(models.WritingProgress.user_id == uid).delete(synchronize_session=False)
    db.query(models.TypingProgress).filter(models.TypingProgress.user_id == uid).delete(synchronize_session=False)
    db.query(models.AIUsage).filter(models.AIUsage.user_id == uid).delete(synchronize_session=False)
    db.query(models.QuizResult).filter(models.QuizResult.user_id == uid).delete(synchronize_session=False)
    db.query(models.UserGamification).filter(models.UserGamification.user_id == uid).delete(synchronize_session=False)
    db.query(models.UserOnboarding).filter(models.UserOnboarding.user_id == uid).delete(synchronize_session=False)
    db.query(models.DailyChallengeCompletion).filter(models.DailyChallengeCompletion.user_id == uid).delete(synchronize_session=False)
    db.query(models.PasswordResetToken).filter(models.PasswordResetToken.user_id == uid).delete(synchronize_session=False)
    db.delete(user)
    db.commit()


@router.delete("/trash/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def permanent_delete_story(
    story_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    story = db.query(models.Story).filter(
        models.Story.id == story_id,
        models.Story.soft_deleted_at.isnot(None),
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found in trash")
    db.delete(story)
    db.commit()


@router.post("/trash/purge", status_code=status.HTTP_204_NO_CONTENT)
def purge_trash(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_admin_user),
):
    """Manually trigger purge of all items past the retention period."""
    _purge_expired_trash(db)
