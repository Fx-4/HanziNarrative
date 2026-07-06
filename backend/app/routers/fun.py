"""
Fun router — morale-booster GIFs (Giphy) for the session completion screen.

GIFs are cached in the `fun_gifs` table: every GIF fetched from Giphy is saved to
a pool, and the serve endpoint returns from that pool most of the time instead of
calling Giphy. This:
  - saves the rate-limited beta-key quota,
  - keeps GIFs working when Giphy is unreachable or Koyeb is cold-starting,
  - lets admins curate the pool (approve / reject / delete) from the admin panel.

Optional feature: without GIPHY_API_KEY the pool simply never grows from Giphy,
but any admin-added / previously-cached GIFs are still served.
"""

import random
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from ..auth import get_current_user, get_admin_user
from ..config import settings
from ..database import get_db
from .. import models

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fun", tags=["fun"])

GIPHY_RANDOM_URL = "https://api.giphy.com/v1/gifs/random"

# Keep the pool at least this big per mood before relying purely on cache
MIN_POOL_PER_MOOD = 8
# Chance to fetch a fresh GIF (and grow the pool) even when the pool is healthy
FRESH_CHANCE = 0.15

# Tag pools keep results varied — Giphy random endpoint returns one GIF per tag
MOOD_TAGS: dict[str, list[str]] = {
    "celebrate": [
        "celebration", "well done", "you did it", "victory dance",
        "happy dance", "awesome", "high five", "congratulations",
    ],
    "motivate": [
        "you can do it", "keep going", "never give up", "motivation",
        "try again", "almost there", "cheer up",
    ],
    "break": [
        "funny cat", "funny panda", "relax", "coffee break", "wholesome meme",
    ],
}


# ── Schemas ─────────────────────────────────────────────────────────────────────

class GifOut(BaseModel):
    id: int
    giphy_id: str | None
    url: str
    title: str
    mood: str
    is_approved: bool
    times_served: int

    class Config:
        from_attributes = True


class GifUpdate(BaseModel):
    is_approved: bool | None = None
    mood: str | None = None
    title: str | None = None


# ── Giphy fetch + cache helpers ─────────────────────────────────────────────────

async def _fetch_from_giphy(mood: str) -> dict | None:
    """Fetch one random G-rated GIF from Giphy for a mood. Returns None on any failure."""
    if not settings.GIPHY_API_KEY:
        return None
    tag = random.choice(MOOD_TAGS.get(mood, MOOD_TAGS["celebrate"]))
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(GIPHY_RANDOM_URL, params={
                "api_key": settings.GIPHY_API_KEY,
                "tag": tag,
                "rating": "g",
            })
        if resp.status_code != 200:
            logger.warning(f"Giphy returned {resp.status_code}")
            return None
        data = resp.json().get("data") or {}
        images = data.get("images") or {}
        url = (
            (images.get("downsized_medium") or {}).get("url")
            or (images.get("original") or {}).get("url")
        )
        if not url:
            return None
        # Strip Giphy's per-request query params so the same GIF dedupes cleanly
        clean_url = url.split("?")[0]
        return {"giphy_id": data.get("id"), "url": clean_url, "title": data.get("title") or ""}
    except httpx.HTTPError as e:
        logger.warning(f"Giphy request failed: {e}")
        return None


def _save_gif(db: Session, mood: str, g: dict) -> models.FunGif:
    """Insert a fetched GIF into the pool (dedupe by giphy_id). Returns the row."""
    if g.get("giphy_id"):
        existing = db.query(models.FunGif).filter(models.FunGif.giphy_id == g["giphy_id"]).first()
        if existing:
            return existing
    gif = models.FunGif(
        giphy_id=g.get("giphy_id"),
        url=g["url"],
        title=g.get("title") or "",
        mood=mood,
        is_approved=True,
    )
    db.add(gif)
    db.commit()
    db.refresh(gif)
    return gif


# ── Serve endpoint (user-facing) ────────────────────────────────────────────────

@router.get("/gif")
async def get_fun_gif(
    mood: str = "celebrate",
    fresh: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return a GIF for the mood — mostly from the cached pool, occasionally fresh.

    `fresh=true` (the "another one" button) always tries Giphy first for variety.
    Falls back to the cached pool whenever Giphy is unavailable.
    """
    mood = mood if mood in MOOD_TAGS else "celebrate"

    approved = db.query(models.FunGif).filter(
        models.FunGif.mood == mood,
        models.FunGif.is_approved.is_(True),
    )
    pool_count = approved.count()

    want_fresh = fresh or pool_count < MIN_POOL_PER_MOOD or random.random() < FRESH_CHANCE

    served: models.FunGif | None = None
    if want_fresh:
        g = await _fetch_from_giphy(mood)
        if g:
            served = _save_gif(db, mood, g)

    # Fall back to the cached pool (Giphy down / rate-limited / cold start / no key)
    if served is None and pool_count > 0:
        served = approved.order_by(func.random()).first()

    if served is None:
        return {"available": False, "url": None, "title": None}

    served.times_served = (served.times_served or 0) + 1
    db.commit()
    return {"available": True, "url": served.url, "title": served.title or ""}


# ── Admin CRUD ──────────────────────────────────────────────────────────────────

@router.get("/admin/gifs")
def admin_list_gifs(
    mood: str | None = None,
    approved: bool | None = None,
    page: int = 1,
    page_size: int = 24,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    """List cached GIFs with filters + pagination for the admin curation panel."""
    q = db.query(models.FunGif)
    if mood:
        q = q.filter(models.FunGif.mood == mood)
    if approved is not None:
        q = q.filter(models.FunGif.is_approved.is_(approved))

    total = q.count()
    items = (
        q.order_by(models.FunGif.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    all_gifs = db.query(models.FunGif)
    counts = {
        "total": all_gifs.count(),
        "approved": all_gifs.filter(models.FunGif.is_approved.is_(True)).count(),
        "by_mood": {
            m: db.query(models.FunGif).filter(models.FunGif.mood == m).count()
            for m in MOOD_TAGS
        },
    }
    return {
        "gifs": [GifOut.model_validate(g) for g in items],
        "total": total,
        "counts": counts,
    }


@router.patch("/admin/gifs/{gif_id}", response_model=GifOut)
def admin_update_gif(
    gif_id: int,
    payload: GifUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    """Approve/reject, re-tag mood, or edit title of a cached GIF."""
    gif = db.query(models.FunGif).filter(models.FunGif.id == gif_id).first()
    if not gif:
        raise HTTPException(status_code=404, detail="GIF not found")
    if payload.is_approved is not None:
        gif.is_approved = payload.is_approved
    if payload.mood is not None and payload.mood in MOOD_TAGS:
        gif.mood = payload.mood
    if payload.title is not None:
        gif.title = payload.title
    db.commit()
    db.refresh(gif)
    return GifOut.model_validate(gif)


@router.delete("/admin/gifs/{gif_id}")
def admin_delete_gif(
    gif_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    """Remove a GIF from the pool entirely."""
    gif = db.query(models.FunGif).filter(models.FunGif.id == gif_id).first()
    if not gif:
        raise HTTPException(status_code=404, detail="GIF not found")
    db.delete(gif)
    db.commit()
    return {"deleted": True}


@router.post("/admin/gifs/fetch")
async def admin_fetch_gifs(
    mood: str = "celebrate",
    count: int = 5,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    """Manually stock the pool with fresh GIFs from Giphy (admin 'pull' button)."""
    mood = mood if mood in MOOD_TAGS else "celebrate"
    count = max(1, min(count, 20))
    if not settings.GIPHY_API_KEY:
        raise HTTPException(status_code=503, detail="GIPHY_API_KEY not configured")

    added = 0
    for _ in range(count):
        g = await _fetch_from_giphy(mood)
        if not g:
            continue
        is_new = not (
            g.get("giphy_id")
            and db.query(models.FunGif).filter(models.FunGif.giphy_id == g["giphy_id"]).first()
        )
        _save_gif(db, mood, g)
        if is_new:
            added += 1

    total = db.query(models.FunGif).filter(models.FunGif.mood == mood).count()
    return {"added": added, "requested": count, "pool_total_for_mood": total}
