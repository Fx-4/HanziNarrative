# HanziNarrative — Claude Context

> Read this first. Do NOT scan the codebase unless explicitly asked.

---

## Project Overview

**Name:** HanziNarrative (repo: `learn-HSK`)
**Purpose:** Aplikasi belajar Mandarin/HSK level 1–6 via storytelling, flashcard, writing, typing, gamification, dan AI conversation.
**Live:**
- Frontend: `https://hanzi-narrative.vercel.app` (Vercel)
- Backend: `https://fierce-hookworm-f-4-work-96eac868.koyeb.app` (Koyeb, free tier)

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — custom design tokens (indigo primary, amber accent, surface dark mode)
- **Framer Motion** — page & element animations
- **Zustand** — global state (`authStore`, `themeStore`)
- **React Router v6** — client-side routing
- **Axios** — HTTP client (`src/services/api.ts`)
- **Radix UI** — accessible primitives (dialog, tabs, select, toast)
- **hanzi-writer** — stroke order animation untuk karakter Chinese
- **pinyin-pro** — pinyin conversion
- **Recharts** — chart/analytics

### Backend
- **Python 3.12** + **FastAPI 0.109** + **Uvicorn**
- **SQLAlchemy 2** (ORM) + **Alembic** (migrations) + **PostgreSQL** (Supabase)
- **Pydantic v2** — request/response validation
- **python-jose** — JWT tokens
- **bcrypt** — password hashing

### AI / External APIs
| Provider | Library | Kegunaan |
|----------|---------|---------|
| Google Gemini | `google-generativeai` | Primary AI (story gen, conversation, badge) |
| Groq | `groq` | Secondary fallback AI |
| Mistral / OpenRouter / Cohere | `httpx` | Tertiary fallbacks |
| Anthropic Claude | `anthropic` | Last-resort fallback |
| Edge TTS | `edge-tts` | **Primary TTS** — semua speaker button |
| Google Cloud TTS | `google-cloud-texttospeech` | TTS fallback |
| Google Cloud STT | `google-cloud-speech` | Speech-to-text (pronunciation practice) |
| Pexels | `httpx` | Vocabulary images |
| Resend | `resend` | Email (password reset) |

---

## Directory Structure

```
learn-HSK/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route-level page components
│   │   ├── components/     # Reusable UI components
│   │   │   ├── animations/ # Framer Motion wrappers (FadeIn, CountUp, etc.)
│   │   │   ├── flashcard/
│   │   │   ├── onboarding/
│   │   │   └── ui/         # Button, Card, Input, Toast, etc.
│   │   ├── services/
│   │   │   └── api.ts      # All Axios API calls (grouped by domain)
│   │   ├── store/
│   │   │   ├── authStore.ts  # Auth state + Zustand persist
│   │   │   └── themeStore.ts # Dark/light mode
│   │   ├── hooks/          # Custom hooks (useTTS, useBattleWebSocket)
│   │   ├── types/          # TypeScript type definitions (index.ts)
│   │   ├── lib/            # Utilities (hanziWriterLoader, utils.ts)
│   │   └── utils/          # debugLogger, pinyinInput, ttsCache, voicePreference
│   ├── .env                # VITE_API_URL (production Koyeb URL)
│   ├── tailwind.config.js  # Custom design tokens — edit here for colors/fonts
│   └── vite.config.ts      # Path alias @/ → src/, dev proxy /api → :8000
│
├── backend/
│   ├── app/
│   │   ├── routers/        # FastAPI route handlers (thin — business logic di services/)
│   │   ├── services/       # Business logic (AI, gamification, TTS, writing, etc.)
│   │   ├── main.py         # App entry, CORS, router registration, lifespan
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── auth.py         # JWT utilities, get_current_user dependency
│   │   ├── config.py       # Pydantic Settings (reads .env)
│   │   └── database.py     # Engine, SessionLocal, get_db
│   ├── alembic/            # Migration scripts — ALWAYS use alembic, never create_all manually
│   ├── tts_cache/          # Pre-generated TTS audio; served as static via /tts/audio
│   ├── .env                # Local env vars (NOT loaded on Koyeb — set there separately)
│   └── requirements.txt
│
└── claude.md               # ← You are here
```

---

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/services/api.ts` | Semua API calls — tambah endpoint di sini |
| `frontend/src/store/authStore.ts` | Auth state, login/logout, token storage |
| `frontend/tailwind.config.js` | Design tokens — warna, font, shadow, radius |
| `frontend/src/index.css` | Component classes (`btn-primary`, `card`, `badge-*`, dll) |
| `backend/app/main.py` | CORS config, router registration — lihat gotcha di bawah |
| `backend/app/config.py` | Semua env vars + default values |
| `backend/app/models.py` | ORM models — sync dengan alembic setelah edit |
| `backend/app/schemas.py` | Pydantic schemas — sumber of truth response shape |

---

## Authentication

- **JWT** access token (30 menit) + refresh token (30 hari)
- Token disimpan di `localStorage`: `access_token`, `refresh_token`
- Zustand `authStore` di-persist ke `localStorage` key `auth-storage`
- Auto-refresh: `api.ts` interceptor menangkap 401, coba refresh, lalu retry request
- Setelah refresh gagal → hapus tokens, redirect ke `/login`
- Onboarding flag (`onboarding_completed`) dicek setelah login/fetchUser → redirect ke `/onboarding` jika belum

---

## CORS & Deployment — Gotcha Penting

```python
# backend/app/main.py
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"
```

**Koyeb WAJIB set env var `ENVIRONMENT=production`**. Kalau tidak diset:
- `IS_PRODUCTION = False`
- CORS hanya allow localhost → semua request dari Vercel kena `Network Error`
- Ini adalah root cause bug yang pernah ditemui

Fix sudah di `main.py`: configured origins (`CORS_ORIGINS` + `FRONTEND_URL`) selalu diinclude, localhost hanya ditambah di dev mode.

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://fierce-hookworm-f-4-work-96eac868.koyeb.app
```

### Backend (`backend/.env` — local only, set manual di Koyeb dashboard)
```env
DATABASE_URL=           # Supabase PostgreSQL connection string
SECRET_KEY=             # JWT secret — generate: python -c "import secrets; print(secrets.token_hex(32))"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OPENROUTER_API_KEY=
COHERE_API_KEY=
PEXELS_API_KEY=
FRONTEND_URL=https://hanzi-narrative.vercel.app
BACKEND_URL=https://fierce-hookworm-f-4-work-96eac868.koyeb.app
CORS_ORIGINS=https://hanzi-narrative.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
ENVIRONMENT=production   # ← WAJIB di Koyeb
```

---

## Commands

```bash
# Frontend
cd frontend
npm run dev        # Dev server :5173
npm run build      # tsc + vite build → dist/
npm run lint       # ESLint strict

# Backend (lokal)
cd backend
uvicorn app.main:app --reload --port 8000

# Database
alembic revision --autogenerate -m "description"   # Buat migration baru
alembic upgrade head                                # Apply ke DB
```

---

## Coding Conventions

### Frontend
- Functional components + hooks only
- Strict TypeScript — no `any` kecuali SSE stream edge cases (comment kenapa)
- Path alias `@/` → `src/` (contoh: `import { authApi } from '@/services/api'`)
- Tailwind untuk semua styling — gunakan token custom dari `tailwind.config.js`
- Animasi via Framer Motion; gunakan komponen dari `components/animations/` kalau sudah ada

### Backend
- Router thin — logic bisnis di `services/`
- `async`/`await` untuk semua I/O
- Strict type hints + Pydantic schemas
- Perubahan schema DB → selalu via Alembic migration, bukan manual SQL
- TTS default: `edge-tts`; audio di-cache di `tts_cache/` agar tidak di-generate ulang

### API Client (`api.ts`)
- Semua endpoint dikelompokkan per domain: `authApi`, `storiesApi`, `gamificationApi`, dll
- SSE stream menggunakan `fetch` langsung (bukan Axios) + helper `pumpSSE()`
- Timeout `0` (disabled) untuk AI generation endpoints

### Git Commit
- **Commit per file** atau per concern yang cohesive — jangan batch semua perubahan sesi jadi 1 commit
- Body commit **wajib list perubahan per file**, contoh:
  ```
  fix(api): deskripsi singkat

  - backend/app/main.py: tambah ProxyHeadersMiddleware
  - frontend/src/services/api.ts: fix trailing slash di /progress/, /vocabulary-sets/
  - frontend/src/pages/Profile.tsx: wrap FileReader dalam Promise
  ```

---

## Design System (Ringkasan)

| Aspek | Detail |
|-------|--------|
| Primary color | Indigo (`primary-600` = `#4f46e5`) |
| Accent color | Amber/Gold (`accent-500` = `#f59e0b`) — nuansa budaya Tionghoa |
| Semantic | `success`, `warning`, `error`, `info` — satu warna satu makna |
| Dark mode | Surface elevation system: `base → page → card → elevated` |
| Font | Inter (UI), Noto Sans SC (Chinese), JetBrains Mono (pinyin) |
| Component classes | `.btn-primary`, `.card`, `.badge-*`, `.alert-*`, `.glass` di `index.css` |

Detail lengkap → `tailwind.config.js` dan `src/index.css`.
