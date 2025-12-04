from app.database import SessionLocal
from app.models import HanziWord

db = SessionLocal()

print("\n" + "="*50)
print("HSK Vocabulary Database Status")
print("="*50 + "\n")

total = 0
for level in range(1, 7):
    count = db.query(HanziWord).filter(HanziWord.hsk_level == level).count()
    print(f"HSK Level {level}: {count:>4} words")
    total += count

print("-"*50)
print(f"Total:        {total:>4} words")
print("="*50 + "\n")

db.close()
