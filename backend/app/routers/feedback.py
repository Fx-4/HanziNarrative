from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas, auth
from ..database import get_db
from ..services.ai_provider import generate_json

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=schemas.FeedbackOut, status_code=201)
async def submit_feedback(
    body: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    fb = models.Feedback(
        user_id=current_user.id,
        username=current_user.username,
        type=body.type,
        subject=body.subject,
        message=body.message,
        page_url=body.page_url,
        attachment_url=body.attachment_url,
        element_selector=body.element_selector,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


@router.post("/improve", response_model=schemas.FeedbackImproveResponse)
async def improve_feedback(
    body: schemas.FeedbackImproveRequest,
    _: models.User = Depends(auth.get_current_user),
):
    prompt = f"""You are helping a user write clear, constructive app feedback.

Feedback type: {body.type}
Current subject: "{body.subject}"
Current message: "{body.message}"

Rewrite the message to be clear, specific, and constructive. Preserve the original meaning.
Also suggest a concise subject line (max 60 characters).

Return JSON only, no extra text:
{{"message": "improved message here", "subject": "suggested subject here"}}"""

    try:
        data, _ = await generate_json(prompt, max_tokens=600, temperature=0.4)
        return {
            "message": str(data.get("message", body.message))[:2000],
            "subject": str(data.get("subject", body.subject))[:200],
        }
    except Exception:
        raise HTTPException(status_code=503, detail="AI service unavailable, please try again")


@router.get("/admin", response_model=schemas.FeedbackListResponse)
async def list_feedback(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_admin_user),
):
    q = db.query(models.Feedback)
    if type:
        q = q.filter(models.Feedback.type == type)
    if unread_only:
        q = q.filter(models.Feedback.is_read == False)  # noqa: E712
    total = q.count()
    unread_count = db.query(models.Feedback).filter(models.Feedback.is_read == False).count()  # noqa: E712
    feedbacks = q.order_by(models.Feedback.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"feedbacks": feedbacks, "total": total, "unread_count": unread_count}


@router.patch("/admin/{feedback_id}", response_model=schemas.FeedbackOut)
async def update_feedback(
    feedback_id: int,
    body: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_admin_user),
):
    fb = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if body.is_read is not None:
        fb.is_read = body.is_read
    if body.is_resolved is not None:
        fb.is_resolved = body.is_resolved
    db.commit()
    db.refresh(fb)
    return fb


@router.delete("/admin/{feedback_id}", status_code=204)
async def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_admin_user),
):
    fb = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(fb)
    db.commit()
