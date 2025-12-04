"""
Seed sample interactive stories for HSK 1 & 2
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import Story, User
from datetime import datetime

stories_data = [
    # HSK 1 Stories
    {
        "title": "我的家人 (My Family)",
        "content": """我叫小明。我家有四个人：爸爸、妈妈、姐姐和我。

爸爸是医生，他很忙。妈妈是老师，她很好。姐姐是学生，她很聪明。我也是学生，我喜欢学习。

我们都很爱我们的家。""",
        "hsk_level": 1,
        "english_translation": "My name is Xiaoming. There are four people in my family: dad, mom, older sister, and me.\n\nDad is a doctor, he is very busy. Mom is a teacher, she is very nice. Older sister is a student, she is very smart. I am also a student, I like studying.\n\nWe all love our family very much."
    },
    {
        "title": "在饭店 (At the Restaurant)",
        "content": """今天我和朋友去饭店吃饭。

我点了米饭和鸡肉。朋友点了面条和鱼。我们也喝茶。

饭很好吃！我很高兴。""",
        "hsk_level": 1,
        "english_translation": "Today I go to a restaurant with my friend to eat.\n\nI ordered rice and chicken. My friend ordered noodles and fish. We also drink tea.\n\nThe food is delicious! I am very happy."
    },
    {
        "title": "我的一天 (My Day)",
        "content": """早上七点，我起床。我吃早饭，喝牛奶。

八点，我去学校。我学习汉语和英语。

中午，我和同学一起吃午饭。

下午，我回家做作业。晚上，我看电视。

十点，我睡觉。""",
        "hsk_level": 1,
        "english_translation": "At 7 AM, I wake up. I eat breakfast and drink milk.\n\nAt 8, I go to school. I study Chinese and English.\n\nAt noon, I eat lunch with classmates.\n\nIn the afternoon, I go home and do homework. In the evening, I watch TV.\n\nAt 10, I go to sleep."
    },
    {
        "title": "买东西 (Shopping)",
        "content": """今天是星期六。我去商店买东西。

我买了苹果、面包和水。苹果五块钱，面包三块钱，水两块钱。

一共十块钱。不太贵！""",
        "hsk_level": 1,
        "english_translation": "Today is Saturday. I go to the store to buy things.\n\nI bought apples, bread, and water. Apples are 5 yuan, bread is 3 yuan, water is 2 yuan.\n\nTotal is 10 yuan. Not too expensive!"
    },

    # HSK 2 Stories
    {
        "title": "学习汉语 (Learning Chinese)",
        "content": """我叫玛丽，我是美国人。我在中国学习汉语。

开始的时候，汉语很难。但是我的老师很好，她帮助我很多。现在我能说一点儿汉语了。

我每天都学习汉语。我喜欢看中文书，也喜欢和中国朋友聊天。

虽然有时候我还不懂，但是我不放弃。我相信我会越来越好！""",
        "hsk_level": 2,
        "english_translation": "My name is Mary, I'm American. I'm studying Chinese in China.\n\nAt the beginning, Chinese was very difficult. But my teacher is very good, she helps me a lot. Now I can speak a little Chinese.\n\nI study Chinese every day. I like reading Chinese books and chatting with Chinese friends.\n\nAlthough sometimes I still don't understand, I don't give up. I believe I will get better and better!"
    },
    {
        "title": "周末计划 (Weekend Plans)",
        "content": """这个周末天气很好，又晴朗又温暖。

星期六上午，我要去游泳。下午，我打算和朋友一起看电影。

星期天，我想去公园散步。如果有时间，我还要去图书馆借书。

晚上，我准备在家做饭，然后早点儿睡觉。

我觉得这会是一个很愉快的周末！""",
        "hsk_level": 2,
        "english_translation": "This weekend the weather is very nice, both sunny and warm.\n\nSaturday morning, I'm going to swim. In the afternoon, I plan to watch a movie with friends.\n\nSunday, I want to take a walk in the park. If I have time, I also want to go to the library to borrow books.\n\nIn the evening, I'm going to cook at home, then go to bed early.\n\nI think this will be a very pleasant weekend!"
    },
    {
        "title": "去医院 (Going to the Hospital)",
        "content": """昨天我感冒了，头疼得很厉害。

今天早上，妈妈带我去医院。医生给我检查以后，说我需要吃药和多休息。

医生还告诉我要多喝水，不要吃冷的东西。

现在我在家休息。虽然还有点儿不舒服，但是比昨天好多了。

我希望明天就能好起来！""",
        "hsk_level": 2,
        "english_translation": "Yesterday I caught a cold, my head hurt very badly.\n\nThis morning, mom took me to the hospital. After the doctor examined me, he said I need to take medicine and rest more.\n\nThe doctor also told me to drink more water and not eat cold things.\n\nNow I'm resting at home. Although I still feel a bit uncomfortable, I'm much better than yesterday.\n\nI hope I can get well tomorrow!"
    },
]

def seed_stories():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("Seeding Interactive Stories")
        print("="*60 + "\n")

        # Get or create admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("[WARNING] Admin user not found. Please create admin user first.")
            return

        added = 0
        skipped = 0

        for story_data in stories_data:
            # Check if story already exists
            existing = db.query(Story).filter(
                Story.title == story_data["title"]
            ).first()

            if existing:
                print(f"[SKIP] {story_data['title']} - already exists")
                skipped += 1
                continue

            # Create story
            story = Story(
                title=story_data["title"],
                content=story_data["content"],
                english_translation=story_data.get("english_translation"),
                hsk_level=story_data["hsk_level"],
                author_id=admin.id,
                is_published=True,
                created_at=datetime.utcnow()
            )
            db.add(story)
            print(f"[ADD] HSK {story_data['hsk_level']}: {story_data['title']}")
            added += 1

        db.commit()

        print("\n" + "="*60)
        print("[SUCCESS] Story Seeding Complete!")
        print("="*60)
        print(f"  Added: {added} stories")
        print(f"  Skipped: {skipped} stories")
        print(f"  Total: {added + skipped} stories")
        print(f"\n  HSK 1 stories: 4")
        print(f"  HSK 2 stories: 3")

    except Exception as e:
        print(f"\nError: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_stories()
