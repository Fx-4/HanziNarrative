"""
Claude AI Story Generation Service
Uses claude-opus-4-6 with adaptive thinking for uniquely crafted Chinese learning stories.
"""

import json
import random
from typing import Dict, List, Optional, AsyncGenerator
import anthropic
from app.config import settings

# ---------------------------------------------------------------------------
# Client initialisation (lazy – only used if ANTHROPIC_API_KEY is set)
# ---------------------------------------------------------------------------

def _get_client() -> anthropic.AsyncAnthropic:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError(
            "ANTHROPIC_API_KEY is not configured. "
            "Add it to backend/.env to enable Claude story generation."
        )
    return anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


# ---------------------------------------------------------------------------
# Story flavour banks — injected into the prompt for variety
# ---------------------------------------------------------------------------

SETTINGS_BANK = [
    "a narrow Beijing hutong alley where neighbours share courtyards and gossip",
    "a bustling Chengdu tea house where locals play mahjong and sip jasmine tea",
    "a morning wet-market in Guangzhou with fresh vegetables and lively haggling",
    "a high-speed train (高铁) journey from Shanghai to Xi'an through misty countryside",
    "a university campus in Wuhan during autumn, golden leaves on the paths",
    "a small family-run noodle shop in Lanzhou famous for its hand-pulled noodles",
    "a cherry-blossom park in Wuhan in spring, full of families and food stalls",
    "a night market in Taipei glowing with colourful lanterns and street-food aromas",
    "a mountain village in Yunnan where the Naxi people still play ancient music",
    "a quiet bookshop in a Shanghai French Concession side street",
    "a busy subway station in Beijing during rush hour",
    "a fishing harbour in Qingdao at dawn, fishing boats just returning",
]

ARCHETYPES_BY_LEVEL = {
    1: ["a child making a new friend", "buying food at a market", "a lost puppy found", "helping a grandparent"],
    2: ["a surprise birthday plan", "getting lost and asking directions", "a cooking competition at school", "a rainy day adventure"],
    3: ["solving a neighbourhood mystery", "a pen-pal who visits in person", "a family heirloom rediscovered", "entering a talent show"],
    4: ["a cross-country solo trip", "uncovering a family secret", "a business deal gone wrong that turns right", "mentoring a younger student"],
    5: ["a philosophical debate at a tea house", "restoring an ancient craft technique", "a journalist uncovering a heartwarming story", "bridging a generational misunderstanding"],
    6: ["an author finishing their memoir", "negotiating a cultural exchange", "a scientist returning to their hometown roots", "reinterpreting a classic Chinese fable"],
}

CHARACTER_NAMES = [
    ("小明", "Xiǎo Míng"), ("小红", "Xiǎo Hóng"), ("小龙", "Xiǎo Lóng"),
    ("阿芳", "Ā Fāng"), ("阿杰", "Ā Jié"), ("老王", "Lǎo Wáng"),
    ("李华", "Lǐ Huá"), ("陈静", "Chén Jìng"), ("张伟", "Zhāng Wěi"),
    ("王梅", "Wáng Méi"), ("刘阳", "Liú Yáng"), ("周兰", "Zhōu Lán"),
]

# ---------------------------------------------------------------------------
# System prompt — shared across story generation calls
# ---------------------------------------------------------------------------

STORYTELLER_SYSTEM = """\
You are a master Chinese storyteller and language pedagogue.
Your stories are celebrated for three qualities:
1. AUTHENTIC CULTURAL TEXTURE — specific sights, sounds, smells, and social customs from real Chinese life.
2. NARRATIVE CRAFT — a clear hook, rising tension, and a satisfying payoff; characters feel human, not cardboard.
3. INVISIBLE PEDAGOGY — vocabulary and grammar appear in context so naturally that learners absorb them without noticing.

Guiding principles:
- Never write a generic "A went to B and did C" story.  Give readers a reason to care in the first sentence.
- Dialogue is your friend — it reveals character and lets learners see natural sentence patterns in action.
- Sprinkle small cultural details (a specific dish, a local custom, a seasonal festival) that make the world vivid.
- The moral or theme should emerge from events, never be stated as a lecture.
- Always output ONLY valid JSON with no prose outside the JSON block.
"""

# ---------------------------------------------------------------------------
# Core generation functions
# ---------------------------------------------------------------------------

async def generate_story(
    hsk_level: int,
    topic: Optional[str] = None,
    character_names: Optional[List[str]] = None,
    length: str = "short",
) -> Dict:
    """
    Generate a uniquely crafted Chinese story using Claude claude-opus-4-6.

    Returns the same dict structure as the old Gemini-based generate_story()
    so the router needs no changes.
    """
    client = _get_client()

    # Pick random flavour details to ensure every story is different
    setting = random.choice(SETTINGS_BANK)
    level_archetypes = ARCHETYPES_BY_LEVEL.get(hsk_level, ARCHETYPES_BY_LEVEL[3])
    archetype = random.choice(level_archetypes)

    # Character names
    if character_names:
        chars_str = " and ".join(character_names)
    else:
        chosen = random.sample(CHARACTER_NAMES, k=min(2, len(CHARACTER_NAMES)))
        chars_str = " and ".join(f"{c[0]} ({c[1]})" for c in chosen)

    length_guide = {
        "short":  "100–200 Chinese characters",
        "medium": "200–400 Chinese characters",
        "long":   "400–600 Chinese characters",
    }
    char_target = length_guide.get(length, length_guide["short"])

    topic_line = f"Thematic focus: {topic}" if topic else "Thematic focus: choose whatever fits the setting and archetype best"

    prompt = f"""Create a compelling Chinese learning story with these creative constraints:

SETTING: {setting}
STORY ARCHETYPE: {archetype}
PROTAGONIST(S): {chars_str}
{topic_line}
HSK LEVEL: {hsk_level} — use ONLY vocabulary at or below this level
TARGET LENGTH: {char_target}

CRAFT REQUIREMENTS:
- Open with a sensory hook or a snippet of dialogue — not "One day…"
- Include at least one moment of tension or surprise
- Use 2–4 lines of authentic-sounding dialogue
- Weave cultural details (food, custom, place name) into the narrative naturally
- End with a small but meaningful resolution that lingers

PINYIN RULES (critical — follow exactly):
- content_pinyin: one pinyin syllable per Chinese character, space-separated, diacritics (ā á ǎ à), NO numbers
- Neutral-tone particles (的 地 得 了 吗 呢 吧 嘛 啊) → no tone mark
- 了 → "le" when aspect marker / sentence-final; "liǎo" only as main verb "to finish"
- 还 → "hái" (still/also) or "huán" (return sth) based on context
- 得 → "de" (structural particle), "dé" (obtain), "děi" (must)
- Syllable count in content_pinyin MUST equal character count in content

Output ONLY this JSON (no markdown fences, no extra text):
{{
  "title": "Story title in Chinese",
  "title_pinyin": "Title pinyin with tone marks",
  "title_english": "Title in English",
  "content": "Full story in simplified Chinese",
  "content_pinyin": "Space-separated pinyin, one syllable per character",
  "content_english": "Natural English translation",
  "difficulty_level": {hsk_level},
  "word_count": <integer character count of content>,
  "key_vocabulary": [
    {{"simplified": "汉字", "pinyin": "hàn zì", "english": "Chinese characters"}},
    {{"simplified": "...", "pinyin": "...", "english": "..."}}
  ],
  "grammar_points": ["grammar point 1 in English", "grammar point 2"],
  "moral": "The story's theme or takeaway in one sentence",
  "setting": "{setting}",
  "archetype": "{archetype}"
}}"""

    # Use streaming + get_final_message to avoid timeouts on long outputs
    full_text = ""
    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        system=STORYTELLER_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            full_text += text

    # Strip any accidental markdown fences
    cleaned = full_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[-2] if "```" in cleaned[3:] else cleaned[3:]
        # remove leading language tag like "json"
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    story_data = json.loads(cleaned)
    return story_data


async def generate_story_quiz(
    story_title: str,
    story_content: str,
    hsk_level: int,
) -> Dict:
    """
    Generate 5 rich comprehension + language questions for a story.
    Drop-in replacement for the Gemini version.
    """
    client = _get_client()

    prompt = f"""You are a Chinese language quiz designer. Create exactly 5 questions about this story.

Story Title: {story_title}
HSK Level: {hsk_level}
Story:
{story_content}

QUESTION DESIGN RULES:
Q1 — Main idea / theme (why did it happen, what does it mean?)
Q2 — Character action or motivation (what did X do, why?)
Q3 — Cultural or contextual detail from the story
Q4 — Vocabulary: pick ONE word that appears in the story, ask "What does '词' mean?" with 4 English options
Q5 — Pinyin: pick a DIFFERENT word, ask "What is the pinyin for '词'?" with 4 pinyin options (use tone diacritics)

Distractors for Q4 and Q5 must be plausible — not obviously wrong.

Output ONLY this JSON:
{{
  "questions": [
    {{
      "question": "Question text (include hanzi for Q4 and Q5)",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}"""

    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        full_text = ""
        async for text in stream.text_stream:
            full_text += text

    cleaned = full_text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        cleaned = parts[1] if len(parts) >= 2 else parts[-1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    return json.loads(cleaned)


async def stream_story_chunks(
    hsk_level: int,
    topic: Optional[str] = None,
    character_names: Optional[List[str]] = None,
    length: str = "short",
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE-formatted chunks of the story JSON
    as Claude produces them.  Used by the /stories/generate-stream endpoint.
    """
    client = _get_client()

    setting = random.choice(SETTINGS_BANK)
    level_archetypes = ARCHETYPES_BY_LEVEL.get(hsk_level, ARCHETYPES_BY_LEVEL[3])
    archetype = random.choice(level_archetypes)

    if character_names:
        chars_str = " and ".join(character_names)
    else:
        chosen = random.sample(CHARACTER_NAMES, k=min(2, len(CHARACTER_NAMES)))
        chars_str = " and ".join(f"{c[0]} ({c[1]})" for c in chosen)

    length_guide = {
        "short":  "100–200 Chinese characters",
        "medium": "200–400 Chinese characters",
        "long":   "400–600 Chinese characters",
    }
    char_target = length_guide.get(length, length_guide["short"])
    topic_line = f"Thematic focus: {topic}" if topic else "Thematic focus: choose whatever fits the setting and archetype best"

    prompt = f"""Create a compelling Chinese learning story with these creative constraints:

SETTING: {setting}
STORY ARCHETYPE: {archetype}
PROTAGONIST(S): {chars_str}
{topic_line}
HSK LEVEL: {hsk_level}
TARGET LENGTH: {char_target}

Open with a sensory hook or dialogue. Include tension, dialogue, cultural detail, and a satisfying ending.

PINYIN RULES: one syllable per character, diacritics (ā á ǎ à), no numbers, neutral tones unmarked.

Output ONLY valid JSON (no markdown):
{{
  "title": "...", "title_pinyin": "...", "title_english": "...",
  "content": "...", "content_pinyin": "...", "content_english": "...",
  "difficulty_level": {hsk_level}, "word_count": 0,
  "key_vocabulary": [{{"simplified":"","pinyin":"","english":""}}],
  "grammar_points": [], "moral": "...",
  "setting": "{setting}", "archetype": "{archetype}"
}}"""

    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        system=STORYTELLER_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            # Yield each text chunk as an SSE data line
            yield f"data: {json.dumps({'chunk': text})}\n\n"

    yield "data: [DONE]\n\n"


async def generate_adventure_start(
    hsk_level: int,
    topic: str = "daily life",
) -> Dict:
    """
    Generate the opening of an interactive adventure with 3 choices.
    Thin wrapper that delegates to Claude instead of Gemini.
    """
    client = _get_client()

    setting = random.choice(SETTINGS_BANK)
    level_archetypes = ARCHETYPES_BY_LEVEL.get(hsk_level, ARCHETYPES_BY_LEVEL[3])
    archetype = random.choice(level_archetypes)

    prompt = f"""Create the opening of an interactive Chinese learning adventure for HSK {hsk_level} students.

Setting: {setting}
Situation: {archetype}
Topic flavour: {topic}

Requirements:
- 2–4 sentences of engaging Chinese text at HSK {hsk_level} level
- End with a genuine decision moment that matters to the protagonist
- 3 distinct choices — each leads somewhere clearly different

Output ONLY this JSON:
{{
  "paragraph": "Opening in simplified Chinese",
  "paragraph_pinyin": "Pinyin with diacritics",
  "paragraph_english": "English translation",
  "choices": [
    {{"id": 1, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}}
  ],
  "setting": "{setting}"
}}"""

    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        full_text = ""
        async for text in stream.text_stream:
            full_text += text

    cleaned = full_text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(cleaned)


async def generate_adventure_continue(
    story_so_far: str,
    chosen_option: str,
    hsk_level: int,
    step_number: int = 2,
) -> Dict:
    """
    Continue an interactive adventure based on the user's choice.
    """
    client = _get_client()

    is_ending = step_number >= 5
    ending_instruction = (
        'This is the FINAL paragraph — write a satisfying conclusion. '
        'Set "is_ending": true and include a "moral" field. Do NOT include "choices".'
        if is_ending
        else 'Provide 3 new choices. Set "is_ending": false.'
    )

    prompt = f"""Continue this interactive Chinese adventure (HSK {hsk_level}).

Story so far:
{story_so_far}

The reader chose: {chosen_option}

Write 2–4 new sentences continuing naturally from that choice.
Use only HSK {hsk_level} vocabulary. Keep it engaging.
{ending_instruction}

Output ONLY JSON:
{{
  "paragraph": "Next paragraph in simplified Chinese",
  "paragraph_pinyin": "Pinyin with diacritics",
  "paragraph_english": "English translation",
  "is_ending": {'true' if is_ending else 'false'},
  {"\"moral\": \"Lesson in English\"," if is_ending else ""}
  "choices": [
    {{"id": 1, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}},
    {{"id": 2, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}},
    {{"id": 3, "text": "Chinese", "text_pinyin": "pinyin", "text_english": "English"}}
  ]
}}"""

    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        full_text = ""
        async for text in stream.text_stream:
            full_text += text

    cleaned = full_text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(cleaned)
