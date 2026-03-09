import logging
import os
from pydantic import model_validator
from pydantic_settings import BaseSettings

_logger = logging.getLogger(__name__)
_INSECURE_DEFAULT_KEY = "your-secret-key-change-in-production"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://hanzinarrative:hanzinarrative_dev@localhost:5432/hanzinarrative"
    SECRET_KEY: str = _INSECURE_DEFAULT_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # Anthropic Claude AI (paid — last resort fallback)
    ANTHROPIC_API_KEY: str = ""

    # Groq AI (free tier — secondary fallback)
    GROQ_API_KEY: str = ""

    # Mistral AI (free tier — tertiary fallback, 1 req/s, ~1B tokens/month)
    MISTRAL_API_KEY: str = ""

    # OpenRouter AI (free models — quaternary fallback)
    OPENROUTER_API_KEY: str = ""

    # Cohere AI (trial — 20 RPM, 1000 calls/month hard cap)
    COHERE_API_KEY: str = ""

    # Pexels — free image API (register at https://www.pexels.com/api/)
    PEXELS_API_KEY: str = ""

    # Pixabay — free image API fallback (register at https://pixabay.com/api/docs/)
    PIXABAY_API_KEY: str = ""

    # Frontend URL (for OAuth callbacks and reset links)
    FRONTEND_URL: str = "http://localhost:5173"

    # Backend URL (for OAuth redirect_uri — change in production)
    BACKEND_URL: str = "http://localhost:8000"

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Email via Resend (optional — leave empty to print reset links to terminal)
    RESEND_API_KEY: str = ""

    @model_validator(mode='after')
    def validate_secret_key(self) -> 'Settings':
        """Block insecure default SECRET_KEY in production; warn in development.

        Detection: ENVIRONMENT env var (set to "production" on Koyeb/hosting).
        Locally it defaults to "development" so the insecure key is still allowed.
        """
        if self.SECRET_KEY == _INSECURE_DEFAULT_KEY:
            is_prod = os.getenv("ENVIRONMENT", "development") == "production"
            if is_prod:
                raise ValueError(
                    "SECRET_KEY is set to the insecure default value. "
                    "Set a strong, random SECRET_KEY in your Koyeb environment variables. "
                    "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
                )
            _logger.warning(
                "WARNING: SECRET_KEY is the insecure default. "
                "This is only acceptable for local development. "
                "Set a strong SECRET_KEY before deploying to production."
            )
        return self

    class Config:
        env_file = ".env"


settings = Settings()
