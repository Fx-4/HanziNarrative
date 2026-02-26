#!/usr/bin/env python3
"""
Bulk vocabulary image updater using Pexels API.

Fetches matching images for all HSK vocabulary words and saves the URLs
to the image_url column in the database.

SETUP (one time):
    1. Register FREE at https://www.pexels.com/api/  (no credit card)
    2. Copy your API key
    3. Open backend/.env and set:  PEXELS_API_KEY=your_key_here

USAGE:
    cd backend
    python update_images.py                  # update all words without images
    python update_images.py --force          # re-fetch even existing images
    python update_images.py --dry-run        # preview only, no DB writes
    python update_images.py --hsk 1          # only update HSK level 1 words
    python update_images.py --hsk 1 --hsk 2  # update HSK 1 and 2

Free tier rate limit: 200 requests/hour (~18s delay between requests)
Estimated time for all HSK 1-6 words: ~2-3 hours (run overnight)
"""
import asyncio
import argparse
import sys
import os

# Fix Unicode output on Windows (emoji / CJK in print statements)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Must be first — load .env before importing app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("ENV_FILE", os.path.join(os.path.dirname(__file__), ".env"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from app.database import SessionLocal
from app import models
from app.services.image_service import (
    get_image_for_word,
    should_skip_image,
    extract_search_keyword,
)
from app.config import settings

# Pexels free tier: 200 req/hour → safe delay = 18s
RATE_LIMIT_DELAY = 18.0


async def update_images(
    force: bool = False,
    dry_run: bool = False,
    hsk_levels: list[int] | None = None,
):
    if not settings.PEXELS_API_KEY:
        print("\n❌  PEXELS_API_KEY is not set in backend/.env")
        print("    Steps to fix:")
        print("    1. Go to https://www.pexels.com/api/ and register FREE")
        print("    2. Copy your API key")
        print("    3. Open backend/.env and set:")
        print("       PEXELS_API_KEY=your_key_here\n")
        return

    db = SessionLocal()
    try:
        query = db.query(models.HanziWord)

        if hsk_levels:
            query = query.filter(models.HanziWord.hsk_level.in_(hsk_levels))

        if not force:
            query = query.filter(models.HanziWord.image_url.is_(None))

        words = query.order_by(
            models.HanziWord.hsk_level,
            models.HanziWord.id,
        ).all()

        total = len(words)

        level_info = f"HSK {hsk_levels}" if hsk_levels else "all HSK levels"
        force_info = " (including already-set images)" if force else " (missing images only)"
        print(f"\n{'='*60}")
        print(f"  Pexels Image Updater — {level_info}{force_info}")
        print(f"  Found {total} words to process")
        if dry_run:
            print("  ⚠️  DRY RUN — no changes will be saved")
        print(f"{'='*60}\n")

        if total == 0:
            print("✅  Nothing to update!")
            return

        success = skipped = failed = 0

        for i, word in enumerate(words, 1):
            keyword = extract_search_keyword(word.english)
            prefix = (
                f"[{i:>4}/{total}] HSK{word.hsk_level} "
                f"{word.simplified:<4} "
                f"({keyword:<18})"
            )

            if should_skip_image(word.category):
                print(f"{prefix} ↷ SKIP  [{word.category}]")
                skipped += 1
                continue

            url = await get_image_for_word(word.english, word.category)

            if url:
                if not dry_run:
                    word.image_url = url
                    db.commit()
                short_url = url[:55] + "…" if len(url) > 55 else url
                print(f"{prefix} ✓  {short_url}")
                success += 1
            else:
                print(f"{prefix} ✗  no image found")
                failed += 1

            # Stay under Pexels' 200 req/hour rate limit
            await asyncio.sleep(RATE_LIMIT_DELAY)

        print(f"\n{'='*60}")
        print(f"  ✅  Done!")
        print(f"  Success : {success}")
        print(f"  Skipped : {skipped}  (grammar/function words)")
        print(f"  Failed  : {failed}  (no image found on Pixabay)")
        if dry_run:
            print("  ⚠️  DRY RUN — run without --dry-run to actually save")
        print(f"{'='*60}\n")

    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Bulk-update vocabulary images from Pixabay",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-fetch images even for words that already have one",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview results without writing to the database",
    )
    parser.add_argument(
        "--hsk",
        type=int,
        action="append",
        metavar="LEVEL",
        dest="hsk_levels",
        help="Only process this HSK level (can be repeated: --hsk 1 --hsk 2)",
    )
    args = parser.parse_args()
    asyncio.run(update_images(
        force=args.force,
        dry_run=args.dry_run,
        hsk_levels=args.hsk_levels,
    ))


if __name__ == "__main__":
    main()
