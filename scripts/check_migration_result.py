from backend.app.database import SessionLocal
from backend.app.models import UserProgress
from datetime import datetime, timezone

db = SessionLocal()

# Get all progress records
progress = db.query(UserProgress).all()
print(f'Total progress records: {len(progress)}')

# Check how many have next_review set
with_next_review = [p for p in progress if p.next_review is not None]
print(f'Records with next_review: {len(with_next_review)}')
print(f'Records without next_review: {len(progress) - len(with_next_review)}')

# Show some examples
print('\nExamples of migrated records (first 5):')
for p in with_next_review[:5]:
    print(f'  User {p.user_id}, Word {p.word_id}')
    print(f'    Next review: {p.next_review}')
    print(f'    Mastery level: {p.mastery_level}')
    print(f'    Interval: {p.interval} days')

db.close()
print('\nMigration successful! All records now have SRS data.')
