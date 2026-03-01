"""
Master seeder — runs all HSK 1-6 seed scripts in order.
Usage: cd backend && python seed_all_hsk.py
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

def show_counts():
    """Show current word counts per HSK level."""
    db = SessionLocal()
    print("\n" + "=" * 50)
    print("  HSK Word Counts")
    print("=" * 50)
    total = 0
    for level in range(1, 7):
        count = db.query(HanziWord).filter(HanziWord.hsk_level == level).count()
        target = {1: 150, 2: 150, 3: 300, 4: 600, 5: 1300, 6: 2500}[level]
        pct = round(count / target * 100)
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        status = "✓" if pct >= 90 else "✗"
        print(f"  HSK {level}: {count:>5} / {target:<5}  {bar} {pct}% {status}")
        total += count
    print(f"\n  Total: {total} words")
    print("=" * 50)
    db.close()

def run_all():
    print("=" * 60)
    print("  HSK 1-6 Master Seeder")
    print("=" * 60)

    # Show before counts
    print("\n📊 BEFORE seeding:")
    show_counts()

    # HSK 1
    try:
        from seed_hsk1_complete import seed_hsk1_complete
        print("\n🔄 Seeding HSK 1...")
        seed_hsk1_complete()
    except Exception as e:
        print(f"  ⚠ HSK 1 error: {e}")

    # HSK 2
    try:
        from seed_hsk2_complete import seed_hsk2_complete
        print("\n🔄 Seeding HSK 2...")
        seed_hsk2_complete()
    except Exception as e:
        print(f"  ⚠ HSK 2 error: {e}")

    # HSK 3
    try:
        from seed_hsk3_full import seed_hsk3
        print("\n🔄 Seeding HSK 3...")
        seed_hsk3()
    except Exception as e:
        print(f"  ⚠ HSK 3 error: {e}")

    # HSK 4
    try:
        from seed_hsk4_full import seed_hsk4
        print("\n🔄 Seeding HSK 4...")
        seed_hsk4()
    except Exception as e:
        print(f"  ⚠ HSK 4 error: {e}")

    # HSK 5
    try:
        from seed_hsk5_full import seed_hsk5
        print("\n🔄 Seeding HSK 5...")
        seed_hsk5()
    except Exception as e:
        print(f"  ⚠ HSK 5 error: {e}")

    # HSK 6
    try:
        from seed_hsk6_full import seed_hsk6
        print("\n🔄 Seeding HSK 6...")
        seed_hsk6()
    except Exception as e:
        print(f"  ⚠ HSK 6 error: {e}")

    # Show after counts
    print("\n📊 AFTER seeding:")
    show_counts()
    print("\n✅ Done!")

if __name__ == "__main__":
    run_all()
