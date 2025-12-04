# HanziNarrative Backend

FastAPI backend for the HanziNarrative application.

## Features

- RESTful API with FastAPI
- JWT-based authentication
- PostgreSQL database with SQLAlchemy ORM
- Alembic database migrations
- Pydantic data validation
- CORS middleware for frontend integration

## Setup

See the main [SETUP.md](../SETUP.md) in the root directory for complete setup instructions.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed database
python seed_data.py

# Start server
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── routers/          # API endpoints
│   │   ├── auth.py       # Authentication routes
│   │   ├── stories.py    # Story management
│   │   ├── vocabulary.py # Vocabulary endpoints
│   │   ├── progress.py   # User progress tracking
│   │   └── vocabulary_sets.py  # Custom word lists
│   ├── main.py           # FastAPI app initialization
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Authentication utilities
│   ├── database.py       # Database configuration
│   └── config.py         # App configuration
├── alembic/              # Database migrations
├── requirements.txt      # Python dependencies
└── seed_data.py         # Database seeding script
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hanzinarrative
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Models

- **User**: User accounts and authentication
- **HanziWord**: Chinese vocabulary with HSK levels
- **Story**: Interactive stories with embedded vocabulary
- **UserProgress**: Track learning progress per word
- **VocabularySet**: Custom word collections

## Authentication

The API uses JWT tokens for authentication:

1. Register: `POST /auth/register`
2. Login: `POST /auth/login` - Returns access token
3. Use token in Authorization header: `Bearer <token>`
4. Protected endpoints require valid token

## Development

### Creating Migrations

```bash
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

### Adding New Endpoints

1. Create router in `app/routers/`
2. Define Pydantic schemas in `app/schemas.py`
3. Add database models in `app/models.py` if needed
4. Register router in `app/main.py`

## Testing

```bash
pytest
```
