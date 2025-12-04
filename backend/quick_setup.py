# -*- coding: utf-8 -*-
"""Quick database setup - Creates tables and seeds data"""

print("="*50)
print("HanziNarrative - Database Setup")
print("="*50)

print("\n[1/3] Creating database tables...")
try:
    from app.database import engine, Base
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully!")
except Exception as e:
    print(f"[ERROR] Failed to create tables: {e}")
    print("\nPlease make sure:")
    print("1. PostgreSQL is running")
    print("2. Database 'hanzinarrative' exists")
    print("3. backend/.env has correct DATABASE_URL")
    exit(1)

print("\n[2/3] Seeding database...")
try:
    from seed_data import seed_database
    seed_database()
    print("[OK] Database seeded!")
except Exception as e:
    print(f"[ERROR] Seeding failed: {e}")
    exit(1)

print("\n[3/3] Verifying setup...")
try:
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models import User, HanziWord, Story

    db = SessionLocal()
    user_count = db.query(User).count()
    word_count = db.query(HanziWord).count()
    story_count = db.query(Story).count()
    db.close()

    print(f"[OK] Found {user_count} users, {word_count} words, {story_count} stories")
except Exception as e:
    print(f"[WARNING] Could not verify: {e}")

print("\n" + "="*50)
print("Setup Complete!")
print("="*50)
print("\nLogin credentials:")
print("  Username: admin")
print("  Password: admin123")
print("\nStart backend with:")
print("  uvicorn app.main:app --reload")
print("\nBackend: http://localhost:8000")
print("API Docs: http://localhost:8000/docs")
print("="*50)
