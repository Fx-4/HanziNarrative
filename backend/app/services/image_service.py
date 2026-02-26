"""
Image service — tries Pexels first, falls back to Pixabay.

Pexels:  https://www.pexels.com/api/         (free, 200 req/hr, attribution required)
Pixabay: https://pixabay.com/api/docs/        (free, 100 req/min, attribution required)
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
    """Extract the best search keyword from an English translation.

    Examples:
        "to eat, consume"  -> "eat"
        "cat, kitten"      -> "cat"
        "red (color)"      -> "red"
    """
    keyword = english.split(',')[0].split(';')[0].strip()
    if keyword.lower().startswith('to '):
        keyword = keyword[3:]
    if '(' in keyword:
        keyword = keyword[:keyword.index('(')].strip()
    return keyword.strip()


async def _pexels_search(keyword: str) -> Optional[str]:
    """Search Pexels and return a permanent image URL."""
    if not settings.PEXELS_API_KEY:
        return None

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://api.pexels.com/v1/search",
                headers={"Authorization": settings.PEXELS_API_KEY},
                params={"query": keyword, "per_page": 5, "orientation": "landscape"},
            )
            if not response.is_success:
                return None
            photos = response.json().get("photos", [])
            if photos:
                src = photos[0]["src"]
                return src.get("large") or src.get("medium")
    except Exception:
        pass

    return None


async def _pixabay_search(keyword: str) -> Optional[str]:
    """Search Pixabay and return an image URL."""
    if not settings.PIXABAY_API_KEY:
        return None

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://pixabay.com/api/",
                params={
                    "key":        settings.PIXABAY_API_KEY,
                    "q":          keyword,
                    "image_type": "photo",
                    "orientation":"horizontal",
                    "safesearch": "true",
                    "per_page":   5,
                },
            )
            if not response.is_success:
                return None
            hits = response.json().get("hits", [])
            if hits:
                # largeImageURL: 1280px max, more stable than webformatURL (24hr expiry)
                return hits[0].get("largeImageURL") or hits[0].get("webformatURL")
    except Exception:
        pass

    return None


async def get_image_for_word(
    english: str,
    category: Optional[str] = None,
) -> Optional[str]:
    """
    Get the best image URL for a Chinese vocabulary word.

    Priority: Pexels → Pixabay → None
    Skips grammar/function words (particles, conjunctions, etc.)
    """
    if should_skip_image(category):
        return None

    keyword = extract_search_keyword(english)
    if not keyword:
        return None

    # Try Pexels first
    url = await _pexels_search(keyword)
    if url:
        return url

    # Fall back to Pixabay
    return await _pixabay_search(keyword)
