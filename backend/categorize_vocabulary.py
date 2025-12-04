"""
Categorize existing vocabulary based on meaning and common word patterns
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# Category keywords for classification
CATEGORIES = {
    "number": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "hundred", "thousand", "zero"],
    "time": ["year", "month", "day", "hour", "minute", "second", "morning", "noon", "afternoon", "evening", "night", "today", "yesterday", "tomorrow", "week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "o'clock", "time", "when"],
    "person": ["i", "you", "he", "she", "they", "we", "who", "people", "person", "man", "woman", "child", "teacher", "student", "friend", "family", "father", "mother", "son", "daughter", "brother", "sister"],
    "food": ["eat", "drink", "rice", "noodle", "bread", "water", "tea", "coffee", "milk", "fruit", "apple", "food", "meal", "breakfast", "lunch", "dinner", "restaurant", "chicken", "beef", "pork", "fish", "vegetable"],
    "place": ["home", "school", "hospital", "restaurant", "hotel", "store", "shop", "room", "house", "building", "city", "country", "china", "beijing", "place", "where", "here", "there", "inside", "outside"],
    "verb": ["do", "make", "go", "come", "eat", "drink", "see", "look", "hear", "listen", "speak", "say", "tell", "think", "know", "want", "like", "love", "have", "get", "give", "buy", "sell", "work", "play", "read", "write", "study", "learn", "teach", "help", "can", "will", "should", "must"],
    "adjective": ["good", "bad", "big", "small", "many", "few", "new", "old", "hot", "cold", "happy", "sad", "fast", "slow", "tall", "short", "long", "far", "near", "high", "low", "beautiful", "pretty", "expensive", "cheap"],
    "question": ["what", "who", "where", "when", "why", "how", "which"],
    "color": ["red", "yellow", "blue", "green", "white", "black", "color"],
    "body": ["body", "head", "face", "eye", "nose", "mouth", "ear", "hand", "foot", "leg", "arm"],
    "clothing": ["clothes", "shirt", "pants", "dress", "shoes", "hat", "wear"],
    "transport": ["car", "bus", "train", "plane", "bicycle", "ride", "drive", "station"],
    "weather": ["weather", "rain", "wind", "snow", "sun", "cloud", "hot", "cold"],
    "money": ["money", "yuan", "dollar", "buy", "sell", "price", "expensive", "cheap"],
    "communication": ["phone", "call", "email", "letter", "message", "internet", "computer"],
    "school": ["school", "study", "learn", "teach", "class", "lesson", "test", "exam", "homework", "book", "pen", "pencil", "desk"],
}

# Special mappings for common Chinese characters
CHINESE_CATEGORY_MAP = {
    "我": "person",
    "你": "person",
    "他": "person",
    "她": "person",
    "们": "person",
    "的": "grammar",
    "是": "verb",
    "有": "verb",
    "在": "preposition",
    "了": "grammar",
    "吗": "question",
    "呢": "grammar",
    "不": "adverb",
    "没": "adverb",
    "很": "adverb",
    "太": "adverb",
    "都": "adverb",
    "也": "adverb",
    "还": "adverb",
    "就": "adverb",
    "一": "number",
    "二": "number",
    "三": "number",
    "四": "number",
    "五": "number",
    "六": "number",
    "七": "number",
    "八": "number",
    "九": "number",
    "十": "number",
    "百": "number",
    "千": "number",
    "万": "number",
}

def categorize_word(word: HanziWord) -> str:
    """Categorize a word based on its Chinese character or English meaning"""

    # Check Chinese mapping first
    if word.simplified in CHINESE_CATEGORY_MAP:
        return CHINESE_CATEGORY_MAP[word.simplified]

    # Check English meaning
    english_lower = word.english.lower()

    # Score each category based on keyword matches
    category_scores = {}
    for category, keywords in CATEGORIES.items():
        score = sum(1 for keyword in keywords if keyword in english_lower)
        if score > 0:
            category_scores[category] = score

    # Return category with highest score
    if category_scores:
        return max(category_scores, key=category_scores.get)

    # Default category
    return "other"

def main():
    db = SessionLocal()

    try:
        # Get all words
        words = db.query(HanziWord).all()

        print(f"\n{'='*60}")
        print("Categorizing Vocabulary")
        print(f"{'='*60}\n")

        categorized_count = 0
        category_counts = {}

        for word in words:
            # Skip if already categorized
            if word.category:
                continue

            # Categorize
            category = categorize_word(word)
            word.category = category

            categorized_count += 1
            category_counts[category] = category_counts.get(category, 0) + 1

            print(f"{word.simplified:3s} ({word.pinyin:10s}) -> {category:15s} | {word.english[:40]}")

        # Commit changes
        db.commit()

        print(f"\n{'='*60}")
        print(f"Categorization Complete!")
        print(f"{'='*60}")
        print(f"Total words categorized: {categorized_count}")
        print(f"\nCategory distribution:")
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {category:15s}: {count:3d} words")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
