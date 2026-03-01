import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import auth, stories, vocabulary, progress, vocabulary_sets, exercises, learning, writing, quiz, gamification, onboarding, typing, tts, dictation, adventure, stt, scramble, daily_challenge, conversation
from .database import engine, Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.warning(f"Could not create tables on startup (will retry on first request): {e}")

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"


def _auto_seed_stories():
    """Seed default stories incrementally — skips stories that already exist by title."""
    try:
        from .database import SessionLocal
        from .models import Story, User as UserModel
        from .seed_stories import STORIES

        db = SessionLocal()
        try:
            user = db.query(UserModel).first()
            if not user:
                logger.info("No users found yet — skipping story seed (will seed after first registration).")
                return

            # Get existing story titles for duplicate check
            existing_titles = set(
                t[0] for t in db.query(Story.title).all()
            )

            added = 0
            for s in STORIES:
                if s["title"] in existing_titles:
                    continue
                story = Story(
                    title=s["title"],
                    title_english=s["title_english"],
                    content=s["content"],
                    content_pinyin=s["content_pinyin"],
                    english_translation=s["english_translation"],
                    hsk_level=s["hsk_level"],
                    author_id=user.id,
                    is_published=True,
                )
                db.add(story)
                added += 1

            if added > 0:
                db.commit()
                logger.info(f"Auto-seeded {added} new stories (total in DB: {len(existing_titles) + added}).")
            else:
                logger.info(f"All {len(existing_titles)} stories already present, nothing to seed.")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Auto-seed stories failed (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _auto_seed_stories()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="HanziNarrative API",
    description="API for interactive HSK learning through stories",
    version="1.0.0",
    # Disable interactive docs in production
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

# Get CORS origins from environment variable or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:5174,http://localhost:5175")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stories.router)
app.include_router(vocabulary.router)
app.include_router(progress.router)
app.include_router(vocabulary_sets.router)
app.include_router(exercises.router)
app.include_router(learning.router)
app.include_router(writing.router)
app.include_router(typing.router)
app.include_router(quiz.router)
app.include_router(gamification.router)
app.include_router(onboarding.router)
app.include_router(tts.router)
app.include_router(dictation.router)
app.include_router(adventure.router)
app.include_router(stt.router)
app.include_router(scramble.router)
app.include_router(daily_challenge.router)
app.include_router(conversation.router)

# Serve pre-generated TTS audio files directly (bypasses Python for cached audio)
_tts_cache_dir = os.path.join(os.path.dirname(__file__), "..", "tts_cache")
os.makedirs(_tts_cache_dir, exist_ok=True)
app.mount("/tts/audio", StaticFiles(directory=_tts_cache_dir), name="tts-audio")


@app.get("/")
def root():
    return {
        "message": "Welcome to HanziNarrative API",
    }

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ai-providers/test")
async def test_ai_providers():
    """Test all configured AI providers (dev only)."""
    if IS_PRODUCTION:
        return {"detail": "Not available in production"}
    from .services.ai_provider import test_all_providers
    results = await test_all_providers()
    return {"providers": results}
