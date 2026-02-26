"""
Image service using Pexels API for vocabulary word images.

Pexels is FREE — register at https://www.pexels.com/api/ (no credit card)
Free tier: 200 requests/hour, 20,000 requests/month
Attribution required: display "Photos provided by Pexels" with link.
"""
from typing import Optional
import httpx
from ..config import settings

# Word categories that don't benefit from visual illustrations
SKIP_IMAGE_CATEGORIES = {
    'particle', 'pronoun', 'conjunction', 'preposition',
    'interjection', 'auxiliary', 'numeral',
}


def should_skip_image(category: Optional[str]) -> bool:
    """Return True if image is not meaningful for this word category."""
    if not category:
        return False
    return category.lower() in SKIP_IMAGE_CATEGORIES


def extract_search_keyword(english: str) -> str:
    """Extract the best Pexels search keyword from an English translation.

    Examples:
        "to eat, consume"  -> "eat"
        "cat, kitten"      -> "cat"
        "red (color)"      -> "red"
        "go (to a place)"  -> "go"
    """
    # Take first term before comma or semicolon
    keyword = english.split(',')[0].split(';')[0].strip()

    # Strip verb "to " prefix:  "to eat"  →  "eat"
    if keyword.lower().startswith('to '):
        keyword = keyword[3:]

    # Strip parenthetical notes:  "red (color)"  →  "red"
    if '(' in keyword:
        keyword = keyword[:keyword.index('(')].strip()

    return keyword.strip()


async def _pexels_search(keyword: str) -> Optional[str]:
    """Internal: search Pexels and return the best image URL."""
    if not settings.PEXELS_API_KEY:
        return None

    headers = {
        "Authorization": settings.PEXELS_API_KEY,
    }
    params = {
        "query":       keyword,
        "per_page":    5,
        "orientation": "landscape",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://api.pexels.com/v1/search",
                headers=headers,
                params=params,
            )
            if not response.is_success:
                return None
            photos = response.json().get("photos", [])
            if photos:
                # src.large: 940×650px, permanent URL (no expiry)
                return photos[0]["src"].get("large") or photos[0]["src"].get("medium")
    except Exception:
        pass

    return None


async def get_image_for_word(
    english: str,
    category: Optional[str] = None,
) -> Optional[str]:
    """
    Get the best Pexels image URL for a Chinese vocabulary word.

    - Skips grammar/function words (particles, conjunctions, etc.)
    - Returns None if no image found or Pexels key not configured
    """
    if should_skip_image(category):
        return None

    keyword = extract_search_keyword(english)
    if not keyword:
        return None

    return await _pexels_search(keyword)
