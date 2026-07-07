"""
Pre-generate the course's TTS audio and upload it to Supabase Storage.

The course content (words, example sentences, grammar examples) is FIXED, so
synthesizing it on every cold start is wasteful — the Koyeb file cache is
ephemeral and wiped on each restart. This generates every clip ONCE for the two
user-selectable voices at normal speed and pushes them to a public Supabase
Storage bucket, so the frontend can serve them straight from the CDN with no
backend round-trip (see frontend/src/utils/ttsHelper.ts, "Layer 1.5").

Naming MUST match the client: filename = sha256("text|language|voice|rate").hex + ".mp3"
where `voice` is the Google voice name the client sends and `rate` is "1" (normal).
Slow/fast and any not-yet-generated word simply fall back to the backend.

Usage (from backend/):
    # 1. generate + upload everything (needs the Supabase service_role key)
    SUPABASE_URL=https://<ref>.supabase.co \
    SUPABASE_SERVICE_KEY=<service_role_key> \
    python scripts/generate_tts_static.py

    # smoke test — 5 clips, generate only, no upload
    python scripts/generate_tts_static.py --limit 5 --no-upload

Then on Vercel set:
    VITE_TTS_STATIC_URL=https://<ref>.supabase.co/storage/v1/object/public/tts-audio
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import edge_tts

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
CURRICULUM_DIR = REPO_ROOT / "frontend" / "src" / "data"
FRONTEND_ENV = REPO_ROOT / "frontend" / ".env"
OUT_DIR = SCRIPT_DIR / "tts_static_out"
UPLOADED_MANIFEST = OUT_DIR / ".uploaded.json"

LANGUAGE = "cmn-CN"
RATE_KEY = "1"        # normal speed — the only rate we pre-generate
EDGE_RATE = "+0%"
BUCKET = "tts-audio"

# Google voice name (what the client sends) → Edge voice (what we synthesize with).
# Mirrors backend/app/services/tts_provider.py GOOGLE_TO_EDGE_VOICE for the two
# voices exposed in the UI (female default + male).
VOICES = {
    "cmn-CN-Chirp3-HD-Aoede": "zh-CN-XiaoxiaoNeural",  # female (default)
    "cmn-CN-Standard-B": "zh-CN-YunjianNeural",         # male
}


# ── Curriculum extraction ─────────────────────────────────────────────────────
def extract_texts() -> list[str]:
    """Every unique `zh: '...'` literal across the curriculum TS files."""
    pattern = re.compile(r"""zh:\s*(['"])(.*?)\1""")
    seen: set[str] = set()
    for ts_file in sorted(CURRICULUM_DIR.glob("*.ts")):
        content = ts_file.read_text(encoding="utf-8")
        for _, text in pattern.findall(content):
            t = text.strip()
            if t:
                seen.add(t)
    return sorted(seen)


def cache_key(text: str, voice: str) -> str:
    """Same string the client hashes (ttsCache.buildCacheKey)."""
    return f"{text}|{LANGUAGE}|{voice}|{RATE_KEY}"


def hashed_name(text: str, voice: str) -> str:
    return hashlib.sha256(cache_key(text, voice).encode("utf-8")).hexdigest() + ".mp3"


# ── Edge TTS ──────────────────────────────────────────────────────────────────
async def synthesize(text: str, edge_voice: str, retries: int = 3) -> bytes:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            communicate = edge_tts.Communicate(text, voice=edge_voice, rate=EDGE_RATE)
            chunks = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.extend(chunk["data"])
            if chunks:
                return bytes(chunks)
            raise ValueError("empty audio")
        except Exception as e:  # noqa: BLE001 — transient throttling, retry
            last_err = e
            await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"edge_tts failed for {text!r}: {last_err}")


# ── Supabase Storage (REST, stdlib only) ──────────────────────────────────────
def _supabase_url() -> str:
    url = os.getenv("SUPABASE_URL", "").strip()
    if not url and FRONTEND_ENV.exists():
        for line in FRONTEND_ENV.read_text(encoding="utf-8").splitlines():
            if line.startswith("VITE_SUPABASE_URL="):
                url = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
    return url.rstrip("/")


def _service_key() -> str:
    return os.getenv("SUPABASE_SERVICE_KEY", "").strip()


def ensure_bucket(base: str, key: str) -> None:
    body = json.dumps({"id": BUCKET, "name": BUCKET, "public": True}).encode()
    req = urllib.request.Request(
        f"{base}/storage/v1/bucket",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": key,
            "Authorization": f"Bearer {key}",
        },
    )
    try:
        urllib.request.urlopen(req, timeout=30)
        print(f"  created public bucket '{BUCKET}'")
    except urllib.error.HTTPError as e:
        # 400/409 "already exists" is fine
        if e.code in (400, 409):
            print(f"  bucket '{BUCKET}' already exists")
        else:
            raise


def upload(base: str, key: str, name: str, data: bytes) -> None:
    req = urllib.request.Request(
        f"{base}/storage/v1/object/{BUCKET}/{name}",
        data=data,
        method="POST",
        headers={
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "x-upsert": "true",
        },
    )
    urllib.request.urlopen(req, timeout=60)


# ── Main ──────────────────────────────────────────────────────────────────────
async def main() -> int:
    parser = argparse.ArgumentParser(description="Pre-generate + upload course TTS.")
    parser.add_argument("--limit", type=int, default=0, help="cap number of texts (testing)")
    parser.add_argument("--no-upload", action="store_true", help="generate locally only")
    parser.add_argument("--force-upload", action="store_true", help="re-upload even if in manifest")
    parser.add_argument("--voices", choices=["both", "female", "male"], default="both")
    parser.add_argument("--concurrency", type=int, default=6)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    texts = extract_texts()
    if args.limit:
        texts = texts[: args.limit]

    voice_items = list(VOICES.items())
    if args.voices == "female":
        voice_items = [("cmn-CN-Chirp3-HD-Aoede", VOICES["cmn-CN-Chirp3-HD-Aoede"])]
    elif args.voices == "male":
        voice_items = [("cmn-CN-Standard-B", VOICES["cmn-CN-Standard-B"])]

    jobs = [(t, gv, ev) for t in texts for gv, ev in voice_items]
    print(f"Curriculum: {len(texts)} unique clips × {len(voice_items)} voice(s) = {len(jobs)} files")
    print(f"Output dir: {OUT_DIR}")

    # Phase 1 — generate (skip files already on disk)
    sem = asyncio.Semaphore(args.concurrency)
    generated = 0
    failed: list[str] = []

    async def gen_one(text: str, edge_voice: str, path: Path) -> None:
        nonlocal generated
        async with sem:
            try:
                path.write_bytes(await synthesize(text, edge_voice))
                generated += 1
                if generated % 50 == 0:
                    print(f"  generated {generated} …")
            except Exception as e:  # noqa: BLE001
                failed.append(f"{text} [{edge_voice}]: {e}")

    pending = []
    for text, gv, ev in jobs:
        path = OUT_DIR / hashed_name(text, gv)
        if path.exists() and path.stat().st_size > 0:
            continue
        pending.append(gen_one(text, ev, path))
    print(f"Generating {len(pending)} new file(s) ({len(jobs) - len(pending)} already cached) …")
    await asyncio.gather(*pending)
    print(f"Generated {generated} file(s); {len(failed)} failed.")
    for f in failed[:20]:
        print(f"  ! {f}")

    if args.no_upload:
        total_bytes = sum(p.stat().st_size for p in OUT_DIR.glob("*.mp3"))
        print(f"--no-upload: {len(list(OUT_DIR.glob('*.mp3')))} files, {total_bytes/1_048_576:.1f} MB on disk")
        return 0

    # Phase 2 — upload
    base, key = _supabase_url(), _service_key()
    if not base or not key:
        print("ERROR: need SUPABASE_URL and SUPABASE_SERVICE_KEY env vars to upload.", file=sys.stderr)
        print("       (run with --no-upload to just generate locally)", file=sys.stderr)
        return 1

    uploaded: set[str] = set()
    if UPLOADED_MANIFEST.exists() and not args.force_upload:
        uploaded = set(json.loads(UPLOADED_MANIFEST.read_text()))

    print(f"Uploading to {base}/storage/v1/object/{BUCKET}/ …")
    ensure_bucket(base, key)

    count, up_failed = 0, 0
    for text, gv, _ in jobs:
        name = hashed_name(text, gv)
        if name in uploaded and not args.force_upload:
            continue
        path = OUT_DIR / name
        if not path.exists():
            continue
        try:
            await asyncio.to_thread(upload, base, key, name, path.read_bytes())
            uploaded.add(name)
            count += 1
            if count % 100 == 0:
                print(f"  uploaded {count} …")
                UPLOADED_MANIFEST.write_text(json.dumps(sorted(uploaded)))
        except Exception as e:  # noqa: BLE001
            up_failed += 1
            if up_failed <= 10:
                print(f"  ! upload failed {name}: {e}")

    UPLOADED_MANIFEST.write_text(json.dumps(sorted(uploaded)))
    print(f"Uploaded {count} new file(s); {up_failed} failed; {len(uploaded)} total in manifest.")
    print(f"\nDone. Set on Vercel:\n  VITE_TTS_STATIC_URL={base}/storage/v1/object/public/{BUCKET}")
    return 0 if not up_failed else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
