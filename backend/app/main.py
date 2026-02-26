import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, stories, vocabulary, progress, vocabulary_sets, exercises, learning, writing, quiz, gamification, onboarding, typing
from .database import engine, Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.warning(f"Could not create tables on startup (will retry on first request): {e}")

app = FastAPI(
    title="HanziNarrative API",
    description="API for interactive HSK learning through stories",
    version="1.0.0"
)

# Get CORS origins from environment variable or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5174,http://localhost:5175")
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


@app.get("/")
def root():
    return {
        "message": "Welcome to HanziNarrative API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/routes")
def debug_routes():
    """Debug endpoint to list all registered routes"""
    return {"routes": [{"path": route.path, "name": route.name} for route in app.routes]}
