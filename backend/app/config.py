from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://hanzinarrative:hanzinarrative_dev@localhost:5432/hanzinarrative"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # Anthropic Claude AI (paid — last resort fallback)
    ANTHROPIC_API_KEY: str = ""

    # Groq AI (free tier — secondary fallback)
    GROQ_API_KEY: str = ""

    # OpenRouter AI (free models — tertiary fallback)
    OPENROUTER_API_KEY: str = ""

    # Pexels — free image API (register at https://www.pexels.com/api/)
    PEXELS_API_KEY: str = ""

    # Pixabay — free image API fallback (register at https://pixabay.com/api/docs/)
    PIXABAY_API_KEY: str = ""

    # Frontend URL (for OAuth callbacks and reset links)
    FRONTEND_URL: str = "http://localhost:5173"

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Email via Resend (optional — leave empty to print reset links to terminal)
    RESEND_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
