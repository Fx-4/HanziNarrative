from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, Float, JSON, UniqueConstraint
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
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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

    stories = relationship("Story", secondary=story_words, back_populates="words")
    progress = relationship("UserProgress", back_populates="word")
    vocabulary_sets = relationship("VocabularySet", secondary=vocabulary_set_words, back_populates="words")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    english_translation = Column(Text, nullable=True)
    hsk_level = Column(Integer, index=True, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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

    user = relationship("User", back_populates="progress")
    word = relationship("HanziWord", back_populates="progress")


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
