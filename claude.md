# Project Context & Guidelines: Learn HSK

This file serves as a context reference for the LLM to understand the project architecture and reduce the need for repetitive explanations.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS. State management via `src/store/`.
- **Backend**: Python 3, FastAPI, SQLAlchemy (ORM), Alembic (Migrations), PostgreSQL.
- **AI / External APIs**: Google Cloud STT (Speech-to-Text), **Edge TTS** (Primary for all Text-to-Speech / Speaker buttons), Google Gemini AI.

## 📁 Repository Structure
- `/frontend/src/`: Contains React components, custom hooks, pages, typings, and API communication services.
- `/backend/app/`: Core FastAPI application containing `routers/`, `models.py` (SQLAlchemy), `schemas.py` (Pydantic), `auth.py`, and `database.py`.
- `/backend/alembic/`: Database migration scripts.
- `/scripts/` & `/backend/seed_*.py`: Various utility scripts for seeding database with HSK vocabulary and stories.

## 📝 Coding Conventions
### General
- Write concise, modular, and reusable code.
- Avoid repeating entire files in responses; only output the modified sections or blocks unless specifically requested.

### Frontend (React/TypeScript)
- Use Functional Components and React Hooks.
- Enforce strict TypeScript typing (`tsconfig.json`).
- Prefer Tailwind CSS for styling.

### Backend (Python/FastAPI)
- Use `async`/`await` for all I/O-bound operations and database queries where applicable.
- Enforce strict Python type hints and Pydantic models for request/response validation.
- Keep FastAPI routers thin; delegate business logic to the `services/` layer.
- Never modify the database schema directly without generating an Alembic migration.
- **TTS generation**: Always use `edge-tts` (Microsoft Edge TTS) for text-to-speech audio generation by default.

## 🎯 Important Note for LLM
When assisting with this project, use this document to inform your code generation, architecture decisions, and file paths. There is no need to ask what framework or stack is being used.