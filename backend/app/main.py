from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, stories, vocabulary, progress, vocabulary_sets, exercises, learning, writing
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HanziNarrative API",
    description="API for interactive HSK learning through stories",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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


@app.get("/")
def root():
    return {
        "message": "Welcome to HanziNarrative API",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
