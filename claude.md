# HanziNarrative — Project Context

> Do NOT scan the codebase unless explicitly asked. Sub-docs load automatically per directory.

## URLs
| | |
|---|---|
| Frontend | https://hanzi-narrative.vercel.app (Vercel) |
| Backend  | https://fierce-hookworm-f-4-work-96eac868.koyeb.app (Koyeb, free tier) |
| DB       | Supabase (PostgreSQL) |

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 · TypeScript · Vite 5 · Tailwind 3 · Framer Motion · Zustand · React Router v6 |
| Backend  | Python 3.12 · FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · Uvicorn |
| AI       | Gemini (primary) → Groq → Mistral/OpenRouter/Cohere → Anthropic (last resort) |
| TTS/STT  | Edge TTS (primary) · Google Cloud TTS (fallback) · Google Cloud STT |
| Other    | Pexels (vocab images) · Resend (email) · Google OAuth |

## Key Files
| File | Purpose |
|---|---|
| `frontend/src/services/api.ts` | Semua Axios API calls — tambah endpoint baru di sini |
| `frontend/src/lib/env.ts` | API_URL — selalu import dari sini, bukan `VITE_API_URL` langsung |
| `frontend/src/store/authStore.ts` | Auth state + Zustand persist |
| `frontend/tailwind.config.js` | Design tokens (warna, font, spacing) |
| `frontend/src/index.css` | Component utility classes |
| `backend/app/main.py` | CORS config + router registration |
| `backend/app/models.py` | ORM models — edit lalu `alembic revision --autogenerate` |
| `backend/app/schemas.py` | Pydantic schemas — source of truth response shape |

## Critical Gotchas
1. **CORS** — Koyeb **wajib** `ENVIRONMENT=production`. Tanpa ini semua request dari Vercel → Network Error.
2. **DB migrations** — selalu `alembic revision --autogenerate -m "desc"` lalu `alembic upgrade head`. Jangan `create_all`.
3. **API URL** — import `API_URL` dari `@/lib/env.ts` (ada http→https auto-upgrade).

## Commands
```bash
cd frontend && npm run dev                              # :5173
cd frontend && npm run build                           # production build
cd backend && uvicorn app.main:app --reload --port 8000
cd backend && alembic revision --autogenerate -m "x"  # buat migration
cd backend && alembic upgrade head                     # apply migration
```

## Git Commit Convention
- Commit per file atau per concern kohesif
- Body wajib list perubahan per file:
  ```
  fix(scope): deskripsi singkat

  - path/to/file.py: apa yang diubah
  - path/to/other.tsx: apa yang diubah
  ```

## Sub-docs (auto-loaded per directory)
- Frontend conventions, routing, auth, design tokens → `frontend/CLAUDE.md`
- Backend conventions, models, SRS logic, env vars → `backend/CLAUDE.md`
