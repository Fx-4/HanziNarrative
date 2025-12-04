"""
Seed script to populate the database with sample HSK vocabulary and stories
Run this after creating tables: python seed_data.py
"""

from app.database import SessionLocal
from app.models import HanziWord, Story, User
from app.auth import get_password_hash


def seed_database():
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_words = db.query(HanziWord).count()
        if existing_words > 0:
            print("Database already seeded!")
            return

        print("Seeding database...")

        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@hanzinarrative.com",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Sample HSK 1 vocabulary
        hsk1_words = [
            HanziWord(simplified="你", traditional="你", pinyin="nǐ", english="you", hsk_level=1),
            HanziWord(simplified="好", traditional="好", pinyin="hǎo", english="good, well", hsk_level=1),
            HanziWord(simplified="我", traditional="我", pinyin="wǒ", english="I, me", hsk_level=1),
            HanziWord(simplified="是", traditional="是", pinyin="shì", english="to be", hsk_level=1),
            HanziWord(simplified="的", traditional="的", pinyin="de", english="possessive particle", hsk_level=1),
            HanziWord(simplified="人", traditional="人", pinyin="rén", english="person, people", hsk_level=1),
            HanziWord(simplified="中", traditional="中", pinyin="zhōng", english="middle, center, China", hsk_level=1),
            HanziWord(simplified="国", traditional="國", pinyin="guó", english="country, nation", hsk_level=1),
            HanziWord(simplified="大", traditional="大", pinyin="dà", english="big, large", hsk_level=1),
            HanziWord(simplified="小", traditional="小", pinyin="xiǎo", english="small, little", hsk_level=1),
            HanziWord(simplified="学", traditional="學", pinyin="xué", english="to study, learn", hsk_level=1),
            HanziWord(simplified="生", traditional="生", pinyin="shēng", english="to give birth, student", hsk_level=1),
            HanziWord(simplified="们", traditional="們", pinyin="men", english="plural marker", hsk_level=1),
            HanziWord(simplified="来", traditional="來", pinyin="lái", english="to come", hsk_level=1),
            HanziWord(simplified="不", traditional="不", pinyin="bù", english="not, no", hsk_level=1),
            HanziWord(simplified="吃", traditional="吃", pinyin="chī", english="to eat", hsk_level=1),
            HanziWord(simplified="饭", traditional="飯", pinyin="fàn", english="cooked rice, meal", hsk_level=1),
            HanziWord(simplified="喝", traditional="喝", pinyin="hē", english="to drink", hsk_level=1),
            HanziWord(simplified="水", traditional="水", pinyin="shuǐ", english="water", hsk_level=1),
            HanziWord(simplified="爱", traditional="愛", pinyin="ài", english="to love", hsk_level=1),
        ]

        # Sample HSK 2 vocabulary
        hsk2_words = [
            HanziWord(simplified="时", traditional="時", pinyin="shí", english="time", hsk_level=2),
            HanziWord(simplified="候", traditional="候", pinyin="hòu", english="time, moment", hsk_level=2),
            HanziWord(simplified="去", traditional="去", pinyin="qù", english="to go", hsk_level=2),
            HanziWord(simplified="做", traditional="做", pinyin="zuò", english="to do, to make", hsk_level=2),
            HanziWord(simplified="说", traditional="說", pinyin="shuō", english="to say, to speak", hsk_level=2),
            HanziWord(simplified="话", traditional="話", pinyin="huà", english="word, talk", hsk_level=2),
            HanziWord(simplified="看", traditional="看", pinyin="kàn", english="to see, to look", hsk_level=2),
            HanziWord(simplified="书", traditional="書", pinyin="shū", english="book", hsk_level=2),
            HanziWord(simplified="工", traditional="工", pinyin="gōng", english="work, worker", hsk_level=2),
            HanziWord(simplified="作", traditional="作", pinyin="zuò", english="to work", hsk_level=2),
        ]

        # Add all words to database
        all_words = hsk1_words + hsk2_words
        for word in all_words:
            db.add(word)

        db.commit()

        # Create sample story
        story1 = Story(
            title="我的朋友 (My Friend)",
            content="我有一个好朋友。他是中国人。我们都是学生。我们喜欢吃中国饭。",
            hsk_level=1,
            author_id=admin_user.id,
            is_published=True
        )
        db.add(story1)
        db.commit()
        db.refresh(story1)

        # Link words to story
        story_word_chars = ["我", "有", "一", "个", "好", "朋", "友", "他", "是", "中", "国", "人", "们", "都", "学", "生", "喜", "欢", "吃", "饭"]
        for char in story_word_chars:
            word = db.query(HanziWord).filter(HanziWord.simplified == char).first()
            if word and word not in story1.words:
                story1.words.append(word)

        db.commit()

        print("Database seeded successfully!")
        print(f"Created {len(all_words)} vocabulary words")
        print(f"Created 1 sample story")
        print(f"Created admin user (username: admin, password: admin123)")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
