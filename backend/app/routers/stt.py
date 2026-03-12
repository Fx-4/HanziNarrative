"""
Speech-to-Text (STT) router for pronunciation practice.
Uses Google Cloud Speech-to-Text API with separate credentials.
"""

import os
import json
import logging
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
try:
    from google.cloud import speech
    from google.oauth2 import service_account
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False
    speech = None
    service_account = None
from ..auth import get_current_user
from ..models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stt", tags=["stt"])

STT_CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "google-stt-credentials.json")

_stt_client = None


def get_stt_client():
    global _stt_client
    if not SPEECH_AVAILABLE:
        raise HTTPException(status_code=503, detail="STT service not available (google-cloud-speech not installed)")
    if _stt_client is None:
        # Prefer env var (for cloud deployments where files are ephemeral)
        creds_json = os.getenv("GOOGLE_STT_CREDENTIALS_JSON") or os.getenv("GOOGLE_CREDENTIALS_JSON")
        if creds_json:
            try:
                creds_info = json.loads(creds_json)
                credentials = service_account.Credentials.from_service_account_info(
                    creds_info,
                    scopes=["https://www.googleapis.com/auth/cloud-platform"],
                )
                logger.info("STT client initialized from env var")
            except Exception as e:
                logger.error(f"Failed to parse STT credentials env var: {e}")
                raise HTTPException(status_code=503, detail="STT service misconfigured")
        else:
            creds_path = os.path.abspath(STT_CREDENTIALS_PATH)
            if not os.path.exists(creds_path):
                logger.error(f"STT credentials not found at {creds_path}")
                raise HTTPException(status_code=503, detail="STT service not configured")
            credentials = service_account.Credentials.from_service_account_file(
                creds_path,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
        _stt_client = speech.SpeechClient(credentials=credentials)
        logger.info("Google Cloud STT client initialized")
    return _stt_client


class STTRequest(BaseModel):
    audio_base64: str
    language: str = "cmn-Hans-CN"  # Simplified Mandarin Chinese
    expected_text: str = ""


class STTResponse(BaseModel):
    transcript: str
    confidence: float
    is_correct: bool
    accuracy_score: int
    feedback: str


def calculate_accuracy(transcript: str, expected: str) -> tuple:
    """Compare transcript with expected text and return accuracy score + feedback."""
    if not expected:
        return 100, "Speech recognized successfully!"

    # Normalize: remove punctuation and whitespace
    import re
    clean_transcript = re.sub(r'[^\u4e00-\u9fff]', '', transcript)
    clean_expected = re.sub(r'[^\u4e00-\u9fff]', '', expected)

    if not clean_expected:
        return 100, "Good!"

    # Character-level accuracy
    correct = 0
    total = max(len(clean_transcript), len(clean_expected))

    for i in range(min(len(clean_transcript), len(clean_expected))):
        if clean_transcript[i] == clean_expected[i]:
            correct += 1

    accuracy = round((correct / total) * 100) if total > 0 else 0

    if accuracy >= 90:
        feedback = "Excellent pronunciation! 太棒了！"
    elif accuracy >= 70:
        feedback = "Good job! A few characters were different. 不错！"
    elif accuracy >= 50:
        feedback = "Keep practicing! Try speaking more slowly and clearly. 加油！"
    else:
        feedback = "Try again — speak slowly and clearly. You can do it! 再试一次！"

    return accuracy, feedback


@router.post("/recognize", response_model=STTResponse)
async def recognize_speech(
    request: STTRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Recognize Chinese speech from audio data.
    Returns transcript, confidence, and accuracy compared to expected text.
    """
    try:
        client = get_stt_client()

        # Decode base64 audio
        audio_data = base64.b64decode(request.audio_base64)

        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code=request.language,
            enable_automatic_punctuation=True,
            model="default",
        )

        logger.info(f"Processing STT request, audio size: {len(audio_data)} bytes")
        response = client.recognize(config=config, audio=audio)

        if not response.results:
            return STTResponse(
                transcript="",
                confidence=0.0,
                is_correct=False,
                accuracy_score=0,
                feedback="Could not recognize speech. Please try again, speaking clearly into the microphone.",
            )

        # Get best result
        best = response.results[0].alternatives[0]
        transcript = best.transcript
        confidence = round(best.confidence * 100, 1)

        # Calculate accuracy against expected text
        accuracy, feedback = calculate_accuracy(transcript, request.expected_text)
        is_correct = accuracy >= 80

        logger.info(f"STT result: '{transcript}' (confidence: {confidence}%, accuracy: {accuracy}%)")

        return STTResponse(
            transcript=transcript,
            confidence=confidence,
            is_correct=is_correct,
            accuracy_score=accuracy,
            feedback=feedback,
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"STT recognition failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Speech recognition failed: {str(e)}"
        )


@router.get("/status")
async def stt_status(current_user: User = Depends(get_current_user)):
    """Check if STT service is configured and available."""
    creds_path = os.path.abspath(STT_CREDENTIALS_PATH)
    return {
        "available": os.path.exists(creds_path),
        "credentials_path": creds_path,
    }

@router.get("/status-stream")
async def stt_status_stream(current_user: User = Depends(get_current_user)):
    """Stream STT status payload via SSE."""

    def sse(data: dict) -> str:
        return f"data: {json.dumps(jsonable_encoder(data))}\\n\\n"

    async def event_generator():
        try:
            yield sse({"type": "progress", "message": "Checking STT status..."})
            payload = await stt_status(current_user=current_user)
            yield sse({"type": "done", "data": payload})
        except HTTPException as e:
            yield sse({"type": "error", "message": e.detail})
        except Exception:
            yield sse({"type": "error", "message": "Failed to load STT status"})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )
