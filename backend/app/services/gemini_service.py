"""
AI Service for sentence validation, story generation, quizzes, mnemonics, and adventures.
Uses multi-provider fallback: Gemini → Groq → OpenRouter → Claude (paid, last resort).
"""

import json
import logging
from typing import AsyncGenerator, Dict, List, Optional

from app.services.ai_provider import generate_text, generate_json, parse_json_response

logger = logging.getLogger(__name__)


class SentenceValidationResult:
    """Result of sentence validation"""
    def __init__(
        self,
        is_correct: bool,
        score: int,
        feedback: str,
        corrections: Optional[List[str]] = None,
        grammar_issues: Optional[List[str]] = None,
        suggestions: Optional[List[str]] = None
    ):
        self.is_correct = is_correct
        self.score = score  # 0-100
        self.feedback = feedback
        self.corrections = corrections or []
        self.grammar_issues = grammar_issues or []
        self.suggestions = suggestions or []

    def to_dict(self) -> Dict:
        return {
            "is_correct": self.is_correct,
            "score": self.score,
            "feedback": self.feedback,
            "corrections": self.corrections,
            "grammar_issues": self.grammar_issues,
            "suggestions": self.suggestions
        }


async def validate_chinese_sentence(
    sentence: str,
    expected_meaning: Optional[str] = None,
    hsk_level: int = 1
) -> SentenceValidationResult:
    """Validate a Chinese sentence using AI (multi-provider fallback)."""

    prompt = f"""You are a Chinese language teacher. Analyze this Chinese sentence:

Sentence: {sentence}
HSK Level: {hsk_level}
{f'Expected meaning: {expected_meaning}' if expected_meaning else ''}

CRITICAL INSTRUCTION: Provide ALL explanations in ENGLISH ONLY.
- Use Chinese characters ONLY when showing example sentences
- All explanations, feedback, and grammar notes must be in English
- Format Chinese examples with pinyin in parentheses

Please provide:
1. Is the sentence grammatically correct? (yes/no)
2. Score the sentence from 0-100 (grammar, naturalness, appropriateness)
3. Detailed feedback IN ENGLISH on grammar, word choice, and structure
4. If incorrect, provide correct version(s) with English explanations
5. List any grammar issues IN ENGLISH
6. Suggest improvements IN ENGLISH

Format your response as JSON:
{{
  "is_correct": true/false,
  "score": 0-100,
  "feedback": "detailed feedback in ENGLISH",
  "corrections": ["correct sentence (pinyin) - English explanation"],
  "grammar_issues": ["grammar issue explained in ENGLISH"],
  "suggestions": ["suggestion in ENGLISH"]
}}

Example correction format: "我喜欢吃饭 (wǒ xǐhuan chīfàn) - Use this word order for 'I like to eat'"
Be encouraging but honest. Focus on learning."""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Sentence validation via {provider}")

        return SentenceValidationResult(
            is_correct=data.get("is_correct", False),
            score=data.get("score", 0),
            feedback=data.get("feedback", ""),
            corrections=data.get("corrections", []),
            grammar_issues=data.get("grammar_issues", []),
            suggestions=data.get("suggestions", [])
        )

    except Exception as e:
        logger.error(f"AI sentence validation failed: {e}")
        return SentenceValidationResult(
            is_correct=False,
            score=0,
            feedback=f"Unable to validate sentence. Error: {str(e)}",
            corrections=[],
            grammar_issues=["AI Error"],
            suggestions=["Please try again"]
        )


async def generate_sentence_exercise(
    words: List[str],
    difficulty: str = "easy",
    hsk_level: int = 1
) -> Dict:
    """Generate a sentence building exercise using given words."""

    words_str = ", ".join(words)

    prompt = f"""Create a Chinese sentence building exercise:

Available words: {words_str}
Difficulty: {difficulty}
HSK Level: {hsk_level}

Generate:
1. An English prompt/question that can be answered using these words
2. The correct Chinese sentence(s) using these words
3. Alternative correct answers if applicable
4. Hints for learners

Format as JSON:
{{
  "prompt": "English question or instruction",
  "correct_answers": ["sentence 1", "sentence 2"],
  "hints": ["hint 1", "hint 2"],
  "english_translation": "English translation of correct answer"
}}"""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Sentence exercise generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI sentence exercise failed: {e}")
        return {
            "prompt": "Create a sentence using the given words",
            "correct_answers": [],
            "hints": ["Try to form a simple sentence"],
            "english_translation": ""
        }


async def generate_story(
    hsk_level: int,
    topic: Optional[str] = None,
    character_names: Optional[List[str]] = None,
    length: str = "short"
) -> Dict:
    """Generate a Chinese story using AI (multi-provider fallback)."""

    length_guide = {
        "short": "100-200 Chinese characters",
        "medium": "200-400 Chinese characters",
        "long": "400-600 Chinese characters"
    }

    characters_str = ""
    if character_names:
        characters_str = f"\nCharacter names to use: {', '.join(character_names)}"

    topic_str = f"Topic: {topic}" if topic else "Topic: Daily life"

    prompt = f"""You are a creative Chinese language teacher. Create an engaging story for HSK Level {hsk_level} students.

Requirements:
- HSK Level: {hsk_level}
- {topic_str}
- Length: {length_guide.get(length, length_guide['short'])}
- Use ONLY HSK Level {hsk_level} vocabulary (and levels below)
- Simple, clear grammar appropriate for the level
- Engaging plot that students can relate to{characters_str}

CRITICAL PINYIN REQUIREMENTS:
- For "content_pinyin", provide CONTEXT-AWARE pinyin for ALL characters
- Use LOWERCASE pinyin with DIACRITIC tone marks ONLY (e.g., "wǒ", "hǎo", "ma", "le")
- NEVER use numbers (1/2/3/4/5/6) to represent tones — use diacritics: ā á ǎ à / ō ó ǒ ò / ē é ě è / ī í ǐ ì / ū ú ǔ ù
- Neutral tone syllables have NO tone mark at all (e.g., "le", "ma", "ne", "ba", "de", "ge", "men")
- For multi-pronunciation characters (多音字), use the CORRECT pronunciation based on context:
  * 了 → "le" (neutral tone, NO mark) when sentence-final particle or post-verb aspect marker
       → "liǎo" ONLY when it is a main verb meaning "to finish"
  * 还 → "hái" for "still/yet/also", "huán" for "to return (sth)"
  * 得 → "de" as structural particle, "dé" for "to get", "děi" for "must"
  * 地 → "de" as adverbial particle, "dì" for "ground/earth"
  * 的 → always "de"
- Separate each syllable with a SINGLE SPACE
- Match the EXACT order and count of characters in "content"

Provide the story in JSON format:
{{
  "title": "Story title in Chinese",
  "title_pinyin": "Title in pinyin",
  "title_english": "Title in English",
  "content": "Full story text in simplified Chinese",
  "content_pinyin": "Full story with context-aware pinyin, space-separated",
  "content_english": "Full English translation",
  "difficulty_level": {hsk_level},
  "word_count": <number of Chinese characters>,
  "key_vocabulary": [
    {{"simplified": "word", "pinyin": "pinyin", "english": "meaning"}},
    ...
  ],
  "grammar_points": ["grammar point 1", "grammar point 2"],
  "moral": "Story moral/lesson in English"
}}

Make it interesting and educational!"""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Story generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI story generation failed: {e}")
        raise Exception(f"Failed to generate story: {str(e)}")


async def generate_story_quiz(story_title: str, story_content: str, hsk_level: int) -> dict:
    """Generate comprehension quiz questions based on a specific story."""

    prompt = f"""Generate exactly 5 quiz questions about this Chinese story for HSK Level {hsk_level} learners.

Story Title: {story_title}
Story Content:
{story_content}

You MUST generate ALL 5 questions in this exact order:

QUESTIONS 1-3: Comprehension questions
QUESTION 4: Vocabulary meaning question — ask "What does '[hanzi]' mean?"
QUESTION 5: Pinyin question — ask "What is the correct pinyin for '[hanzi]'?"

For EACH of the 5 questions provide:
- A clear question in English (include hanzi in questions 4 and 5)
- 4 multiple choice options
- The correct answer index (0-3)
- A brief explanation

Return as JSON:
{{
  "questions": [
    {{
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }}
  ]
}}

Make ALL questions specific to THIS story."""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Story quiz generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI quiz generation failed: {e}")
        raise Exception(f"Failed to generate quiz: {str(e)}")


async def generate_mnemonic(
    hanzi: str,
    pinyin: str,
    english: str,
    hsk_level: int = 1
) -> Dict:
    """Generate a mnemonic story to help remember a Chinese character."""

    prompt = f"""Create a memorable mnemonic story for this Chinese character:

Character: {hanzi}
Pinyin: {pinyin}
English: {english}
HSK Level: {hsk_level}

Return as JSON:
{{
  "character": "{hanzi}",
  "visual_description": "Description of how the character looks",
  "mnemonic_story": "Creative 2-3 sentence story connecting visuals to meaning",
  "memory_hook": "One catchy sentence to remember",
  "radical_breakdown": "Brief breakdown of components"
}}

Make it fun and memorable!"""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Mnemonic generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI mnemonic generation failed: {e}")
        return {
            "character": hanzi,
            "visual_description": f"The character {hanzi} ({pinyin})",
            "mnemonic_story": f"Remember {hanzi} means '{english}'. Practice writing it several times!",
            "memory_hook": f"{hanzi} = {english}",
            "radical_breakdown": "See character breakdown for details"
        }


async def test_gemini_connection() -> bool:
    """Test if any AI provider is available."""
    try:
        text, provider = await generate_text(
            "Say hello in Chinese. Reply with only the Chinese text.",
            exclude_paid=True,
        )
        logger.info(f"AI connection test passed via {provider}: {text[:50]}")
        return True
    except Exception as e:
        logger.error(f"AI connection test failed: {e}")
        return False


async def generate_adventure_start(
    hsk_level: int,
    topic: str = "daily life"
) -> Dict:
    """Generate the opening of an interactive adventure story with 3 choices."""

    prompt = f"""You are a creative Chinese language teacher. Create the opening paragraph of an interactive adventure story for HSK Level {hsk_level} students.

Topic: {topic}

Requirements:
- Use ONLY HSK Level {hsk_level} vocabulary (and levels below)
- Opening paragraph: 2-4 sentences in Chinese
- Present 3 choices for what happens next

Return as JSON:
{{
  "paragraph": "Opening paragraph in simplified Chinese",
  "paragraph_pinyin": "Pinyin for the paragraph with tone marks",
  "paragraph_english": "English translation",
  "choices": [
    {{"id": 1, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}}
  ],
  "setting": "Brief English description of the setting"
}}

Make it fun and engaging! Keep sentences simple for HSK {hsk_level}."""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Adventure start generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI adventure start failed: {e}")
        raise Exception(f"Failed to generate adventure: {str(e)}")


async def generate_adventure_continue(
    story_so_far: str,
    chosen_option: str,
    hsk_level: int,
    step_number: int = 2
) -> Dict:
    """Continue an adventure story based on the user's choice."""

    is_ending = step_number >= 5

    ending_instruction = ""
    if is_ending:
        ending_instruction = """
IMPORTANT: This is the FINAL paragraph. Wrap up the story with a satisfying conclusion.
Do NOT provide choices. Instead, provide a "moral" field with the lesson learned.
Set "is_ending" to true."""
    else:
        ending_instruction = """Provide 3 new choices for what happens next. Set "is_ending" to false."""

    prompt = f"""Continue this interactive Chinese adventure story for HSK Level {hsk_level} students.

Story so far:
{story_so_far}

The reader chose: {chosen_option}

Requirements:
- Continue with 2-4 new sentences based on their choice
- Use ONLY HSK Level {hsk_level} vocabulary
- Keep it engaging and fun
{ending_instruction}

Return as JSON:
{{
  "paragraph": "Next paragraph in simplified Chinese",
  "paragraph_pinyin": "Pinyin with tone marks",
  "paragraph_english": "English translation",
  "is_ending": {'true' if is_ending else 'false'},
  {"\"moral\": \"Lesson learned in English\"," if is_ending else ""}
  "choices": [
    {{"id": 1, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}}
  ]
}}"""

    try:
        data, provider = await generate_json(prompt, exclude_paid=True)
        logger.info(f"Adventure continue generated via {provider}")
        return data
    except Exception as e:
        logger.error(f"AI adventure continue failed: {e}")
        raise Exception(f"Failed to continue adventure: {str(e)}")


async def generate_adventure_start_stream(
    hsk_level: int,
    topic: str = "daily life",
) -> AsyncGenerator[str, None]:
    """
    Gemini fallback: generates adventure start non-streaming, then sends full paragraph
    as tokens followed by a done event.  Gemini free tier doesn't support streaming
    in the same SDK-level way as Claude, so we batch-generate then fake the stream.
    """
    prompt = f"""You are a creative Chinese language teacher. Create the opening paragraph of an interactive adventure story for HSK Level {hsk_level} students.

Topic: {topic}

Requirements:
- Use ONLY HSK Level {hsk_level} vocabulary (and levels below)
- Opening paragraph: 2-4 sentences in Chinese
- Present 3 choices for what happens next

Return as JSON:
{{
  "paragraph": "Opening paragraph in simplified Chinese",
  "paragraph_pinyin": "Pinyin for the paragraph with tone marks",
  "paragraph_english": "English translation",
  "choices": [
    {{"id": 1, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Choice in Chinese", "text_pinyin": "Pinyin", "text_english": "English"}}
  ],
  "setting": "Brief English description of the setting"
}}

Make it fun and engaging! Keep sentences simple for HSK {hsk_level}."""

    data, provider = await generate_json(prompt, exclude_paid=True)
    logger.info(f"Adventure start (stream/batch) generated via {provider}")

    # Stream the paragraph text character by character
    paragraph = data.get("paragraph", "")
    for char in paragraph:
        yield f"data: {json.dumps({'type': 'token', 'text': char})}\n\n"

    yield f"data: {json.dumps({'type': 'done', 'data': data})}\n\n"


async def generate_adventure_continue_stream(
    story_so_far: str,
    chosen_option: str,
    hsk_level: int,
    step_number: int = 2,
) -> AsyncGenerator[str, None]:
    """
    Gemini fallback: generates adventure continue non-streaming, then fake-streams
    the paragraph text followed by a done event.
    """
    is_ending = step_number >= 5

    ending_instruction = ""
    if is_ending:
        ending_instruction = """
IMPORTANT: This is the FINAL paragraph. Wrap up the story with a satisfying conclusion.
Do NOT provide choices. Instead, provide a "moral" field with the lesson learned.
Set "is_ending" to true."""
    else:
        ending_instruction = """Provide 3 new choices for what happens next. Set "is_ending" to false."""

    prompt = f"""Continue this interactive Chinese adventure story for HSK Level {hsk_level} students.

Story so far:
{story_so_far}

The reader chose: {chosen_option}

Requirements:
- Continue with 2-4 new sentences based on their choice
- Use ONLY HSK Level {hsk_level} vocabulary
- Keep it engaging and fun
{ending_instruction}

Return as JSON:
{{
  "paragraph": "Next paragraph in simplified Chinese",
  "paragraph_pinyin": "Pinyin with tone marks",
  "paragraph_english": "English translation",
  "is_ending": {'true' if is_ending else 'false'},
  {"\"moral\": \"Lesson learned in English\"," if is_ending else ""}
  "choices": [
    {{"id": 1, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Chinese", "text_pinyin": "Pinyin", "text_english": "English"}}
  ]
}}"""

    data, provider = await generate_json(prompt, exclude_paid=True)
    logger.info(f"Adventure continue (stream/batch) generated via {provider}")

    paragraph = data.get("paragraph", "")
    for char in paragraph:
        yield f"data: {json.dumps({'type': 'token', 'text': char})}\n\n"

    yield f"data: {json.dumps({'type': 'done', 'data': data})}\n\n"
