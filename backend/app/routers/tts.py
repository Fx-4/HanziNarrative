import os
import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from google.cloud import texttospeech
from google.oauth2 import service_account
from ..auth import get_current_user
from ..models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])

CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "google-credentials.json")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "tts_cache")

_tts_client = None


def get_tts_client():
    global _tts_client
    if _tts_client is None:
        creds_path = os.path.abspath(CREDENTIALS_PATH)
        if not os.path.exists(creds_path):
            raise HTTPException(status_code=503, detail="TTS service not configured")
        credentials = service_account.Credentials.from_service_account_file(
            creds_path,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        _tts_client = texttospeech.TextToSpeechClient(credentials=credentials)
    return _tts_client


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

    # Return from cache if available
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            audio_bytes = f.read()
        logger.info(f"TTS cache hit for: {request.text[:20]}")
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Cache-Control": "public, max-age=2592000", "X-Cache": "HIT"},
        )

    try:
        client = get_tts_client()

        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=language,
            name=voice_name,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )

        # Save to cache
        with open(cache_path, "wb") as f:
            f.write(response.audio_content)

        logger.info(f"TTS generated and cached: {request.text[:20]}")
        return Response(
            content=response.audio_content,
            media_type="audio/mpeg",
            headers={"Cache-Control": "public, max-age=2592000", "X-Cache": "MISS"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to synthesize speech")
