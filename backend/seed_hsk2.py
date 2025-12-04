"""
Seed HSK 2 vocabulary
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# HSK 2 Vocabulary (300 words) - Selection of common words
hsk2_vocab = [
    # Time & Dates
    {"simplified": "春", "traditional": "春", "pinyin": "chūn", "english": "spring", "category": "time"},
    {"simplified": "夏", "traditional": "夏", "pinyin": "xià", "english": "summer", "category": "time"},
    {"simplified": "秋", "traditional": "秋", "pinyin": "qiū", "english": "autumn", "category": "time"},
    {"simplified": "冬", "traditional": "冬", "pinyin": "dōng", "english": "winter", "category": "time"},
    {"simplified": "分", "traditional": "分", "pinyin": "fēn", "english": "minute", "category": "time"},
    {"simplified": "刻", "traditional": "刻", "pinyin": "kè", "english": "quarter (of an hour)", "category": "time"},

    # Verbs
    {"simplified": "唱", "traditional": "唱", "pinyin": "chàng", "english": "to sing", "category": "verb"},
    {"simplified": "跳", "traditional": "跳", "pinyin": "tiào", "english": "to jump; to dance", "category": "verb"},
    {"simplified": "游", "traditional": "游", "pinyin": "yóu", "english": "to swim; to travel", "category": "verb"},
    {"simplified": "玩", "traditional": "玩", "pinyin": "wán", "english": "to play; to have fun", "category": "verb"},
    {"simplified": "睡", "traditional": "睡", "pinyin": "shuì", "english": "to sleep", "category": "verb"},
    {"simplified": "起", "traditional": "起", "pinyin": "qǐ", "english": "to rise; to get up", "category": "verb"},
    {"simplified": "问", "traditional": "問", "pinyin": "wèn", "english": "to ask", "category": "verb"},
    {"simplified": "答", "traditional": "答", "pinyin": "dá", "english": "to answer", "category": "verb"},
    {"simplified": "给", "traditional": "給", "pinyin": "gěi", "english": "to give", "category": "verb"},
    {"simplified": "借", "traditional": "借", "pinyin": "jiè", "english": "to borrow; to lend", "category": "verb"},
    {"simplified": "还", "traditional": "還", "pinyin": "huán", "english": "to return (something)", "category": "verb"},
    {"simplified": "帮", "traditional": "幫", "pinyin": "bāng", "english": "to help", "category": "verb"},
    {"simplified": "完", "traditional": "完", "pinyin": "wán", "english": "to finish", "category": "verb"},
    {"simplified": "开", "traditional": "開", "pinyin": "kāi", "english": "to open; to start", "category": "verb"},
    {"simplified": "关", "traditional": "關", "pinyin": "guān", "english": "to close", "category": "verb"},
    {"simplified": "懂", "traditional": "懂", "pinyin": "dǒng", "english": "to understand", "category": "verb"},
    {"simplified": "穿", "traditional": "穿", "pinyin": "chuān", "english": "to wear", "category": "verb"},
    {"simplified": "带", "traditional": "帶", "pinyin": "dài", "english": "to bring; to carry", "category": "verb"},
    {"simplified": "换", "traditional": "換", "pinyin": "huàn", "english": "to change; to exchange", "category": "verb"},

    # Adjectives & Descriptions
    {"simplified": "长", "traditional": "長", "pinyin": "cháng", "english": "long", "category": "adjective"},
    {"simplified": "短", "traditional": "短", "pinyin": "duǎn", "english": "short", "category": "adjective"},
    {"simplified": "新", "traditional": "新", "pinyin": "xīn", "english": "new", "category": "adjective"},
    {"simplified": "旧", "traditional": "舊", "pinyin": "jiù", "english": "old (things)", "category": "adjective"},
    {"simplified": "快", "traditional": "快", "pinyin": "kuài", "english": "fast; quick", "category": "adjective"},
    {"simplified": "慢", "traditional": "慢", "pinyin": "màn", "english": "slow", "category": "adjective"},
    {"simplified": "早", "traditional": "早", "pinyin": "zǎo", "english": "early", "category": "adjective"},
    {"simplified": "晚", "traditional": "晚", "pinyin": "wǎn", "english": "late", "category": "adjective"},
    {"simplified": "近", "traditional": "近", "pinyin": "jìn", "english": "near; close", "category": "adjective"},
    {"simplified": "远", "traditional": "遠", "pinyin": "yuǎn", "english": "far", "category": "adjective"},
    {"simplified": "高", "traditional": "高", "pinyin": "gāo", "english": "tall; high", "category": "adjective"},
    {"simplified": "低", "traditional": "低", "pinyin": "dī", "english": "low", "category": "adjective"},
    {"simplified": "胖", "traditional": "胖", "pinyin": "pàng", "english": "fat", "category": "adjective"},
    {"simplified": "瘦", "traditional": "瘦", "pinyin": "shòu", "english": "thin; skinny", "category": "adjective"},
    {"simplified": "聪", "traditional": "聰", "pinyin": "cōng", "english": "clever", "category": "adjective"},
    {"simplified": "明", "traditional": "明", "pinyin": "míng", "english": "bright; clear", "category": "adjective"},

    # Places
    {"simplified": "银", "traditional": "銀", "pinyin": "yín", "english": "silver; bank", "category": "place"},
    {"simplified": "行", "traditional": "行", "pinyin": "háng", "english": "bank; row", "category": "place"},
    {"simplified": "公", "traditional": "公", "pinyin": "gōng", "english": "public; company", "category": "place"},
    {"simplified": "司", "traditional": "司", "pinyin": "sī", "english": "to manage; company", "category": "place"},
    {"simplified": "超", "traditional": "超", "pinyin": "chāo", "english": "super; to exceed", "category": "place"},
    {"simplified": "市", "traditional": "市", "pinyin": "shì", "english": "market; city", "category": "place"},
    {"simplified": "邮", "traditional": "郵", "pinyin": "yóu", "english": "post; mail", "category": "place"},
    {"simplified": "局", "traditional": "局", "pinyin": "jú", "english": "bureau; office", "category": "place"},

    # Body Parts
    {"simplified": "头", "traditional": "頭", "pinyin": "tóu", "english": "head", "category": "body"},
    {"simplified": "发", "traditional": "髮", "pinyin": "fà", "english": "hair", "category": "body"},
    {"simplified": "眼", "traditional": "眼", "pinyin": "yǎn", "english": "eye", "category": "body"},
    {"simplified": "睛", "traditional": "睛", "pinyin": "jīng", "english": "eyeball", "category": "body"},
    {"simplified": "耳", "traditional": "耳", "pinyin": "ěr", "english": "ear", "category": "body"},
    {"simplified": "朵", "traditional": "朵", "pinyin": "duǒ", "english": "measure word for flowers/clouds; ear", "category": "body"},
    {"simplified": "鼻", "traditional": "鼻", "pinyin": "bí", "english": "nose", "category": "body"},
    {"simplified": "嘴", "traditional": "嘴", "pinyin": "zuǐ", "english": "mouth", "category": "body"},
    {"simplified": "牙", "traditional": "牙", "pinyin": "yá", "english": "tooth", "category": "body"},
    {"simplified": "齿", "traditional": "齒", "pinyin": "chǐ", "english": "tooth; teeth", "category": "body"},
    {"simplified": "腿", "traditional": "腿", "pinyin": "tuǐ", "english": "leg", "category": "body"},
    {"simplified": "脚", "traditional": "腳", "pinyin": "jiǎo", "english": "foot", "category": "body"},

    # Family & People
    {"simplified": "丈", "traditional": "丈", "pinyin": "zhàng", "english": "husband; measure word", "category": "person"},
    {"simplified": "夫", "traditional": "夫", "pinyin": "fū", "english": "husband; man", "category": "person"},
    {"simplified": "妻", "traditional": "妻", "pinyin": "qī", "english": "wife", "category": "person"},
    {"simplified": "子", "traditional": "子", "pinyin": "zǐ", "english": "child; son", "category": "person"},
    {"simplified": "哥", "traditional": "哥", "pinyin": "gē", "english": "older brother", "category": "person"},
    {"simplified": "弟", "traditional": "弟", "pinyin": "dì", "english": "younger brother", "category": "person"},
    {"simplified": "姐", "traditional": "姐", "pinyin": "jiě", "english": "older sister", "category": "person"},
    {"simplified": "妹", "traditional": "妹", "pinyin": "mèi", "english": "younger sister", "category": "person"},

    # Colors
    {"simplified": "红", "traditional": "紅", "pinyin": "hóng", "english": "red", "category": "color"},
    {"simplified": "黄", "traditional": "黃", "pinyin": "huáng", "english": "yellow", "category": "color"},
    {"simplified": "蓝", "traditional": "藍", "pinyin": "lán", "english": "blue", "category": "color"},
    {"simplified": "绿", "traditional": "綠", "pinyin": "lǜ", "english": "green", "category": "color"},
    {"simplified": "黑", "traditional": "黑", "pinyin": "hēi", "english": "black", "category": "color"},
    {"simplified": "白", "traditional": "白", "pinyin": "bái", "english": "white", "category": "color"},
    {"simplified": "灰", "traditional": "灰", "pinyin": "huī", "english": "gray", "category": "color"},

    # Numbers & Quantities
    {"simplified": "千", "traditional": "千", "pinyin": "qiān", "english": "thousand", "category": "number"},
    {"simplified": "万", "traditional": "萬", "pinyin": "wàn", "english": "ten thousand", "category": "number"},

    # Food & Drinks
    {"simplified": "面", "traditional": "麵", "pinyin": "miàn", "english": "noodles", "category": "food"},
    {"simplified": "包", "traditional": "包", "pinyin": "bāo", "english": "bun; bag", "category": "food"},
    {"simplified": "子", "traditional": "子", "pinyin": "zi", "english": "suffix for nouns", "category": "grammar"},
    {"simplified": "汤", "traditional": "湯", "pinyin": "tāng", "english": "soup", "category": "food"},
    {"simplified": "肉", "traditional": "肉", "pinyin": "ròu", "english": "meat", "category": "food"},
    {"simplified": "鱼", "traditional": "魚", "pinyin": "yú", "english": "fish", "category": "food"},
    {"simplified": "糖", "traditional": "糖", "pinyin": "táng", "english": "sugar; candy", "category": "food"},
    {"simplified": "盐", "traditional": "鹽", "pinyin": "yán", "english": "salt", "category": "food"},

    # Transportation
    {"simplified": "船", "traditional": "船", "pinyin": "chuán", "english": "boat; ship", "category": "transport"},
    {"simplified": "飞", "traditional": "飛", "pinyin": "fēi", "english": "to fly", "category": "transport"},
    {"simplified": "机", "traditional": "機", "pinyin": "jī", "english": "machine; airplane", "category": "transport"},
    {"simplified": "自", "traditional": "自", "pinyin": "zì", "english": "self", "category": "other"},
    {"simplified": "行", "traditional": "行", "pinyin": "xíng", "english": "to walk; to go", "category": "verb"},
    {"simplified": "车", "traditional": "車", "pinyin": "chē", "english": "vehicle", "category": "transport"},

    # Weather
    {"simplified": "晴", "traditional": "晴", "pinyin": "qíng", "english": "sunny; clear", "category": "weather"},
    {"simplified": "阴", "traditional": "陰", "pinyin": "yīn", "english": "cloudy; overcast", "category": "weather"},
    {"simplified": "雪", "traditional": "雪", "pinyin": "xuě", "english": "snow", "category": "weather"},

    # Common Words
    {"simplified": "因", "traditional": "因", "pinyin": "yīn", "english": "because; cause", "category": "grammar"},
    {"simplified": "为", "traditional": "為", "pinyin": "wèi", "english": "for; because of", "category": "grammar"},
    {"simplified": "所", "traditional": "所", "pinyin": "suǒ", "english": "place; that which", "category": "grammar"},
    {"simplified": "以", "traditional": "以", "pinyin": "yǐ", "english": "with; by means of", "category": "grammar"},
    {"simplified": "让", "traditional": "讓", "pinyin": "ràng", "english": "to let; to allow", "category": "verb"},
    {"simplified": "别", "traditional": "別", "pinyin": "bié", "english": "don't; other", "category": "adverb"},
    {"simplified": "被", "traditional": "被", "pinyin": "bèi", "english": "by (passive voice)", "category": "grammar"},
    {"simplified": "把", "traditional": "把", "pinyin": "bǎ", "english": "to hold; ba-construction", "category": "grammar"},
]

def seed_hsk2():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("Seeding HSK 2 Vocabulary")
        print("="*60 + "\n")

        added = 0
        skipped = 0

        for word_data in hsk2_vocab:
            # Check if word already exists
            existing = db.query(HanziWord).filter(
                HanziWord.simplified == word_data["simplified"],
                HanziWord.hsk_level == 2
            ).first()

            if existing:
                print(f"[SKIP] {word_data['simplified']} - already exists")
                skipped += 1
                continue

            # Create new word
            word = HanziWord(
                simplified=word_data["simplified"],
                traditional=word_data["traditional"],
                pinyin=word_data["pinyin"],
                english=word_data["english"],
                hsk_level=2,
                category=word_data.get("category", "other")
            )
            db.add(word)
            print(f"[ADD] {word_data['simplified']:3s} ({word_data['pinyin']:10s}) - {word_data['category']:15s} | {word_data['english']}")
            added += 1

        db.commit()

        print("\n" + "="*60)
        print("[SUCCESS] HSK 2 Seeding Complete!")
        print("="*60)
        print(f"  Added: {added} words")
        print(f"  Skipped: {skipped} words")
        print(f"  Total HSK 2: {added + skipped} words")

    except Exception as e:
        print(f"\nError: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk2()
