from backend.app.database import SessionLocal
from backend.app.models import UserProgress
from datetime import datetime

db = SessionLocal()

# Get all progress records
progress = db.query(UserProgress).all()
print(f'Total progress records: {len(progress)}')

# Check how many are due for review
now = datetime.utcnow()
due = [p for p in progress if p.next_review and p.next_review <= now]
print(f'Due for review: {len(due)}')

# Show some examples
print('\nDue for review (first 10):')
for p in due[:10]:
    print(f'  User {p.user_id}, Word {p.word_id}, Next: {p.next_review}, Mastery: {p.mastery_level}')

# Show progress with null next_review
null_next = [p for p in progress if not p.next_review]
print(f'\nProgress with null next_review: {len(null_next)}')

db.close()
