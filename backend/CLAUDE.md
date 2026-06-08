# Backend — Claude Context

> Extends root CLAUDE.md. Loaded automatically for tasks inside `backend/`.

## Conventions
- Routers tipis — logic bisnis di `services/`, bukan di router
- `async`/`await` untuk semua I/O (DB, HTTP, file)
- Strict type hints di semua fungsi + Pydantic schemas untuk semua request/response
- DB changes → `alembic revision --autogenerate` dulu, baru `alembic upgrade head`. Jangan `create_all`.
- TTS: default `edge-tts`, cache hasil di `tts_cache/` (static via `/tts/audio`). Jangan generate ulang jika sudah ada.

## Directory Structure
```
app/
├── routers/        # FastAPI route handlers — thin, delegasi ke services/
├── services/       # Business logic
│   ├── gemini_service.py    # AI (semua provider, nama menyesatkan)
│   ├── learning_service.py  # SRS, stats, vocabulary
│   ├── gamification_service.py
│   └── tts_service.py
├── main.py         # CORS, router registration, lifespan hooks
├── models.py       # SQLAlchemy ORM — edit di sini lalu alembic
├── schemas.py      # Pydantic v2 request/response — source of truth
├── auth.py         # JWT utils, get_current_user dependency
├── config.py       # Pydantic Settings (baca .env)
└── database.py     # Engine, SessionLocal, get_db dependency
```

## AI Fallback Chain
```
Gemini → Groq → Mistral → OpenRouter → Cohere → Anthropic
```
Semua provider ditangani di `services/gemini_service.py`.

## Key Models (`models.py`)
| Model | Kolom Penting |
|---|---|
| `User` | id, email, hashed_password, onboarding_completed, is_admin |
| `HanziWord` | id, simplified, pinyin, english, hsk_level, category |
| `UserProgress` | user_id, word_id, mastery_level (0–10), correct_count, incorrect_count, next_review, interval |
| `UserGamification` | user_id, total_xp, current_streak, total_words_reviewed, total_correct_answers, achievements (JSON) |
| `Story` | id, user_id, hsk_level, content, vocabulary (JSON) |

## SRS Logic (`services/learning_service.py`)
- SM-2 algorithm untuk interval scheduling
- `mastery_level` 0–10 → **mastered** = `>= 8`
- `accuracy` = `correct_count / (correct + incorrect) * 100`
- `recordReview(word_id, quality 0–5)` → update mastery, interval, next_review
- Stats endpoint: `GET /learning/stats/all` → single JOIN query, group by HSK level in Python

## Environment Variables
| Var | Wajib di Koyeb | Notes |
|---|---|---|
| `ENVIRONMENT` | ✅ **`production`** | Tanpa ini CORS hanya allow localhost → Vercel gagal |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT secret: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GEMINI_API_KEY` | ✅ | Primary AI |
| `FRONTEND_URL` | ✅ | `https://hanzi-narrative.vercel.app` |
| `CORS_ORIGINS` | ✅ | `https://hanzi-narrative.vercel.app` |
| `GROQ_API_KEY` | ✅ | AI fallback |
| `ANTHROPIC_API_KEY` | ⚠️ | Last-resort fallback |
| `RESEND_API_KEY` | ⚠️ | Email (password reset) |
| `ALGORITHM` | — | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | Default `30` |
