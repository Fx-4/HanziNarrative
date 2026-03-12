from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re


class UserBase(BaseModel):
    username: str
    email: EmailStr

    @field_validator('username')
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 30:
            raise ValueError('Username must be 30 characters or fewer')
        if not re.match(r'^[a-zA-Z0-9_.-]+$', v):
            raise ValueError('Username may only contain letters, numbers, underscores, dots and hyphens')
        return v


class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

    @field_validator('password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None

    @field_validator('full_name')
    @classmethod
    def full_name_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) > 100:
            raise ValueError('Full name must be 100 characters or fewer')
        return v

    @field_validator('profile_picture')
    @classmethod
    def profile_picture_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        # Allow plain URLs (http/https)
        if v.startswith('http://') or v.startswith('https://'):
            if len(v) > 2048:
                raise ValueError('Profile picture URL is too long')
            return v
        # Allow base64 data URIs — validate prefix and size
        ALLOWED_PREFIXES = (
            'data:image/jpeg;base64,',
            'data:image/jpg;base64,',
            'data:image/png;base64,',
            'data:image/webp;base64,',
            'data:image/gif;base64,',
        )
        if not any(v.startswith(p) for p in ALLOWED_PREFIXES):
            raise ValueError('Profile picture must be a URL or a valid base64 image (JPEG, PNG, WebP, GIF)')
        # Limit base64 payload to ~2MB (2MB * 4/3 base64 overhead ≈ 2_800_000 chars)
        MAX_B64_CHARS = 2_800_000
        if len(v) > MAX_B64_CHARS:
            raise ValueError('Profile picture must be smaller than 2 MB')
        return v


class User(UserBase):
    id: int
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class HanziWordBase(BaseModel):
    simplified: str
    traditional: str
    pinyin: str
    english: str
    hsk_level: int
    image_url: Optional[str] = None
    evolution_history: Optional[str] = None


class HanziWordCreate(HanziWordBase):
    pass


class HanziWord(HanziWordBase):
    id: int
    category: Optional[str] = None
    radical: Optional[str] = None
    strokes: Optional[int] = None

    class Config:
        from_attributes = True


class StoryBase(BaseModel):
    title: str
    title_english: Optional[str] = None
    content: str
    content_pinyin: Optional[str] = None
    english_translation: Optional[str] = None
    hsk_level: int


class StoryCreate(StoryBase):
    pass


class Story(StoryBase):
    id: int
    author_id: int
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StoryWithWords(Story):
    words: List[HanziWord] = []

    class Config:
        from_attributes = True


class UserProgressBase(BaseModel):
    word_id: int
    familiarity_level: int


class UserProgressCreate(UserProgressBase):
    pass


class UserProgress(UserProgressBase):
    id: int
    user_id: int
    review_count: int
    last_reviewed: datetime

    class Config:
        from_attributes = True


class VocabularySetBase(BaseModel):
    name: str
    description: Optional[str] = None


class VocabularySetCreate(VocabularySetBase):
    pass


class VocabularySet(VocabularySetBase):
    id: int
    user_id: int
    created_at: datetime
    words: List[HanziWord] = []

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    username: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Writing Practice Schemas
class WritingAttemptCreate(BaseModel):
    word_id: int
    accuracy_score: float  # 0-100
    time_taken: float  # seconds
    stroke_accuracy: Optional[List[float]] = None  # per-stroke accuracy array


class WritingProgressBase(BaseModel):
    word_id: int
    total_attempts: int
    successful_attempts: int
    accuracy_score: float
    average_time: float
    mastery_level: int


class WritingProgress(WritingProgressBase):
    id: int
    user_id: int
    stroke_accuracy: Optional[List[float]] = None
    last_practiced: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WritingProgressWithWord(WritingProgress):
    word: HanziWord

    class Config:
        from_attributes = True


class WritingStatsResponse(BaseModel):
    total_characters_practiced: int
    total_attempts: int
    average_accuracy: float
    mastered_characters: int  # mastery_level >= 8
    characters_in_progress: int  # mastery_level 3-7
    new_characters: int  # mastery_level 0-2


# Typing Practice Schemas
class TypingAttemptCreate(BaseModel):
    word_id: int
    mode: str  # 'pinyin', 'ime', 'speed'
    is_correct: bool
    time_taken: float  # seconds
    typed_text: str
    expected_text: str
    wpm: Optional[float] = None  # For speed mode
    ime_attempts: Optional[int] = None  # For IME mode
    tone_errors: Optional[List[int]] = None  # Positions of tone errors for pinyin mode


class TypingProgressBase(BaseModel):
    word_id: int
    mode: str
    total_attempts: int
    successful_attempts: int
    accuracy_score: float
    pinyin_accuracy: float
    best_wpm: float
    average_wpm: float
    mastery_level: int


class TypingProgress(TypingProgressBase):
    id: int
    user_id: int
    average_time_per_char: float
    ime_selection_accuracy: float
    ime_average_attempts: float
    last_practiced: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class TypingProgressWithWord(TypingProgress):
    word: HanziWord

    class Config:
        from_attributes = True


class TypingStatsResponse(BaseModel):
    total_words_practiced: int
    total_attempts: int
    average_accuracy: float
    average_wpm: float
    best_wpm: float
    mastered_words: int  # mastery_level >= 8
    words_in_progress: int  # mastery_level 3-7
    new_words: int  # mastery_level 0-2
