"""
Publish all stories by setting is_published to True
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import Story

def publish_all_stories():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("Publishing All Stories")
        print("="*60 + "\n")

        # Get all stories
        stories = db.query(Story).all()

        print(f"Found {len(stories)} stories in database\n")

        # Update all stories to published
        updated = 0
        for story in stories:
            if not story.is_published:
                story.is_published = True
                updated += 1
                print(f"[PUBLISH] {story.title} (HSK {story.hsk_level})")

        db.commit()

        print("\n" + "="*60)
        print("[SUCCESS] Story Publishing Complete!")
        print("="*60)
        print(f"  Updated: {updated} stories")
        print(f"  Total published: {len(stories)} stories")

    except Exception as e:
        print(f"\nError: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    publish_all_stories()
