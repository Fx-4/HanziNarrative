import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import httpx, time

BASE = "http://localhost:8000"

# Register admin user
print("Creating admin user in Supabase...")
r = httpx.post(f"{BASE}/auth/register", json={
    "username": "admin",
    "email": "admin@hanzinarrative.com",
    "password": "Admin1234!",
    "full_name": "Admin"
}, timeout=30.0)
if r.status_code == 200:
    print("  OK - admin user created")
elif "already registered" in r.text:
    print("  admin already exists")
else:
    print(f"  Status {r.status_code}: {r.text[:100]}")
