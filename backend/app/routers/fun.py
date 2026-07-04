"""
Fun router — lightweight morale boosters (Giphy memes for session breaks).

Optional feature: requires GIPHY_API_KEY in .env / Koyeb env vars.
When the key is missing the endpoint reports available=False and the
frontend simply hides the GIF — nothing breaks.
"""

import random
import logging

import httpx
from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..config import settings
from ..models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fun", tags=["fun"])

GIPHY_RANDOM_URL = "https://api.giphy.com/v1/gifs/random"

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


@router.get("/gif")
async def get_fun_gif(
    mood: str = "celebrate",
    current_user: User = Depends(get_current_user),
):
    """Return a random G-rated GIF for the given mood (celebrate/motivate/break)."""
    if not settings.GIPHY_API_KEY:
        return {"available": False, "url": None, "title": None}

    tags = MOOD_TAGS.get(mood, MOOD_TAGS["celebrate"])
    tag = random.choice(tags)

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(GIPHY_RANDOM_URL, params={
                "api_key": settings.GIPHY_API_KEY,
                "tag": tag,
                "rating": "g",
            })
        if resp.status_code != 200:
            logger.warning(f"Giphy returned {resp.status_code}")
            return {"available": False, "url": None, "title": None}

        data = resp.json().get("data") or {}
        images = data.get("images") or {}
        # downsized_medium keeps payloads reasonable on mobile
        url = (
            (images.get("downsized_medium") or {}).get("url")
            or (images.get("original") or {}).get("url")
        )
        return {
            "available": bool(url),
            "url": url,
            "title": data.get("title") or "",
        }
    except httpx.HTTPError as e:
        logger.warning(f"Giphy request failed: {e}")
        return {"available": False, "url": None, "title": None}
