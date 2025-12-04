"""
Quick database setup script
Creates database and tables, then seeds data
"""
import sys
import subprocess

def run_command(cmd, description):
    """Run a command and print the result"""
    print(f"\n[*] {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"[✓] {description} - SUCCESS")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"[✗] {description} - FAILED")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        print(f"[✗] {description} - ERROR: {e}")
        return False

def main():
    print("="*50)
    print("HanziNarrative - Database Setup")
    print("="*50)

    # Step 1: Create database using Python
    print("\n[1/4] Creating database...")
    try:
        import psycopg2
        from psycopg2 import sql
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

        # Connect to default postgres database
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='hanzinarrative'")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier('hanzinarrative')
            ))
            print("[✓] Database 'hanzinarrative' created successfully!")
        else:
            print("[✓] Database 'hanzinarrative' already exists!")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[!] Note: {e}")
        print("[!] Database might already exist or need different credentials.")
        print("[!] Continuing with migrations...")

    # Step 2: Run migrations
    if not run_command("alembic upgrade head", "Running migrations"):
        print("\n[!] Migrations failed. Creating tables directly...")
        try:
            from app.database import engine, Base
            Base.metadata.create_all(bind=engine)
            print("[✓] Tables created successfully!")
        except Exception as e:
            print(f"[✗] Failed to create tables: {e}")
            sys.exit(1)

    # Step 3: Seed database
    if run_command("python seed_data.py", "Seeding database"):
        print("\n" + "="*50)
        print("Setup Complete!")
        print("="*50)
        print("\nLogin credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nStart the backend with:")
        print("  uvicorn app.main:app --reload")
        print("\nBackend will be at: http://localhost:8000")
        print("API Docs at: http://localhost:8000/docs")
    else:
        print("\n[✗] Seeding failed. Please check the error above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
