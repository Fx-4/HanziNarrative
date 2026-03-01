"""
Multi-Provider TTS Service — Cascading fallback chain.

Priority order (best quality first, free fallback):
  1. Google Cloud TTS  (highest quality, paid/free-tier quota)
  2. Edge TTS          (free, neural quality, no API key, no limits)

If both fail, the frontend falls back to browser speechSynthesis.
"""
import io
import os
import json
import logging
from typing import Optional

from google.cloud import texttospeech
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "google-credentials.json")

# ──────────────────────────────────────────────
# Voice mapping: Google Cloud → Edge TTS
# ──────────────────────────────────────────────

GOOGLE_TO_EDGE_VOICE = {
    "cmn-CN-Chirp3-HD-Aoede": "zh-CN-XiaoxiaoNeural",   # female, most natural
    "cmn-CN-Standard-A": "zh-CN-XiaoyiNeural",           # female
    "cmn-CN-Standard-B": "zh-CN-YunjianNeural",          # male, narrator
    "cmn-CN-Standard-C": "zh-CN-YunxiNeural",            # male, young
    "cmn-CN-Standard-D": "zh-CN-YunyangNeural",          # male, news
}

EDGE_FALLBACK_VOICES = [
    "zh-CN-XiaoxiaoNeural",
    "zh-CN-XiaoyiNeural",
    "zh-CN-YunjianNeural",
    "zh-CN-YunxiNeural",
    "zh-CN-YunyangNeural",
]

GOOGLE_FALLBACK_VOICES = [
    ("cmn-CN", "cmn-CN-Standard-A"),
    ("cmn-CN", "cmn-CN-Standard-B"),
    ("cmn-CN", "cmn-CN-Standard-C"),
    ("cmn-CN", "cmn-CN-Standard-D"),
]


def _speaking_rate_to_edge(speaking_rate: float) -> str:
    """Convert Google TTS speaking_rate (float) to Edge TTS rate (string).

    Google: 1.0 = normal, 0.5 = half speed, 2.0 = double speed
    Edge:   "+0%" = normal, "-50%" = half speed, "+100%" = double speed
    """
    pct = int((speaking_rate - 1.0) * 100)
    return f"+{pct}%" if pct >= 0 else f"{pct}%"


# ──────────────────────────────────────────────
# Google Cloud TTS provider
# ──────────────────────────────────────────────

_google_client = None


def _get_google_client():
    """Initialize Google Cloud TTS client (lazy singleton)."""
    global _google_client
    if _google_client is not None:
        return _google_client

    creds_json = os.getenv("GOOGLE_TTS_CREDENTIALS_JSON") or os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        creds_info = json.loads(creds_json)
        credentials = service_account.Credentials.from_service_account_info(
            creds_info,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        logger.info("Google TTS client initialized from env var")
    else:
        creds_path = os.path.abspath(CREDENTIALS_PATH)
        if not os.path.exists(creds_path):
            raise RuntimeError("Google TTS credentials not found")
        credentials = service_account.Credentials.from_service_account_file(
            creds_path,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        logger.info("Google TTS client initialized from credentials file")

    _google_client = texttospeech.TextToSpeechClient(credentials=credentials)
    return _google_client


def _is_google_tts_available() -> bool:
    """Check if Google Cloud TTS credentials are configured."""
    creds_json = os.getenv("GOOGLE_TTS_CREDENTIALS_JSON") or os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        return True
    return os.path.exists(os.path.abspath(CREDENTIALS_PATH))


async def _synthesize_google(
    text: str, language: str, voice_name: str, speaking_rate: float
) -> bytes:
    """Synthesize using Google Cloud TTS with internal voice fallback chain."""
    client = _get_google_client()

    synthesis_input = texttospeech.SynthesisInput(text=text)
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate,
    )

    # Try requested voice first, then fallbacks
    voices_to_try = [(language, voice_name)] + [
        (lang, v) for lang, v in GOOGLE_FALLBACK_VOICES if v != voice_name
    ]

    last_error = None
    for try_lang, try_voice in voices_to_try:
        try:
            voice_params = texttospeech.VoiceSelectionParams(
                language_code=try_lang,
                name=try_voice,
            )
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice_params,
                audio_config=audio_config,
            )
            audio_content = response.audio_content
            if audio_content and len(audio_content) > 0:
                if try_voice != voice_name:
                    logger.info(f"Google TTS used fallback voice '{try_voice}'")
                return audio_content
        except Exception as e:
            last_error = e
            logger.warning(f"Google TTS voice '{try_voice}' failed: {e}")
            continue

    raise last_error or RuntimeError("All Google TTS voices failed")


# ──────────────────────────────────────────────
# Edge TTS provider (free, no API key)
# ──────────────────────────────────────────────

async def _synthesize_edge(
    text: str, language: str, voice_name: str, speaking_rate: float
) -> bytes:
    """Synthesize using Edge TTS (free Microsoft neural voices)."""
    import edge_tts

    # Map the requested Google voice to the best Edge equivalent
    edge_voice = GOOGLE_TO_EDGE_VOICE.get(voice_name, "zh-CN-XiaoxiaoNeural")
    edge_rate = _speaking_rate_to_edge(speaking_rate)

    # Try the mapped voice first, then Edge fallbacks
    voices_to_try = [edge_voice] + [v for v in EDGE_FALLBACK_VOICES if v != edge_voice]

    last_error = None
    for try_voice in voices_to_try:
        try:
            communicate = edge_tts.Communicate(text, voice=try_voice, rate=edge_rate)
            audio_data = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.write(chunk["data"])
            result = audio_data.getvalue()
            if len(result) > 0:
                if try_voice != edge_voice:
                    logger.info(f"Edge TTS used fallback voice '{try_voice}'")
                return result
            raise ValueError("Edge TTS returned empty audio")
        except Exception as e:
            last_error = e
            logger.warning(f"Edge TTS voice '{try_voice}' failed: {e}")
            continue

    raise last_error or RuntimeError("All Edge TTS voices failed")


# ──────────────────────────────────────────────
# Provider registry & main entry point
# ──────────────────────────────────────────────

TTS_PROVIDERS = [
    {
        "name": "google_cloud_tts",
        "fn": _synthesize_google,
        "available_check": _is_google_tts_available,
    },
    {
        "name": "edge_tts",
        "fn": _synthesize_edge,
        "available_check": lambda: True,  # Always available — no API key needed
    },
]


async def synthesize_speech(
    text: str, language: str, voice_name: str, speaking_rate: float
) -> tuple[bytes, str]:
    """
    Synthesize speech using cascading fallback.

    Returns:
        Tuple of (mp3_bytes, provider_name_used).

    Raises:
        RuntimeError: If ALL providers fail.
    """
    errors = []
    for provider in TTS_PROVIDERS:
        if not provider["available_check"]():
            logger.debug(f"Skipping TTS provider {provider['name']} — not available")
            continue

        try:
            logger.info(f"Trying TTS provider: {provider['name']}")
            audio_bytes = await provider["fn"](text, language, voice_name, speaking_rate)
            if audio_bytes and len(audio_bytes) > 0:
                logger.info(f"TTS success with provider: {provider['name']}")
                return audio_bytes, provider["name"]
            raise ValueError("Empty audio from provider")
        except Exception as e:
            error_msg = f"{provider['name']}: {type(e).__name__}: {str(e)[:200]}"
            logger.warning(f"TTS provider failed — {error_msg}")
            errors.append(error_msg)
            continue

    all_errors = " | ".join(errors) if errors else "No TTS providers available"
    raise RuntimeError(f"All TTS providers failed. {all_errors}")


# ──────────────────────────────────────────────
# Health check / test
# ──────────────────────────────────────────────

async def test_tts_provider(name: str) -> dict:
    """Test a specific TTS provider."""
    provider = next((p for p in TTS_PROVIDERS if p["name"] == name), None)
    if not provider:
        return {"provider": name, "status": "unknown"}

    if not provider["available_check"]():
        return {"provider": name, "status": "no_credentials"}

    try:
        audio, _ = await synthesize_speech.__wrapped__(
            "你好", "cmn-CN", "cmn-CN-Standard-A", 1.0
        ) if False else (None, None)
        # Direct call to avoid full fallback
        audio = await provider["fn"]("你好", "cmn-CN", "cmn-CN-Standard-A", 1.0)
        return {
            "provider": name,
            "status": "ok",
            "audio_bytes": len(audio),
        }
    except Exception as e:
        return {
            "provider": name,
            "status": "error",
            "error": f"{type(e).__name__}: {str(e)[:200]}",
        }


async def test_all_tts_providers() -> list[dict]:
    """Test all TTS providers."""
    results = []
    for provider in TTS_PROVIDERS:
        result = await test_tts_provider(provider["name"])
        results.append(result)
    return results
