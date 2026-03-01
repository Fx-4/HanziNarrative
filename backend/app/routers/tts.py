import os
import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, RedirectResponse
from pydantic import BaseModel
from ..auth import get_current_user
from ..models import User
from ..services.tts_provider import synthesize_speech, test_all_tts_providers

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "tts_cache")


def normalize_language(language: str, voice_name: str) -> tuple[str, str]:
    """Map zh-CN to cmn-CN for WaveNet/Neural2 voices."""
    lang = language
    voice = voice_name
    if language == "zh-CN" and ("wavenet" in voice_name.lower() or "neural2" in voice_name.lower()):
        lang = "cmn-CN"
        voice = voice_name.replace("zh-CN-", "cmn-CN-")
    return lang, voice


def get_cache_path(text: str, language: str, voice_name: str, speaking_rate: float) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    key = f"{text}|{language}|{voice_name}|{speaking_rate}"
    filename = hashlib.sha256(key.encode("utf-8")).hexdigest() + ".mp3"
    return os.path.join(CACHE_DIR, filename)


class TTSRequest(BaseModel):
    text: str
    language: str = "cmn-CN"
    voice_name: str = "cmn-CN-Chirp3-HD-Aoede"
    speaking_rate: float = 1.0


@router.post("/synthesize")
async def synthesize(
    request: TTSRequest,
    current_user: User = Depends(get_current_user),
):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long (max 1000 characters)")

    language, voice_name = normalize_language(request.language, request.voice_name)
    cache_path = get_cache_path(request.text, language, voice_name, request.speaking_rate)
    cache_filename = os.path.basename(cache_path)

    # Return redirect to static file if already cached
    if os.path.exists(cache_path):
        logger.info(f"TTS cache hit for: {request.text[:20]}")
        return RedirectResponse(
            url=f"/tts/audio/{cache_filename}",
            status_code=302,
            headers={"X-Cache": "HIT"},
        )

    # Delegate to multi-provider TTS service
    try:
        audio_content, provider_used = await synthesize_speech(
            request.text, language, voice_name, request.speaking_rate
        )
    except RuntimeError as e:
        logger.error(f"All TTS providers failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to synthesize speech — all providers unavailable",
        )

    # Save to cache
    try:
        with open(cache_path, "wb") as f:
            f.write(audio_content)
    except Exception as e:
        logger.warning(f"Failed to write TTS cache: {e}")

    logger.info(f"TTS synthesized via {provider_used}: {request.text[:20]}")

    return Response(
        content=audio_content,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "public, max-age=2592000",
            "X-Cache": "MISS",
            "X-TTS-Provider": provider_used,
        },
    )


@router.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Serve cached audio files."""
    filepath = os.path.join(CACHE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio not found")
    with open(filepath, "rb") as f:
        content = f.read()
    return Response(
        content=content,
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=2592000"},
    )


@router.get("/providers/test")
async def test_providers(current_user: User = Depends(get_current_user)):
    """Test which TTS providers are available and working."""
    results = await test_all_tts_providers()
    return {"providers": results}
