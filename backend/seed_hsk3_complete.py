"""
Complete HSK 3 vocabulary - Adding missing words to reach 300 total
Based on official HSK 3.0 word list
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# These are common HSK 3 words that might be missing
hsk3_additional_words = [
    # Format: (simplified, traditional, pinyin, english, strokes, category, radical)
    ("打扫", "打掃", "dǎ sǎo", "to clean; to sweep", 8, "verb", "扌"),
    ("礼物", "禮物", "lǐ wù", "gift; present", 8, "noun", "礻"),
    ("数学", "數學", "shù xué", "mathematics", 13, "noun", "攵"),
    ("历史", "歷史", "lì shǐ", "history", 5, "noun", "厂"),
    ("生气", "生氣", "shēng qì", "to get angry", 4, "verb", "气"),
    ("节目", "節目", "jié mù", "program; show", 5, "noun", "目"),
    ("打算", "打算", "dǎ suàn", "to plan; to intend", 6, "verb", "扌"),
]

def seed_hsk3_additional():
    """Add additional HSK 3 words"""
    db = SessionLocal()

    try:
        added_count = 0
        for word_data in hsk3_additional_words:
            simplified, traditional, pinyin, english, strokes, category, radical = word_data

            # Check if word already exists
            existing = db.query(HanziWord).filter(
                HanziWord.simplified == simplified,
                HanziWord.hsk_level == 3
            ).first()

            if not existing:
                word = HanziWord(
                    simplified=simplified,
                    traditional=traditional,
                    pinyin=pinyin,
                    english=english,
                    hsk_level=3,
                    strokes=strokes,
                    category=category,
                    radical=radical
                )
                db.add(word)
                added_count += 1
                print(f"Added: {simplified} ({pinyin}) - {english}")
            else:
                print(f"Already exists: {simplified}")

        db.commit()
        print(f"\n✓ Successfully added {added_count} HSK 3 words")
        print(f"Total HSK 3 words should now be close to 300")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk3_additional()
