"""
AI Conversation Partner Service — uses multi-provider fallback (free tier first).
Provides Chinese conversation practice with corrections and vocabulary help.
"""
import json
import logging
from typing import List, Dict, AsyncGenerator

from app.services.ai_provider import generate_text, parse_json_response
from app.config import settings

logger = logging.getLogger(__name__)

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

_FALLBACK_GREETING = {
    "reply": "你好！我们来聊天吧！",
    "reply_pinyin": "nǐ hǎo! wǒmen lái liáotiān ba!",
    "reply_english": "Hello! Let's chat!",
    "corrections": [],
    "new_vocabulary": [],
}

_FALLBACK_REPLY = {
    "reply": "对不起，我没听清楚。你能再说一次吗？",
    "reply_pinyin": "duìbuqǐ, wǒ méi tīng qīngchǔ. nǐ néng zài shuō yī cì ma?",
    "reply_english": "Sorry, I didn't catch that. Can you say it again?",
    "corrections": [],
    "new_vocabulary": [],
}

_JSON_FORMAT = """\
You MUST respond with valid JSON in this exact format:
{
  "reply": "你的中文回复",
  "reply_pinyin": "nǐ de zhōngwén huífù",
  "reply_english": "Your Chinese reply translation",
  "corrections": [
    {"original": "wrong text", "corrected": "correct text", "explanation": "why it was wrong"}
  ],
  "new_vocabulary": [
    {"word": "新词", "pinyin": "xīn cí", "english": "new word"}
  ]
}

If the student's message has no errors, set corrections to an empty array [].
Include 0-2 new vocabulary words relevant to the conversation in new_vocabulary.
Always respond with ONLY the JSON object, no extra text."""


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

{_JSON_FORMAT}"""


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
        text, provider = await generate_text(prompt, exclude_paid=True)
        logger.info(f"Conversation started via {provider}")
        return parse_json_response(text)
    except json.JSONDecodeError:
        logger.warning("Failed to parse conversation start JSON, using fallback")
        return _FALLBACK_GREETING
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
        text, provider = await generate_text(full_prompt, exclude_paid=True)
        logger.info(f"Conversation reply via {provider}")
        return parse_json_response(text)
    except json.JSONDecodeError:
        logger.warning("Failed to parse conversation reply JSON, using fallback")
        return _FALLBACK_REPLY
    except Exception as e:
        logger.error(f"Conversation reply failed: {e}")
        raise


# ──────────────────────────────────────────────
# Streaming variants
# ──────────────────────────────────────────────

async def _stream_gemini_text(prompt: str) -> AsyncGenerator[str, None]:
    """Stream text token-by-token from Gemini. Yields text chunks."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text


async def stream_reply_to_message(
    message: str,
    hsk_level: int,
    history: List[Dict[str, str]],
) -> AsyncGenerator[str, None]:
    """
    Stream a conversation reply token-by-token via Gemini.

    Yields SSE-formatted strings:
      - ``data: {"type": "token", "text": "...chunk..."}\\n\\n``  for each token
      - ``data: {"type": "done", "data": {...full_response...}}\\n\\n``  at completion
      - ``data: {"type": "error", "message": "..."}\\n\\n``  on failure
    """
    system_prompt = _build_system_prompt(hsk_level, "free_talk")

    conversation_parts = [system_prompt + "\n\n"]
    for msg in history[-6:]:
        role = "Student" if msg["role"] == "user" else "You"
        conversation_parts.append(f"{role}: {msg['content']}")
    conversation_parts.append(f"Student: {message}")
    conversation_parts.append("Respond with ONLY valid JSON:")
    full_prompt = "\n".join(conversation_parts)

    # Try Gemini streaming first; fall back to non-streaming generate_text on error
    gemini_key = getattr(settings, "GEMINI_API_KEY", "")
    if gemini_key and gemini_key.strip():
        try:
            accumulated = ""
            async for chunk in _stream_gemini_text(full_prompt):
                accumulated += chunk
                yield f"data: {json.dumps({'type': 'token', 'text': chunk})}\n\n"

            # Parse the full accumulated JSON for the done event
            try:
                result = parse_json_response(accumulated)
            except json.JSONDecodeError:
                result = _FALLBACK_REPLY
            yield f"data: {json.dumps({'type': 'done', 'data': result})}\n\n"
            return
        except Exception as e:
            logger.warning(f"Gemini streaming failed, falling back to non-streaming: {e}")
            # Fall through to non-streaming fallback below

    # Non-streaming fallback — collect full response then emit as one token + done
    try:
        text, provider = await generate_text(full_prompt, exclude_paid=True)
        logger.info(f"Conversation stream reply (non-streaming) via {provider}")
        try:
            result = parse_json_response(text)
        except json.JSONDecodeError:
            result = _FALLBACK_REPLY
        # Emit the reply text as a single token so the frontend still gets a token event
        yield f"data: {json.dumps({'type': 'token', 'text': result.get('reply', '')})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'data': result})}\n\n"
    except Exception as e:
        logger.error(f"Conversation stream reply failed: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


async def stream_start_conversation(hsk_level: int, topic: str) -> AsyncGenerator[str, None]:
    """
    Stream the opening conversation message token-by-token.

    Yields the same SSE event format as stream_reply_to_message.
    """
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

    gemini_key = getattr(settings, "GEMINI_API_KEY", "")
    if gemini_key and gemini_key.strip():
        try:
            accumulated = ""
            async for chunk in _stream_gemini_text(prompt):
                accumulated += chunk
                yield f"data: {json.dumps({'type': 'token', 'text': chunk})}\n\n"

            try:
                result = parse_json_response(accumulated)
            except json.JSONDecodeError:
                result = _FALLBACK_GREETING
            yield f"data: {json.dumps({'type': 'done', 'data': result})}\n\n"
            return
        except Exception as e:
            logger.warning(f"Gemini streaming (start) failed, falling back: {e}")

    # Non-streaming fallback
    try:
        text, provider = await generate_text(prompt, exclude_paid=True)
        logger.info(f"Conversation stream start (non-streaming) via {provider}")
        try:
            result = parse_json_response(text)
        except json.JSONDecodeError:
            result = _FALLBACK_GREETING
        yield f"data: {json.dumps({'type': 'token', 'text': result.get('reply', '')})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'data': result})}\n\n"
    except Exception as e:
        logger.error(f"Conversation stream start failed: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
