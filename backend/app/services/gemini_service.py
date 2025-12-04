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


async def test_gemini_connection() -> bool:
    """Test if Gemini AI is configured correctly"""
    try:
        response = model.generate_content("Say hello in Chinese")
        return len(response.text) > 0
    except Exception as e:
        print(f"Gemini connection test failed: {e}")
        return False
