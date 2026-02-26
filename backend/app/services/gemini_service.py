"""
Gemini AI Service for sentence validation and feedback
"""

import google.generativeai as genai
from typing import Dict, List, Optional
from app.config import settings

# Configure Gemini AI
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize model - using stable free tier model
model = genai.GenerativeModel('gemini-2.5-flash')


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
    """
    Validate a Chinese sentence using Gemini AI

    Args:
        sentence: The Chinese sentence to validate
        expected_meaning: Optional expected English meaning
        hsk_level: HSK level for vocabulary complexity check

    Returns:
        SentenceValidationResult with validation details
    """

    # Build prompt for Gemini
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
        # Call Gemini API
        response = model.generate_content(prompt)
        response_text = response.text

        # Parse JSON response
        import json
        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result_data = json.loads(response_text)

        # Create result object
        result = SentenceValidationResult(
            is_correct=result_data.get("is_correct", False),
            score=result_data.get("score", 0),
            feedback=result_data.get("feedback", ""),
            corrections=result_data.get("corrections", []),
            grammar_issues=result_data.get("grammar_issues", []),
            suggestions=result_data.get("suggestions", [])
        )

        return result

    except Exception as e:
        # Fallback response if API fails
        print(f"Gemini API Error: {e}")
        return SentenceValidationResult(
            is_correct=False,
            score=0,
            feedback=f"Unable to validate sentence. Error: {str(e)}",
            corrections=[],
            grammar_issues=["API Error"],
            suggestions=["Please try again"]
        )


async def generate_sentence_exercise(
    words: List[str],
    difficulty: str = "easy",
    hsk_level: int = 1
) -> Dict:
    """
    Generate a sentence building exercise using given words

    Args:
        words: List of Chinese words to use
        difficulty: easy, medium, or hard
        hsk_level: HSK level

    Returns:
        Dict with exercise data
    """

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
        response = model.generate_content(prompt)
        response_text = response.text

        # Parse JSON
        import json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        exercise_data = json.loads(response_text)
        return exercise_data

    except Exception as e:
        print(f"Gemini API Error: {e}")
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
    """
    Generate a Chinese story using Gemini AI

    Args:
        hsk_level: HSK level (1-6) for vocabulary complexity
        topic: Story topic/theme (e.g., "family", "school", "food")
        character_names: Optional character names to use
        length: "short" (100-200 chars), "medium" (200-400 chars), or "long" (400-600 chars)

    Returns:
        Dict with story data including Chinese text, pinyin, English translation
    """

    # Determine word count based on length
    length_guide = {
        "short": "100-200 Chinese characters",
        "medium": "200-400 Chinese characters",
        "long": "400-600 Chinese characters"
    }

    # Build character names string
    characters_str = ""
    if character_names:
        characters_str = f"\nCharacter names to use: {', '.join(character_names)}"

    # Build topic string
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
  * 了 → "le" (neutral tone, NO mark) when sentence-final particle or post-verb aspect marker (99% of cases)
       → "liǎo" ONLY when it is a main verb meaning "to finish" or in "了解/了不起" pattern
  * 还 → "hái" for "still/yet/also", "huán" for "to return (sth)"
  * 行 → "xíng" for "OK/to go/to walk", "háng" for "row/profession/bank"
  * 得 → "de" as structural particle (verb+得+complement), "dé" for "to get/obtain", "děi" for "must/have to"
  * 地 → "de" as adverbial particle (adjective+地+verb), "dì" for "ground/earth/place"
  * 的 → always "de" (never "dí" or "dì")
- Separate each syllable with a SINGLE SPACE
- Match the EXACT order and count of characters in "content" — one pinyin syllable per character, NO skipping punctuation in the count

Provide the story in JSON format:
{{
  "title": "Story title in Chinese",
  "title_pinyin": "Title in pinyin",
  "title_english": "Title in English",
  "content": "Full story text in simplified Chinese",
  "content_pinyin": "Full story with context-aware pinyin, one syllable per character, space-separated",
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
        response = model.generate_content(prompt)
        response_text = response.text

        # Parse JSON
        import json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        story_data = json.loads(response_text)
        return story_data

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise Exception(f"Failed to generate story: {str(e)}")


async def generate_story_quiz(story_title: str, story_content: str, hsk_level: int) -> dict:
    """
    Generate comprehension quiz questions based on a specific story
    """
    prompt = f"""Generate 3 comprehension questions about this Chinese story for HSK Level {hsk_level} learners.

Story Title: {story_title}
Story Content:
{story_content}

Create questions that test:
1. Main idea / theme understanding
2. Character actions / plot details
3. Vocabulary or grammar usage from the story

For EACH question provide:
- A clear question in English
- 4 multiple choice options (in English)
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
    }},
    ...
  ]
}}

Make questions specific to THIS story, not generic!"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text

        # Parse JSON
        import json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        quiz_data = json.loads(response_text)
        return quiz_data

    except Exception as e:
        print(f"Gemini API Error generating quiz: {e}")
        raise Exception(f"Failed to generate quiz: {str(e)}")


async def generate_mnemonic(
    hanzi: str,
    pinyin: str,
    english: str,
    hsk_level: int = 1
) -> Dict:
    """
    Generate a mnemonic story to help remember a Chinese character

    Args:
        hanzi: The Chinese character
        pinyin: Pinyin pronunciation
        english: English meaning
        hsk_level: HSK level for context

    Returns:
        Dict with mnemonic story and memory tips
    """

    prompt = f"""You are a creative Chinese language teacher. Create a memorable mnemonic story for this character:

Character: {hanzi}
Pinyin: {pinyin}
English: {english}
HSK Level: {hsk_level}

Create a vivid, memorable story that helps students remember this character. Include:
1. Visual imagery of the character's shape/radicals
2. Connection to the meaning
3. A short, creative mnemonic story (2-3 sentences)
4. Memory hook (one sentence)

Return as JSON:
{{
  "character": "{hanzi}",
  "visual_description": "Description of how the character looks",
  "mnemonic_story": "Creative 2-3 sentence story connecting visuals to meaning",
  "memory_hook": "One catchy sentence to remember",
  "radical_breakdown": "Brief breakdown of components if applicable"
}}

Make it fun, memorable, and educational!"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text

        # Parse JSON
        import json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        mnemonic_data = json.loads(response_text)
        return mnemonic_data

    except Exception as e:
        print(f"Gemini API Error generating mnemonic: {e}")
        # Fallback mnemonic
        return {
            "character": hanzi,
            "visual_description": f"The character {hanzi} ({pinyin})",
            "mnemonic_story": f"Remember {hanzi} means '{english}'. Practice writing it several times!",
            "memory_hook": f"{hanzi} = {english}",
            "radical_breakdown": "See character breakdown for details"
        }


async def test_gemini_connection() -> bool:
    """Test if Gemini AI is configured correctly"""
    try:
        response = model.generate_content("Say hello in Chinese")
        return len(response.text) > 0
    except Exception as e:
        print(f"Gemini connection test failed: {e}")
        return False
