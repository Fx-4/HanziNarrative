import sys
sys.stdout.reconfigure(encoding='utf-8')
from app.config import settings

keys = {
    "MISTRAL":    settings.MISTRAL_API_KEY,
    "COHERE":     settings.COHERE_API_KEY,
    "GROQ":       settings.GROQ_API_KEY,
    "GEMINI":     settings.GEMINI_API_KEY,
    "OPENROUTER": settings.OPENROUTER_API_KEY,
    "ANTHROPIC":  settings.ANTHROPIC_API_KEY,
}

for k, v in keys.items():
    status = "[OK]     " if v else "[MISSING]"
    masked = (v[:6] + "..." + v[-4:]) if v else "-"
    print(f"{k:12}: {status}  {masked}")
