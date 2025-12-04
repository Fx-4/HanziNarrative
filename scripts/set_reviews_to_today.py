"""
Update all next_review dates to today so badge notification appears now
"""
from backend.app.database import SessionLocal
from backend.app.models import UserProgress
from datetime import datetime, timedelta

db = SessionLocal()

try:
    # Get all progress records
    progress = db.query(UserProgress).all()

    print(f'Updating {len(progress)} records to be due today...')

    for p in progress:
        if p.next_review:
            # Set next_review to 1 hour ago (so it's definitely due)
            p.next_review = datetime.utcnow() - timedelta(hours=1)

    db.commit()
    print(f'Success! {len(progress)} words are now due for review!')
    print('Refresh your browser and the badge should show the count.')

except Exception as e:
    print(f'Error: {e}')
    db.rollback()

finally:
    db.close()
