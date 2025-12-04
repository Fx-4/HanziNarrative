from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
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


class HanziWordCreate(HanziWordBase):
    pass


class HanziWord(HanziWordBase):
    id: int

    class Config:
        from_attributes = True


class StoryBase(BaseModel):
    title: str
    content: str
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


class TokenData(BaseModel):
    username: Optional[str] = None


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
