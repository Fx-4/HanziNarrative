import sys
sys.path.insert(0, 'd:/uii/belajar mandiri/learn-HSK/backend')

import bcrypt
print("bcrypt version:", bcrypt.__version__)

from app.database import SessionLocal
from app.models import User

db = SessionLocal()
users = db.query(User).all()

for u in users:
    print(f"\nUser: {u.username}")
    print(f"Hash prefix: {u.hashed_password[:7]}")
    # Test if bcrypt can verify (with dummy password to check no error)
    try:
        result = bcrypt.checkpw(b"wrongpassword", u.hashed_password.encode('utf-8'))
        print(f"bcrypt.checkpw works: True (result={result})")
    except Exception as e:
        print(f"bcrypt.checkpw ERROR: {e}")

db.close()
