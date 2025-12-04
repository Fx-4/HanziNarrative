# HanziNarrative - HSK Chinese Learning Platform

> A modern, interactive platform for learning Chinese (Mandarin) based on the HSK (Hanyu Shuiping Kaoshi) standardized testing framework.

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-yellow)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)](https://www.postgresql.org/)

## 📖 Overview

HanziNarrative is a comprehensive Chinese language learning application that combines modern educational techniques with an engaging user interface. Built with a focus on the HSK curriculum, it offers a structured approach to learning Mandarin Chinese through vocabulary practice, spaced repetition, interactive stories, and more.

## ✨ Features

### 🎯 Core Learning Features

- **Practice Mode (Learn/Review/Test)**
  - **Learn Mode**: Introduction to new vocabulary with detailed information
  - **Review Mode**: Spaced repetition system (SRS) for optimal retention
  - **Test Mode**: Quiz yourself on learned words with multiple choice

- **Spaced Repetition System (SRS)**
  - SM-2 algorithm implementation for intelligent review scheduling
  - Adaptive difficulty based on user performance
  - Mastery level tracking (0-10 scale)
  - Smart review intervals (1, 6, 15, 40+ days)

- **Audio Pronunciation**
  - Text-to-Speech integration using Web Speech API
  - Mandarin (zh-CN) pronunciation for all vocabulary
  - Visual feedback during playback
  - Works offline after initial load

- **Progress Dashboard**
  - Visual charts and statistics using Recharts
  - HSK level progress breakdown
  - Accuracy tracking over time
  - Mastery distribution visualization
  - Total reviews and learning stats

- **Badge Notifications**
  - Real-time count of words due for review
  - Auto-refresh every 5 minutes
  - Prominent navbar badge indicator

### 📚 Content Features

- **HSK Levels 1-6**: Complete vocabulary coverage
- **Flashcard System**: Interactive flip-card interface with animations
- **Interactive Stories**: Contextual learning through narratives
- **Sentence Builder**: Practice sentence construction
- **Writing Practice**: Character writing exercises
- **Vocabulary Browser**: Search and filter by HSK level and category

### 🎨 UI/UX Features

- **Modern, Responsive Design**: Built with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Dark/Light Theme Support**: (Optional feature)
- **Mobile-Friendly**: Responsive across all devices

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **TypeScript 5.2** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Programming language
- **SQLAlchemy** - ORM for database interactions
- **PostgreSQL** - Relational database
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Uvicorn** - ASGI server

## 📦 Project Structure

```
learn-HSK/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components (Button, Card, etc.)
│   │   │   ├── flashcard/  # Flashcard components
│   │   │   ├── AudioButton.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Practice.tsx
│   │   │   ├── Review.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Vocabulary.tsx
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useTTS.ts
│   │   ├── services/       # API services
│   │   │   └── api.ts
│   │   ├── store/          # Zustand stores
│   │   │   └── authStore.ts
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── vocabulary.py
│   │   │   └── learning.py
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database configuration
│   │   ├── services/       # Business logic
│   │   │   └── learning_service.py
│   │   └── main.py         # FastAPI app entry point
│   ├── alembic/            # Database migrations
│   └── requirements.txt
│
├── scripts/                # Utility scripts
│   ├── check_vocab.py
│   ├── migrate_old_progress.py
│   └── ...
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **PostgreSQL** 12+

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/learn-HSK.git
cd learn-HSK
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

**Example `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/learn_hsk
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

#### 3. Database Setup

```bash
# Create database (in PostgreSQL)
createdb learn_hsk

# Run migrations
alembic upgrade head

# (Optional) Seed database with HSK vocabulary
python seed_hsk1_complete.py
```

#### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
```

**Example `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

### Running the Application

#### Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

#### Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📱 Usage

1. **Register/Login**: Create an account or login
2. **Select HSK Level**: Choose your proficiency level (HSK 1-6)
3. **Practice Mode**:
   - **Learn**: Study new words
   - **Review**: Review words due for SRS
   - **Test**: Quiz yourself on learned words
4. **Dashboard**: Track your progress with visual charts
5. **Vocabulary**: Browse and search the word database
6. **Stories**: Read interactive stories for contextual learning

## 🔑 Key Learning Features

### Spaced Repetition System (SRS)

The platform uses the **SM-2 algorithm** to optimize learning:

- Quality rating: 0-5 (0=wrong, 5=perfect recall)
- **Correct answer (quality ≥ 3)**:
  - Repetition +1
  - Interval increases: 1 day → 6 days → 15 days → 40+ days
- **Wrong answer (quality < 3)**:
  - Repetition resets to 0
  - Interval resets to 1 day

**Mastery Levels**:
- Level 0-2: Beginner
- Level 3-5: Intermediate
- Level 6-7: Advanced
- Level 8-10: Mastered

### Audio Pronunciation

- Browser-based Text-to-Speech (Web Speech API)
- No external API required
- Mandarin (zh-CN) voice
- Works offline

## 🗂️ API Documentation

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Learning

- `GET /learning/words/new` - Get new words for learning
- `GET /learning/words/review` - Get words due for review
- `GET /learning/words/test` - Get words for testing
- `POST /learning/review` - Record a review
- `GET /learning/stats` - Get learning statistics
- `GET /learning/review-count` - Get count of words due for review

### Vocabulary

- `GET /vocabulary/hsk/{level}` - Get words by HSK level
- `GET /vocabulary/search` - Search words
- `GET /vocabulary/{word_id}` - Get word details
- `GET /vocabulary/categories/all` - Get all categories

Full API documentation available at: `http://localhost:8000/docs` (when backend is running)

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Backend (Railway/Heroku/AWS)

1. Set environment variables
2. Run migrations: `alembic upgrade head`
3. Start server: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist` folder
3. Set `VITE_API_URL` environment variable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- HSK vocabulary data sourced from public HSK word lists
- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern language learning platforms

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/learn-HSK](https://github.com/yourusername/learn-HSK)

---

<p align="center">Made with ❤️ for Chinese language learners</p>
