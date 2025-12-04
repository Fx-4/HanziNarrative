#!/usr/bin/env python3
"""
Test database connection for HanziNarrative
Run this to verify your database setup is correct
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from app.config import settings
    from sqlalchemy import create_engine, text

    print("=" * 50)
    print("HanziNarrative - Database Connection Test")
    print("=" * 50)
    print()

    # Show config (hide password)
    db_url = settings.DATABASE_URL
    if '@' in db_url:
        parts = db_url.split('@')
        user_part = parts[0].split('//')[1]
        if ':' in user_part:
            user = user_part.split(':')[0]
            masked_url = db_url.replace(user_part.split(':')[1], '***')
        else:
            masked_url = db_url
    else:
        masked_url = db_url

    print(f"Database URL: {masked_url}")
    print()

    # Test connection
    print("[1/3] Testing database connection...")
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Connection successful!")
    except Exception as e:
        print(f"✗ Connection failed: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check DATABASE_URL in backend/.env")
        print("3. Run setup-database.bat to create database")
        sys.exit(1)

    print()

    # Test database exists
    print("[2/3] Checking database...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f"✓ Connected to database: {db_name}")
    except Exception as e:
        print(f"✗ Database check failed: {str(e)}")
        sys.exit(1)

    print()

    # Test tables
    print("[3/3] Checking tables...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]

            if tables:
                print(f"✓ Found {len(tables)} tables:")
                for table in tables:
                    print(f"  - {table}")
            else:
                print("⚠ No tables found. Run migrations:")
                print("  cd backend")
                print("  alembic upgrade head")
    except Exception as e:
        print(f"✗ Table check failed: {str(e)}")
        sys.exit(1)

    print()
    print("=" * 50)
    print("✓ Database is ready!")
    print("=" * 50)
    print()
    print("Next steps:")
    print("1. Start backend: cd backend && uvicorn app.main:app --reload")
    print("2. Start frontend: cd frontend && npm run dev")
    print()

except ImportError as e:
    print(f"Error importing modules: {str(e)}")
    print()
    print("Make sure you've installed backend dependencies:")
    print("  cd backend")
    print("  pip install -r requirements.txt")
    sys.exit(1)
