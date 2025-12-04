"""
Migration script to update old progress records to use SRS system
This will add next_review dates to existing UserProgress records
"""
from backend.app.database import SessionLocal
from backend.app.models import UserProgress
from datetime import datetime, timedelta

db = SessionLocal()

try:
    # Get all progress records with null next_review
    old_progress = db.query(UserProgress).filter(
        UserProgress.next_review == None
    ).all()

    print(f'Found {len(old_progress)} old progress records to migrate')

    for progress in old_progress:
        # Set default values for SRS fields
        progress.mastery_level = 1  # Starting mastery level
        progress.easiness_factor = 2.5  # Default SM-2 easiness factor
        progress.interval = 1  # Start with 1 day interval
        progress.repetitions = 1  # They've seen it at least once

        # Set next review to tomorrow (so they appear in review queue)
        progress.next_review = datetime.utcnow() + timedelta(days=1)
        progress.last_reviewed = datetime.utcnow()

        print(f'  Migrated: User {progress.user_id}, Word {progress.word_id}')

    db.commit()
    print(f'\n✅ Successfully migrated {len(old_progress)} records!')
    print('These words will be available for review starting tomorrow.')

except Exception as e:
    print(f'❌ Error during migration: {e}')
    db.rollback()

finally:
    db.close()
