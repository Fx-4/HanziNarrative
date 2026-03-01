"""
Quick check: how many words per HSK level in the database?
Usage: cd backend && python check_hsk_counts.py
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

def check():
    db = SessionLocal()
    print("\n  HSK Word Database Status")
    print("  " + "─" * 44)
    total = 0
    targets = {1: 150, 2: 150, 3: 300, 4: 600, 5: 1300, 6: 2500}
    for level in range(1, 7):
        count = db.query(HanziWord).filter(HanziWord.hsk_level == level).count()
        target = targets[level]
        pct = round(count / target * 100) if target else 0
        bar = "█" * min(20, pct // 5) + "░" * max(0, 20 - pct // 5)
        icon = "✅" if pct >= 90 else "⚠️" if pct >= 50 else "❌"
        print(f"  {icon} HSK {level}: {count:>5} / {target:<5}  {bar} {pct}%")
        total += count

    print(f"  " + "─" * 44)
    print(f"  Total: {total} words in database")

    # Show sample words per level
    print(f"\n  Sample words per level:")
    for level in range(1, 7):
        samples = db.query(HanziWord).filter(
            HanziWord.hsk_level == level
        ).limit(5).all()
        words = ", ".join(f"{w.simplified}({w.pinyin})" for w in samples)
        print(f"  HSK {level}: {words}")

    db.close()

if __name__ == "__main__":
    check()
