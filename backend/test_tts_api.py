import sys
import io
import time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import httpx

BASE_URL = "http://localhost:8000"

# Register a fresh test user
print("Step 1: Register test user...")
import uuid
unique = uuid.uuid4().hex[:8]
resp = httpx.post(
    f"{BASE_URL}/auth/register",
    json={
        "username": f"ttstest_{unique}",
        "email": f"ttstest_{unique}@test.com",
        "password": "Test1234!",
        "full_name": "TTS Test"
    },
    timeout=30.0,
)
print(f"  Status: {resp.status_code}")
if resp.status_code != 200:
    print(f"  Error: {resp.text}")
    sys.exit(1)
token = resp.json()["access_token"]
print(f"  OK. Token: {token[:20]}...")

# Step 2: Test TTS endpoint
print("\nStep 2: Test /tts/synthesize with cmn-CN-Wavenet-A...")
test_texts = ["你好", "学习中文", "今天天气怎么样"]
for text in test_texts:
    t0 = time.time()
    resp = httpx.post(
        f"{BASE_URL}/tts/synthesize",
        json={"text": text, "language": "cmn-CN", "voice_name": "cmn-CN-Wavenet-A"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=20.0,
    )
    elapsed = time.time() - t0
    cache = resp.headers.get("X-Cache", "?")
    print(f"  text='{text}' -> {resp.status_code} | {len(resp.content)} bytes | cache={cache} | {elapsed:.2f}s")
    if resp.status_code != 200:
        print(f"    Error body: {resp.text[:150]}")

# Step 3: Test caching
print("\nStep 3: Test cache hit (repeat '你好')...")
t0 = time.time()
resp = httpx.post(
    f"{BASE_URL}/tts/synthesize",
    json={"text": "你好", "language": "cmn-CN", "voice_name": "cmn-CN-Wavenet-A"},
    headers={"Authorization": f"Bearer {token}"},
    timeout=10.0,
)
elapsed = time.time() - t0
cache = resp.headers.get("X-Cache", "?")
print(f"  '你好' (cached) -> {resp.status_code} | {len(resp.content)} bytes | cache={cache} | {elapsed:.3f}s")

# Step 4: Test Chirp3-HD
print("\nStep 4: Test cmn-CN-Chirp3-HD-Aoede (best quality)...")
resp = httpx.post(
    f"{BASE_URL}/tts/synthesize",
    json={"text": "你好", "language": "cmn-CN", "voice_name": "cmn-CN-Chirp3-HD-Aoede"},
    headers={"Authorization": f"Bearer {token}"},
    timeout=20.0,
)
cache = resp.headers.get("X-Cache", "?")
print(f"  Chirp3-HD-Aoede -> {resp.status_code} | {len(resp.content)} bytes | cache={cache}")

print("\nAll tests done!")
