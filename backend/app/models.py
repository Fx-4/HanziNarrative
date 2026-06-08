from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, Float, JSON, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association tables
story_words = Table(
    'story_words',
    Base.metadata,
    Column('story_id', Integer, ForeignKey('stories.id'), primary_key=True),
    Column('word_id', Integer, ForeignKey('hanzi_words.id'), primary_key=True),
    Column('position', Integer, nullable=True),  # Position optional
)

vocabulary_set_words = Table(
    'vocabulary_set_words',
    Base.metadata,
    Column('vocabulary_set_id', Integer, ForeignKey('vocabulary_sets.id'), primary_key=True),
    Column('word_id', Integer, ForeignKey('hanzi_words.id'), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)   # nullable for Google-only accounts
    full_name = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)  # URL or base64 data URI
    google_id = Column(String, unique=True, nullable=True, index=True)
    is_admin = Column(Boolean, default=False, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    soft_deleted_at = Column(DateTime(timezone=True), nullable=True)

    stories = relationship("Story", back_populates="author")
    progress = relationship("UserProgress", back_populates="user")
    vocabulary_sets = relationship("VocabularySet", back_populates="user")


class HanziWord(Base):
    __tablename__ = "hanzi_words"

    id = Column(Integer, primary_key=True, index=True)
    simplified = Column(String, index=True, nullable=False)
    traditional = Column(String, nullable=False)
    pinyin = Column(String, nullable=False)
    english = Column(Text, nullable=False)
    hsk_level = Column(Integer, index=True, nullable=False)
    category = Column(String, index=True, nullable=True)  # e.g., "noun", "verb", "adjective", "number", "time"
    radical = Column(String, nullable=True)
    strokes = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    evolution_history = Column(Text, nullable=True)  # Character evolution from oracle bone script to modern

    stories = relationship("Story", secondary=story_words, back_populates="words")
    progress = relationship("UserProgress", back_populates="word")
    vocabulary_sets = relationship("VocabularySet", secondary=vocabulary_set_words, back_populates="words")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    title_english = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    content_pinyin = Column(Text, nullable=True)  # Context-aware pinyin from AI
    english_translation = Column(Text, nullable=True)
    hsk_level = Column(Integer, index=True, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False)
    category = Column(String, nullable=True, default="curated")  # "curated" or "ai_generated"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    soft_deleted_at = Column(DateTime(timezone=True), nullable=True)

    author = relationship("User", back_populates="stories")
    words = relationship("HanziWord", secondary=story_words, back_populates="stories")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("hanzi_words.id"), nullable=False)
    familiarity_level = Column(Integer, default=0)  # 0-100
    review_count = Column(Integer, default=0)
    last_reviewed = Column(DateTime(timezone=True), server_default=func.now())

    # SM-2 Spaced Repetition fields (required by learning_service.py)
    mastery_level = Column(Integer, default=0)  # 0-10 scale
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    easiness_factor = Column(Float, default=2.5)  # SM-2 algorithm factor
    interval = Column(Integer, default=1)  # Days until next review
    repetitions = Column(Integer, default=0)  # Consecutive successful reviews
    next_review = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'word_id', name='uq_user_progress_user_word'),
        Index('idx_user_progress_user_id', 'user_id'),
        Index('idx_user_progress_user_word', 'user_id', 'word_id'),
        Index('idx_user_progress_next_review', 'user_id', 'next_review'),
    )

    user = relationship("User", back_populates="progress")
    word = relationship("HanziWord", back_populates="progress")


class UserGamification(Base):
    __tablename__ = "user_gamification"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # XP and Levels
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp_to_next_level = Column(Integer, default=100)

    # Streaks
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)

    # Stats
    total_words_reviewed = Column(Integer, default=0)
    total_correct_answers = Column(Integer, default=0)
    total_stories_read = Column(Integer, default=0)

    # Achievements (JSON array of achievement IDs)
    achievements = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class VocabularySet(Base):
    __tablename__ = "vocabulary_sets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="vocabulary_sets")
    words = relationship("HanziWord", secondary=vocabulary_set_words, back_populates="vocabulary_sets")


class WritingProgress(Base):
    __tablename__ = "writing_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("hanzi_words.id"), nullable=False)
    total_attempts = Column(Integer, default=0)
    successful_attempts = Column(Integer, default=0)
    accuracy_score = Column(Float, default=0.0)  # 0-100
    average_time = Column(Float, default=0.0)  # seconds
    stroke_accuracy = Column(JSON, nullable=True)  # Array of per-stroke accuracy
    mastery_level = Column(Integer, default=0)  # 0-10 scale
    last_practiced = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'word_id', name='unique_user_word_writing'),
    )

    user = relationship("User")
    word = relationship("HanziWord")


class TypingProgress(Base):
    __tablename__ = "typing_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("hanzi_words.id"), nullable=False)
    mode = Column(String, nullable=False)  # 'pinyin', 'ime', 'speed'

    # Common metrics
    total_attempts = Column(Integer, default=0)
    successful_attempts = Column(Integer, default=0)
    accuracy_score = Column(Float, default=0.0)  # 0-100

    # Mode-specific metrics
    pinyin_accuracy = Column(Float, default=0.0)  # Tone accuracy for pinyin mode
    tone_mistakes = Column(JSON, nullable=True)  # Track which tones are difficult
    best_wpm = Column(Float, default=0.0)  # Best words per minute for speed mode
    average_wpm = Column(Float, default=0.0)  # Average WPM
    average_time_per_char = Column(Float, default=0.0)  # Milliseconds per character
    ime_selection_accuracy = Column(Float, default=0.0)  # Correct on first try
    ime_average_attempts = Column(Float, default=0.0)  # How many candidates tried

    # General tracking
    mastery_level = Column(Integer, default=0)  # 0-10 scale
    last_practiced = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'word_id', 'mode', name='unique_user_word_typing_mode'),
    )

    user = relationship("User")
    word = relationship("HanziWord")


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    feature = Column(String, nullable=False)  # 'story_generation', 'sentence_validation', etc.
    tokens_used = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    request_data = Column(JSON, nullable=True)  # Store request details for debugging

    __table_args__ = (
        Index('idx_ai_usage_user_feature', 'user_id', 'feature'),
        Index('idx_ai_usage_user_timestamp', 'user_id', 'timestamp'),
    )

    user = relationship("User")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    quiz_type = Column(String, nullable=False)  # 'multiple_choice', 'fill_blank', 'character_match'
    hsk_level = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    time_spent = Column(Integer, nullable=True)  # seconds
    answers = Column(JSON, nullable=True)  # Store user answers for analysis
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class UserOnboarding(Base):
    __tablename__ = "user_onboarding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Onboarding status
    onboarding_completed = Column(Boolean, default=False)
    current_step = Column(Integer, default=0)  # For resuming mid-onboarding
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Initial assessment
    took_assessment = Column(Boolean, default=False)
    assessment_score = Column(Float, nullable=True)  # Percentage
    assessment_questions_answered = Column(Integer, default=0)
    assessment_correct_answers = Column(Integer, default=0)
    determined_hsk_level = Column(Integer, default=1)  # 1-6

    # Goals (stored as JSON for flexibility)
    goals = Column(JSON, nullable=True)
    # Example: {
    #   "daily_time_minutes": 15,
    #   "daily_words": 10,
    #   "target_hsk_level": 3,
    #   "target_date": "2024-12-31",
    #   "weekly_xp": 500
    # }

    # Preferences
    preferences = Column(JSON, nullable=True)
    # Example: {
    #   "learning_style": "visual/auditory/reading",
    #   "difficulty_preference": "easy/medium/hard",
    #   "reminder_enabled": true,
    #   "reminder_time": "09:00",
    #   "show_pinyin_by_default": true
    # }

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="onboarding")


class DailyChallengeCompletion(Base):
    __tablename__ = "daily_challenge_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    completed_date = Column(String, nullable=False)  # 'YYYY-MM-DD'
    xp_earned = Column(Integer, default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'completed_date', name='unique_user_daily_challenge'),
    )

    user = relationship("User")
    story = relationship("Story")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class PasswordResetRequestLog(Base):
    __tablename__ = "password_reset_request_logs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    requested_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String, nullable=True)
    type = Column(String, default="general", nullable=False)  # bug | feature | general | error
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    page_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, server_default='false', nullable=False)
    is_resolved = Column(Boolean, default=False, server_default='false', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class UserLessonProgress(Base):
    """Tracks which structured-curriculum sessions a user has completed."""
    __tablename__ = "user_lesson_progress"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id   = Column(String(120), nullable=False)   # e.g. "h1-u1-s1"
    unit_id      = Column(String(120), nullable=False)   # e.g. "h1-u1"
    hsk_level    = Column(Integer, nullable=False, default=1)
    score        = Column(Integer, default=0)            # 0–100
    xp_earned    = Column(Integer, default=0)
    completed    = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="lesson_progress")

    __table_args__ = (
        UniqueConstraint("user_id", "session_id", name="uq_ulp_user_session"),
    )
