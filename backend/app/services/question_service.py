"""
Shared vocabulary-question generator.

Level-scoped MCQ questions built from HanziWord — no AI cost. Used by the
Ladder Race game (per-player handicap levels); battle.py has its own older
generator that can migrate here later.

Question types:
  meaning_mcq  – show 汉字 → pick English meaning
  char_mcq     – show English meaning → pick 汉字
  pinyin_mcq   – show 汉字 → pick correct pinyin
"""

import random

from sqlalchemy.orm import Session

from .. import models

_Q_ROTATION = ["meaning_mcq", "char_mcq", "pinyin_mcq"]


def _build_options(correct: str, wrong: list[str]) -> tuple[list[str], int]:
    """Dedupe, pad to 4, shuffle. Returns (options, correct_index)."""
    seen = {correct}
    unique_wrong = []
    for w in wrong:
        if w not in seen:
            seen.add(w)
            unique_wrong.append(w)
    options = unique_wrong[:3] + [correct]
    while len(options) < 4:
        options.append("—")
    random.shuffle(options)
    return options, options.index(correct)


def _build_question(idx: int, word: models.HanziWord, pool: list, q_type: str) -> dict:
    base = {
        "id": idx,
        "question_type": q_type,
        "word_id": word.id,
        "hsk_level": word.hsk_level,
    }

    if q_type == "meaning_mcq":
        wrong_words = random.sample(pool, min(3, len(pool)))
        options, correct = _build_options(word.english, [w.english for w in wrong_words])
        return {
            **base,
            "prompt": word.simplified,
            "prompt_hint": word.pinyin,
            "prompt_label": "What does this character mean?",
            "options": options,
            "correct_answer": correct,
            "reveal": f"{word.simplified} ({word.pinyin}) = {word.english}",
        }

    if q_type == "char_mcq":
        wrong_words = random.sample(pool, min(3, len(pool)))
        options, correct = _build_options(word.simplified, [w.simplified for w in wrong_words])
        return {
            **base,
            "prompt": word.english,
            "prompt_hint": None,
            "prompt_label": "Which character means this?",
            "options": options,
            "correct_answer": correct,
            "reveal": f"{word.simplified} ({word.pinyin}) = {word.english}",
        }

    # pinyin_mcq
    distinct = [w for w in pool if w.pinyin != word.pinyin]
    wrong_words = random.sample(distinct if len(distinct) >= 3 else pool, min(3, len(pool)))
    options, correct = _build_options(word.pinyin, [w.pinyin for w in wrong_words])
    return {
        **base,
        "prompt": word.simplified,
        "prompt_hint": None,
        "prompt_label": "Which pronunciation is correct?",
        "options": options,
        "correct_answer": correct,
        "reveal": f"{word.simplified} ({word.pinyin}) = {word.english}",
    }


def generate_level_questions(db: Session, hsk_level: int, count: int) -> list[dict]:
    """
    Generate `count` mixed MCQ questions at the given HSK level.
    Falls back to `<= level` when the exact level has too few words.
    Raises ValueError when the vocabulary table can't support 4 options.
    """
    words = (
        db.query(models.HanziWord)
        .filter(models.HanziWord.hsk_level == hsk_level)
        .all()
    )
    if len(words) < max(count, 4):
        words = (
            db.query(models.HanziWord)
            .filter(models.HanziWord.hsk_level <= hsk_level)
            .all()
        )
    if len(words) < 4:
        raise ValueError(f"Not enough vocabulary for HSK level {hsk_level}")

    # Sample with re-use when count > vocabulary size
    selected = (
        random.sample(words, count)
        if count <= len(words)
        else [random.choice(words) for _ in range(count)]
    )

    questions = []
    for idx, word in enumerate(selected):
        pool = [w for w in words if w.id != word.id]
        q_type = _Q_ROTATION[idx % len(_Q_ROTATION)]
        questions.append(_build_question(idx, word, pool, q_type))
    return questions
