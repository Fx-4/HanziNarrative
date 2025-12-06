"""
Quiz routes for generating and managing quizzes
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, auth
from ..database import get_db
import random

router = APIRouter(prefix="/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    hsk_level: int
    quiz_type: str = "multiple_choice"  # multiple_choice, fill_blank, character_match, tone_practice
    num_questions: int = 10
    category: Optional[str] = None


class MultipleChoiceQuestion(BaseModel):
    id: int
    question: str
    question_type: str  # "meaning", "pinyin", "character"
    options: List[str]
    correct_answer: int
    word_id: int
    chinese: str
    pinyin: str
    english: str


class FillBlankQuestion(BaseModel):
    id: int
    sentence: str
    blank_word: str
    pinyin: str
    english: str
    word_id: int


class MatchingPair(BaseModel):
    id: int
    chinese: str
    pinyin: str
    english: str
    word_id: int


class QuizResponse(BaseModel):
    quiz_type: str
    hsk_level: int
    questions: List[dict]


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    request: QuizGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a quiz based on HSK level and type"""

    # Get words for the quiz
    query = db.query(models.HanziWord).filter(
        models.HanziWord.hsk_level == request.hsk_level
    )

    if request.category:
        query = query.filter(models.HanziWord.category == request.category)

    all_words = query.all()

    if len(all_words) < request.num_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough words for HSK {request.hsk_level}. Need {request.num_questions}, found {len(all_words)}"
        )

    # Randomly select words for questions
    selected_words = random.sample(all_words, request.num_questions)

    if request.quiz_type == "multiple_choice":
        questions = generate_multiple_choice(selected_words, all_words)
    elif request.quiz_type == "fill_blank":
        questions = generate_fill_blank(selected_words)
    elif request.quiz_type == "character_match":
        questions = generate_character_match(selected_words)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown quiz type: {request.quiz_type}")

    return QuizResponse(
        quiz_type=request.quiz_type,
        hsk_level=request.hsk_level,
        questions=questions
    )


def generate_multiple_choice(selected_words: List[models.HanziWord], all_words: List[models.HanziWord]) -> List[dict]:
    """Generate multiple choice questions"""
    questions = []
    question_types = ["meaning", "pinyin", "character"]

    for idx, word in enumerate(selected_words):
        question_type = random.choice(question_types)

        # Get wrong options from other words
        wrong_options_pool = [w for w in all_words if w.id != word.id]
        wrong_options = random.sample(wrong_options_pool, min(3, len(wrong_options_pool)))

        if question_type == "meaning":
            # Ask for meaning given Chinese character
            question = f"What is the meaning of '{word.simplified}'?"
            correct = word.english
            options = [w.english for w in wrong_options] + [correct]
        elif question_type == "pinyin":
            # Ask for pinyin given Chinese character
            question = f"What is the pinyin for '{word.simplified}'?"
            correct = word.pinyin
            options = [w.pinyin for w in wrong_options] + [correct]
        else:  # character
            # Ask for character given meaning
            question = f"Which character means '{word.english}'?"
            correct = word.simplified
            options = [w.simplified for w in wrong_options] + [correct]

        # Shuffle options
        random.shuffle(options)
        correct_answer = options.index(correct)

        questions.append({
            "id": idx,
            "question": question,
            "question_type": question_type,
            "options": options,
            "correct_answer": correct_answer,
            "word_id": word.id,
            "chinese": word.simplified,
            "pinyin": word.pinyin,
            "english": word.english
        })

    return questions


def generate_fill_blank(selected_words: List[models.HanziWord]) -> List[dict]:
    """Generate fill-in-the-blank questions"""
    questions = []

    for idx, word in enumerate(selected_words):
        # Create a simple sentence template
        sentence = f"_______ ({word.pinyin})"

        questions.append({
            "id": idx,
            "sentence": sentence,
            "blank_word": word.simplified,
            "pinyin": word.pinyin,
            "english": word.english,
            "word_id": word.id
        })

    return questions


def generate_character_match(selected_words: List[models.HanziWord]) -> List[dict]:
    """Generate character matching quiz"""
    questions = []

    for idx, word in enumerate(selected_words):
        questions.append({
            "id": idx,
            "chinese": word.simplified,
            "pinyin": word.pinyin,
            "english": word.english,
            "word_id": word.id
        })

    return questions


@router.post("/submit")
def submit_quiz(
    quiz_results: dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz results and update user progress"""

    # In a full implementation, we would:
    # 1. Store quiz results
    # 2. Update user's word familiarity based on correctness
    # 3. Calculate statistics

    score = quiz_results.get('score', 0)
    total = quiz_results.get('total', 0)

    return {
        "message": "Quiz submitted successfully",
        "score": score,
        "total": total,
        "percentage": round((score / total * 100) if total > 0 else 0, 2)
    }
