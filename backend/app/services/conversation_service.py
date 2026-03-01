"""
AI Conversation Partner Service — uses Gemini free tier only.
Provides Chinese conversation practice with corrections and vocabulary help.
"""
import json
import logging
import google.generativeai as genai
from typing import List, Dict, Optional
from app.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Hardcoded topics — zero cost
TOPICS = [
    {"id": "daily_life", "label": "日常生活", "label_en": "Daily Life", "emoji": "🏠"},
    {"id": "food", "label": "美食", "label_en": "Food & Dining", "emoji": "🍜"},
    {"id": "travel", "label": "旅行", "label_en": "Travel", "emoji": "✈️"},
    {"id": "shopping", "label": "购物", "label_en": "Shopping", "emoji": "🛍️"},
    {"id": "school", "label": "学校", "label_en": "School & Study", "emoji": "📚"},
    {"id": "work", "label": "工作", "label_en": "Work & Career", "emoji": "💼"},
    {"id": "hobbies", "label": "爱好", "label_en": "Hobbies", "emoji": "🎨"},
    {"id": "health", "label": "健康", "label_en": "Health", "emoji": "🏥"},
    {"id": "weather", "label": "天气", "label_en": "Weather", "emoji": "🌤️"},
    {"id": "family", "label": "家人", "label_en": "Family", "emoji": "👨‍👩‍👧"},
    {"id": "free_talk", "label": "自由聊天", "label_en": "Free Talk", "emoji": "💬"},
]

HSK_DESCRIPTIONS = {
    1: "Use only HSK 1 vocabulary (150 words). Very simple sentences. Basic greetings, numbers, time.",
    2: "Use HSK 1-2 vocabulary (300 words). Simple sentences. Daily activities, shopping, transport.",
    3: "Use HSK 1-3 vocabulary (600 words). Moderate complexity. Express opinions, describe experiences.",
    4: "Use HSK 1-4 vocabulary (1200 words). Complex sentences. Discuss topics, tell stories.",
    5: "Use HSK 1-5 vocabulary (2500 words). Advanced discussions. Abstract topics, nuanced opinions.",
    6: "Use all HSK vocabulary (5000+ words). Near-native. Idioms, literary expressions, complex arguments.",
}


def _build_system_prompt(hsk_level: int, topic: str) -> str:
    topic_info = next((t for t in TOPICS if t["id"] == topic), None)
    topic_label = topic_info["label_en"] if topic_info else topic

    return f"""You are a friendly Chinese conversation partner helping a student practice Mandarin Chinese.

RULES:
- The student's level is HSK {hsk_level}. {HSK_DESCRIPTIONS.get(hsk_level, HSK_DESCRIPTIONS[3])}
- The conversation topic is: {topic_label}
- ALWAYS respond in Chinese characters as your main reply
- Keep your replies concise (1-3 sentences max)
- If the student makes mistakes, gently correct them
- Ask follow-up questions to keep the conversation going
- Be encouraging and patient

You MUST respond with valid JSON in this exact format:
{{
  "reply": "你的中文回复",
  "reply_pinyin": "nǐ de zhōngwén huífù",
  "reply_english": "Your Chinese reply translation",
  "corrections": [
    {{"original": "wrong text", "corrected": "correct text", "explanation": "why it was wrong"}}
  ],
  "new_vocabulary": [
    {{"word": "新词", "pinyin": "xīn cí", "english": "new word"}}
  ]
}}

If the student's message has no errors, set corrections to an empty array [].
Include 0-2 new vocabulary words relevant to the conversation in new_vocabulary.
Always respond with ONLY the JSON object, no extra text."""


async def start_conversation(hsk_level: int, topic: str) -> Dict:
    """Start a new conversation with an opening message."""
    topic_info = next((t for t in TOPICS if t["id"] == topic), None)
    topic_label = topic_info["label_en"] if topic_info else topic

    prompt = f"""Start a casual Chinese conversation about {topic_label} with a student at HSK {hsk_level} level.
Say hello and ask them an opening question about the topic.
{HSK_DESCRIPTIONS.get(hsk_level, HSK_DESCRIPTIONS[3])}

Respond with ONLY valid JSON:
{{
  "reply": "你好！...",
  "reply_pinyin": "nǐ hǎo! ...",
  "reply_english": "Hello! ...",
  "corrections": [],
  "new_vocabulary": []
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse Gemini JSON response: {response.text[:200]}")
        return {
            "reply": "你好！我们来聊天吧！",
            "reply_pinyin": "nǐ hǎo! wǒmen lái liáotiān ba!",
            "reply_english": "Hello! Let's chat!",
            "corrections": [],
            "new_vocabulary": [],
        }
    except Exception as e:
        logger.error(f"Conversation start failed: {e}")
        raise


async def reply_to_message(
    message: str,
    hsk_level: int,
    history: List[Dict[str, str]],
) -> Dict:
    """Reply to a user's message in the conversation."""
    system_prompt = _build_system_prompt(hsk_level, "free_talk")

    # Build conversation for context
    conversation_parts = [system_prompt + "\n\n"]
    for msg in history[-6:]:  # Keep last 6 messages for context
        role = "Student" if msg["role"] == "user" else "You"
        conversation_parts.append(f"{role}: {msg['content']}")

    conversation_parts.append(f"Student: {message}")
    conversation_parts.append("Respond with ONLY valid JSON:")

    full_prompt = "\n".join(conversation_parts)

    try:
        response = model.generate_content(full_prompt)
        text = response.text.strip()
        # Strip markdown code fences
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse Gemini reply JSON: {response.text[:200]}")
        return {
            "reply": "对不起，我没听清楚。你能再说一次吗？",
            "reply_pinyin": "duìbuqǐ, wǒ méi tīng qīngchǔ. nǐ néng zài shuō yī cì ma?",
            "reply_english": "Sorry, I didn't catch that. Can you say it again?",
            "corrections": [],
            "new_vocabulary": [],
        }
    except Exception as e:
        logger.error(f"Conversation reply failed: {e}")
        raise
