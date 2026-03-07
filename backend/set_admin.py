"""
Script to set a user as admin.
Usage: py set_admin.py <username>
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import User

def set_admin(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"[ERROR] User '{username}' not found.")
            print("\nRegistered users:")
            users = db.query(User).all()
            for u in users:
                print(f"  - {u.username} ({u.email})")
            return False

        user.is_admin = True
        db.commit()
        print(f"[OK] '{username}' is now an admin.")
        return True
    except Exception as e:
        print(f"[ERROR] {e}")
        print("\nTip: Run 'alembic upgrade head' first if column is_admin doesn't exist.")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: py set_admin.py <username>")
        print("Example: py set_admin.py admin")
        sys.exit(1)

    username = sys.argv[1]
    success = set_admin(username)
    sys.exit(0 if success else 1)
