#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════╗
║        HSK Second Brain Generator for Obsidian           ║
║  Generates all vocabulary notes, MOCs, Canvas, & Chat    ║
╚══════════════════════════════════════════════════════════╝

Usage:
  1. Buka Obsidian → Settings → Local REST API → copy API Key
  2. Paste di bawah: API_KEY = "your-key-here"
  3. Run: python generate_obsidian_hsk.py
"""

import sys
import os
import re
import ast
import json
import requests
import urllib3
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ─── CONFIG ──────────────────────────────────────────────────────────────────
OBSIDIAN_API = "https://127.0.0.1:27124"
API_KEY = "861d0b255c72955fd1ef5a0656e3118ba450f12dcde3a3d5a0ea8ddbc64ab80f"

SEED_DIR = os.path.join(os.path.dirname(__file__), "backend")

# ─── OBSIDIAN API ─────────────────────────────────────────────────────────────
def create_note(filepath: str, content: str) -> bool:
    """Create or update a note in Obsidian vault."""
    url = f"{OBSIDIAN_API}/vault/{filepath}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "text/markdown; charset=utf-8",
    }
    try:
        r = requests.put(url, data=content.encode("utf-8"), headers=headers, verify=False, timeout=10)
        return r.status_code in (200, 204)
    except Exception as e:
        print(f"  ✗ Error creating {filepath}: {e}")
        return False


def safe_filename(simplified: str, pinyin: str) -> str:
    """Create a safe filename from Chinese character + pinyin."""
    clean_pinyin = re.sub(r'[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]', lambda m: {
        'ā':'a','á':'a','ǎ':'a','à':'a',
        'ē':'e','é':'e','ě':'e','è':'e',
        'ī':'i','í':'i','ǐ':'i','ì':'i',
        'ō':'o','ó':'o','ǒ':'o','ò':'o',
        'ū':'u','ú':'u','ǔ':'u','ù':'u',
        'ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v',
    }.get(m.group(), m.group()), pinyin)
    clean_pinyin = re.sub(r'[^a-z0-9 ]', '', clean_pinyin.lower()).strip()
    clean_pinyin = re.sub(r'\s+', '-', clean_pinyin)
    return f"{simplified} {clean_pinyin}"


# ─── DATA EXTRACTION ─────────────────────────────────────────────────────────
def extract_hsk1(filepath: str) -> list:
    """Extract HSK1 data (tuple format)."""
    words = []
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    # Find the list
    match = re.search(r'hsk1_complete\s*=\s*\[(.*?)\]', content, re.DOTALL)
    if not match:
        return words
    items = re.findall(r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)', match.group(1))
    for simplified, traditional, pinyin, english in items:
        words.append({"simplified": simplified, "traditional": traditional,
                      "pinyin": pinyin, "english": english, "category": "word", "hsk_level": 1})
    return words


def extract_hsk_dict(filepath: str, varname: str, level: int) -> list:
    """Extract HSK data (dict format)."""
    words = []
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    # Find all dict entries robustly
    pattern = re.compile(
        r'\{[^{}]*?"simplified"\s*:\s*"([^"]+)"[^{}]*?"traditional"\s*:\s*"([^"]+)"[^{}]*?'
        r'"pinyin"\s*:\s*"([^"]+)"[^{}]*?"english"\s*:\s*"([^"]+)"[^{}]*?'
        r'(?:"category"\s*:\s*"([^"]*)")?[^{}]*?\}',
        re.DOTALL
    )
    seen = set()
    for m in pattern.finditer(content):
        simplified = m.group(1)
        if simplified in seen:
            continue
        seen.add(simplified)
        words.append({
            "simplified": simplified,
            "traditional": m.group(2),
            "pinyin": m.group(3),
            "english": m.group(4),
            "category": m.group(5) or "word",
            "hsk_level": level,
        })
    return words


# ─── NOTE GENERATORS ─────────────────────────────────────────────────────────
CATEGORY_ICONS = {
    "verb": "⚡", "noun": "📦", "adjective": "🎨", "adverb": "💨",
    "people": "👤", "place": "📍", "weather": "🌤", "food": "🍜",
    "time": "⏰", "number": "🔢", "measure": "📏", "other": "✨",
    "word": "📝",
}

def category_link(cat: str) -> str:
    cat = cat.lower() if cat else "other"
    mapping = {
        "verb": "Verbs", "noun": "Nouns", "adjective": "Adjectives",
        "adverb": "Adverbs", "people": "People", "place": "Places",
        "weather": "Weather", "food": "Food", "time": "Time",
        "number": "Numbers", "measure": "Measure Words", "other": "Other Words",
        "word": "Other Words",
    }
    cat_page = mapping.get(cat, "Other Words")
    return f"[[HSK/Categories/{cat_page}|{cat_page}]]"


def make_word_note(word: dict) -> str:
    simplified = word["simplified"]
    traditional = word["traditional"]
    pinyin = word["pinyin"]
    english = word["english"]
    level = word["hsk_level"]
    cat = word.get("category", "word").lower()
    icon = CATEGORY_ICONS.get(cat, "📝")
    cat_lnk = category_link(cat)
    level_lnk = f"[[HSK/Levels/HSK {level}|HSK {level}]]"

    note = f"""---
type: hanzi-word
simplified: "{simplified}"
traditional: "{traditional}"
pinyin: "{pinyin}"
english: "{english}"
hsk_level: {level}
category: {cat}
tags:
  - HSK{level}
  - {cat}
  - hanzi
---

# {simplified} · {pinyin}

> [!tip] {icon} {english}
> **Traditional:** {traditional} | **Level:** {level_lnk} | **Category:** {cat_lnk}

## 基本信息 Basic Info

| | |
|---|---|
| **Simplified** | {simplified} |
| **Traditional** | {traditional} |
| **Pinyin** | {pinyin} |
| **English** | {english} |
| **HSK Level** | {level_lnk} |
| **Category** | {cat_lnk} |

## 例句 Example Sentences

> *Tambahkan contoh kalimat di sini...*

## 联想记忆 Mnemonic

> *Tulis cara menghafal karakter ini...*

## 相关词 Related Words

> *Tambahkan kata-kata terkait dengan wikilink seperti [[HSK/Words/HSK{level}/...]]...*

## 💬 Chat dengan AI tentang kata ini

```
Bantu saya belajar karakter Mandarin:
- Karakter: {simplified} ({traditional})
- Pinyin: {pinyin}
- Arti: {english}
- Level: HSK {level}

Tolong berikan:
1. 3 contoh kalimat dengan terjemahan
2. Tips mengingat karakter ini (mnemonic)
3. Kata-kata terkait yang sering dipakai bersama
4. Kapan digunakan secara formal vs informal?
```

---
*{level_lnk} · {cat_lnk} · [[HSK/🏠 HSK Second Brain|Second Brain]]*
"""
    return note.strip()


def make_level_moc(level: int, words: list) -> str:
    colors = {1: "🟢", 2: "🔵", 3: "🟡", 4: "🟠", 5: "🔴", 6: "🟣"}
    icon = colors.get(level, "⚪")

    # Group by category
    by_cat = {}
    for w in words:
        cat = w.get("category", "word")
        by_cat.setdefault(cat, []).append(w)

    cat_sections = ""
    for cat, cat_words in sorted(by_cat.items()):
        cat_icon = CATEGORY_ICONS.get(cat.lower(), "📝")
        links = ", ".join(
            f"[[HSK/Words/HSK{level}/{safe_filename(w['simplified'], w['pinyin'])}|{w['simplified']}]]"
            for w in sorted(cat_words, key=lambda x: x['pinyin'])
        )
        cat_sections += f"\n### {cat_icon} {cat.title()}\n{links}\n"

    return f"""---
type: level-moc
hsk_level: {level}
total_words: {len(words)}
tags: [HSK{level}, MOC]
---

# {icon} HSK {level} — Map of Content

> **{len(words)} kata** | Klik setiap karakter untuk buka catatannya

## 📊 Statistics

| Stat | Value |
|------|-------|
| Total Kata | {len(words)} |
| Level | HSK {level} |
| Kategori | {len(by_cat)} kategori |

## 🗺️ Semua Kata per Kategori
{cat_sections}

## 🔍 Cari dengan Dataview

```dataview
TABLE pinyin, english, category
FROM "HSK/Words/HSK{level}"
SORT pinyin ASC
```

---
*[[HSK/🏠 HSK Second Brain|← Kembali ke Second Brain]]*
""".strip()


def make_category_moc(cat_name: str, all_words: list) -> str:
    icon = CATEGORY_ICONS.get(cat_name.lower().replace(" words", "").replace("other ", ""), "📝")
    by_level = {}
    for w in all_words:
        lv = w["hsk_level"]
        by_level.setdefault(lv, []).append(w)

    level_sections = ""
    for lv in sorted(by_level.keys()):
        lv_words = by_level[lv]
        links = ", ".join(
            f"[[HSK/Words/HSK{lv}/{safe_filename(w['simplified'], w['pinyin'])}|{w['simplified']}]]"
            for w in sorted(lv_words, key=lambda x: x['pinyin'])
        )
        level_sections += f"\n### HSK {lv}\n{links}\n"

    return f"""---
type: category-moc
category: {cat_name}
total_words: {len(all_words)}
tags: [category, MOC]
---

# {icon} {cat_name}

> **{len(all_words)} kata** di semua level HSK

## Kata per Level
{level_sections}

## 🔍 Dataview Query

```dataview
TABLE hsk_level, pinyin, english
FROM "HSK/Words"
WHERE category = "{cat_name.lower()}"
SORT hsk_level ASC, pinyin ASC
```

---
*[[HSK/🏠 HSK Second Brain|← Second Brain]]*
""".strip()


def make_home(level_stats: dict) -> str:
    total = sum(level_stats.values())
    rows = "\n".join(
        f"| [[HSK/Levels/HSK {lv}\\|HSK {lv}]] | {count} | "
        + "⭐" * lv + " |"
        for lv, count in sorted(level_stats.items())
    )

    return f"""---
type: home
tags: [MOC, HSK, second-brain]
---

# 🧠 HSK Second Brain

> Selamat datang di Second Brain belajar Mandarin!
> **{total} kata** dari HSK 1–6 tersimpan di sini.

## 📚 Navigasi Level

| Level | Jumlah Kata | Kesulitan |
|-------|-------------|-----------|
{rows}

## 🗂️ Navigasi Kategori

- [[HSK/Categories/Verbs|⚡ Verbs]] — Kata kerja
- [[HSK/Categories/Nouns|📦 Nouns]] — Kata benda
- [[HSK/Categories/Adjectives|🎨 Adjectives]] — Kata sifat
- [[HSK/Categories/Adverbs|💨 Adverbs]] — Kata keterangan
- [[HSK/Categories/People|👤 People]] — Orang & hubungan
- [[HSK/Categories/Places|📍 Places]] — Tempat & lokasi
- [[HSK/Categories/Time|⏰ Time]] — Waktu
- [[HSK/Categories/Food|🍜 Food]] — Makanan
- [[HSK/Categories/Weather|🌤 Weather]] — Cuaca

## 💬 Chat dengan AI

→ [[HSK/💬 Chat dengan HSK|Mulai Ngobrol dengan AI tentang HSK]]

## 🔍 Cari Kata

```dataview
TABLE pinyin, english, hsk_level AS "Level"
FROM "HSK/Words"
SORT hsk_level ASC, pinyin ASC
LIMIT 20
```

## 📊 Progress Belajar

```dataview
TABLE length(rows) AS "Kata Dipelajari"
FROM "HSK/Words"
GROUP BY hsk_level
```

---
*Dibuat otomatis oleh `generate_obsidian_hsk.py`*
""".strip()


def make_chat_hub(all_words: list) -> str:
    # Pick random examples from different levels
    examples = {1: None, 3: None, 5: None}
    for w in all_words:
        lv = w["hsk_level"]
        if lv in examples and examples[lv] is None:
            examples[lv] = w

    sample_words = "\n".join(
        f"- **{w['simplified']}** ({w['pinyin']}) = {w['english']}"
        for lv, w in sorted(examples.items()) if w
    )

    return f"""---
type: chat-hub
tags: [chat, AI, HSK]
---

# 💬 Chat dengan HSK Second Brain

> Gunakan halaman ini sebagai pusat interaksi AI dengan pengetahuan HSK kamu.

## 🤖 Setup Chat AI di Obsidian

### Plugin yang Direkomendasikan:

1. **Obsidian Copilot** (paling mudah)
   - Install dari Community Plugins
   - Masukkan Claude/OpenAI API key
   - Ketik `/chat` di note mana saja
   - Copilot akan membaca semua note HSK sebagai konteks

2. **Smart Connections**
   - Semantic search seluruh vault
   - Chat berdasarkan konten note yang relevan
   - Cocok untuk "tanya tentang kata X"

3. **Local AI (Ollama)**
   - 100% offline
   - Install Ollama + model bahasa Mandarin

---

## 📝 Template Prompt Siap Pakai

### 🔤 Tanya tentang satu kata:
```
Saya sedang belajar kata Mandarin: [KATA] ([PINYIN])
Artinya: [ARTI]

Tolong jelaskan:
1. Cara penggunaan dalam kalimat sehari-hari (3 contoh)
2. Perbedaan dengan kata serupa
3. Tips menghafal karakter ini
4. Ekspresi idiomatik yang menggunakan kata ini
```

### 📚 Bandingkan kata-kata:
```
Bandingkan kata-kata Mandarin berikut dan jelaskan perbedaan nuansa:
- [KATA1] vs [KATA2]
Kapan menggunakan masing-masing? Berikan contoh kalimat.
```

### 🎯 Latihan percakapan:
```
Mari latihan percakapan Mandarin tentang topik: [TOPIK]
Gunakan kata-kata HSK [LEVEL]. Mulai percakapan sekarang!
```

### 🧪 Buat soal latihan:
```
Buat 5 soal pilihan ganda HSK [LEVEL] tentang kata-kata:
[DAFTAR KATA]
Sertakan jawaban dan penjelasan.
```

---

## 🌟 Contoh Kata untuk Dicoba

{sample_words}

---

## 🗺️ Navigasi

- [[HSK/🏠 HSK Second Brain|🏠 Home]]
- [[HSK/Levels/HSK 1|HSK 1]] · [[HSK/Levels/HSK 2|HSK 2]] · [[HSK/Levels/HSK 3|HSK 3]]
- [[HSK/Levels/HSK 4|HSK 4]] · [[HSK/Levels/HSK 5|HSK 5]] · [[HSK/Levels/HSK 6|HSK 6]]

---
*Untuk chat yang lebih baik, install plugin **Obsidian Copilot** dan masukkan API key Claude (claude.ai/settings)*
""".strip()


def make_canvas(all_words: list) -> str:
    """Generate Obsidian Canvas JSON for second brain visual."""
    nodes = []
    edges = []

    # Center node
    nodes.append({
        "id": "home", "type": "file", "file": "HSK/\U0001f3e0 HSK Second Brain.md",
        "x": 0, "y": 0, "width": 250, "height": 60,
        "color": "1"
    })

    # Level nodes
    level_positions = [
        (1, -600, -200), (2, -300, -300), (3, 0, -350),
        (4, 300, -300), (5, 600, -200), (6, 600, 200),
    ]
    level_colors = {"1": "4", "2": "4", "3": "5", "4": "5", "5": "3", "6": "3"}

    for lv, x, y in level_positions:
        count = sum(1 for w in all_words if w["hsk_level"] == lv)
        nodes.append({
            "id": f"level{lv}", "type": "file",
            "file": f"HSK/Levels/HSK {lv}.md",
            "x": x, "y": y, "width": 200, "height": 60,
            "color": level_colors.get(str(lv), "6")
        })
        edges.append({
            "id": f"e-home-l{lv}", "fromNode": "home", "fromSide": "top",
            "toNode": f"level{lv}", "toSide": "bottom",
            "label": f"{count} kata"
        })

    # Category nodes
    cat_positions = [
        ("Verbs", -800, 100, "2"), ("Nouns", -600, 200, "2"),
        ("Adjectives", -400, 300, "6"), ("People", -200, 350, "6"),
        ("Places", 200, 350, "6"), ("Time", 400, 300, "6"),
        ("Food", 600, 400, "5"), ("Weather", 800, 200, "5"),
    ]

    for cat, x, y, color in cat_positions:
        count = sum(1 for w in all_words if w.get("category", "").lower() in cat.lower() or
                    (cat == "Verbs" and w.get("category", "") == "verb") or
                    (cat == "Nouns" and w.get("category", "") in ["noun", "people", "place"]))
        nodes.append({
            "id": f"cat-{cat.lower()}", "type": "file",
            "file": f"HSK/Categories/{cat}.md",
            "x": x, "y": y, "width": 180, "height": 50,
            "color": color
        })
        edges.append({
            "id": f"e-home-{cat.lower()}", "fromNode": "home", "fromSide": "bottom",
            "toNode": f"cat-{cat.lower()}", "toSide": "top"
        })

    # Chat node
    nodes.append({
        "id": "chat", "type": "file", "file": "HSK/\U0001f4ac Chat dengan HSK.md",
        "x": 0, "y": 300, "width": 220, "height": 60, "color": "3"
    })
    edges.append({
        "id": "e-home-chat", "fromNode": "home", "fromSide": "bottom",
        "toNode": "chat", "toSide": "top"
    })

    canvas = {"nodes": nodes, "edges": edges}
    return json.dumps(canvas, ensure_ascii=False, indent=2)


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    global API_KEY

    if not API_KEY:
        API_KEY = input("🔑 Masukkan Obsidian REST API key: ").strip()
    if not API_KEY:
        print("❌ API key diperlukan! Buka Obsidian → Settings → Local REST API")
        sys.exit(1)

    print("\n🧠 HSK Second Brain Generator")
    print("=" * 50)

    # ── Load all seed data ──────────────────────────────
    print("\n📂 Loading seed data...")
    all_words = []

    seed_files = {
        1: os.path.join(SEED_DIR, "seed_hsk1_complete.py"),
        2: os.path.join(SEED_DIR, "seed_hsk2_complete.py"),
        3: os.path.join(SEED_DIR, "seed_hsk3_full.py"),
        4: os.path.join(SEED_DIR, "seed_hsk4_full.py"),
        5: os.path.join(SEED_DIR, "seed_hsk5_full.py"),
        6: os.path.join(SEED_DIR, "seed_hsk6_full.py"),
    }

    for level, filepath in seed_files.items():
        if not os.path.exists(filepath):
            print(f"  ⚠️  File tidak ditemukan: {filepath}")
            continue
        if level == 1:
            words = extract_hsk1(filepath)
        else:
            words = extract_hsk_dict(filepath, "", level)
        print(f"  ✓ HSK {level}: {len(words)} kata")
        all_words.extend(words)

    print(f"\n  Total: {len(all_words)} kata dari semua level")

    # ── Create folder structure (via dummy files) ───────
    print("\n📁 Membuat struktur folder...")

    # ── Generate word notes ─────────────────────────────
    print("\n📝 Membuat word notes...")
    success = 0
    failed = 0

    for w in all_words:
        level = w["hsk_level"]
        filename = safe_filename(w["simplified"], w["pinyin"])
        filepath = f"HSK/Words/HSK{level}/{filename}.md"
        content = make_word_note(w)
        if create_note(filepath, content):
            success += 1
        else:
            failed += 1
        if success % 50 == 0:
            print(f"  ... {success} kata selesai")

    print(f"  ✓ {success} notes berhasil | ✗ {failed} gagal")

    # ── Generate Level MOCs ─────────────────────────────
    print("\n🗺️  Membuat Level MOC pages...")
    level_stats = {}
    for level in range(1, 7):
        level_words = [w for w in all_words if w["hsk_level"] == level]
        level_stats[level] = len(level_words)
        content = make_level_moc(level, level_words)
        create_note(f"HSK/Levels/HSK {level}.md", content)
        print(f"  ✓ HSK {level} MOC ({len(level_words)} kata)")

    # ── Generate Category MOCs ──────────────────────────
    print("\n🗂️  Membuat Category MOC pages...")
    category_mapping = {
        "Verbs": ["verb"],
        "Nouns": ["noun"],
        "Adjectives": ["adjective"],
        "Adverbs": ["adverb"],
        "People": ["people"],
        "Places": ["place"],
        "Food": ["food"],
        "Weather": ["weather"],
        "Time": ["time"],
        "Numbers": ["number"],
        "Measure Words": ["measure"],
        "Other Words": ["other", "word", ""],
    }

    for cat_name, cat_keys in category_mapping.items():
        cat_words = [w for w in all_words if w.get("category", "").lower() in cat_keys]
        content = make_category_moc(cat_name, cat_words)
        create_note(f"HSK/Categories/{cat_name}.md", content)
        print(f"  ✓ {cat_name} ({len(cat_words)} kata)")

    # ── Generate Home ───────────────────────────────────
    print("\n🏠 Membuat HSK Home...")
    content = make_home(level_stats)
    create_note("HSK/🏠 HSK Second Brain.md", content)
    print("  ✓ Home page selesai")

    # ── Generate Chat Hub ───────────────────────────────
    print("\n💬 Membuat Chat Hub...")
    content = make_chat_hub(all_words)
    create_note("HSK/💬 Chat dengan HSK.md", content)
    print("  ✓ Chat hub selesai")

    # ── Generate Canvas ─────────────────────────────────
    print("\n🎨 Membuat Second Brain Canvas...")
    canvas_content = make_canvas(all_words)
    url = f"{OBSIDIAN_API}/vault/HSK/🧠 Second Brain.canvas"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.put(url, data=canvas_content.encode("utf-8"), headers=headers, verify=False, timeout=10)
        if r.status_code in (200, 204):
            print("  ✓ Canvas selesai")
        else:
            print(f"  ⚠️  Canvas status: {r.status_code}")
    except Exception as e:
        print(f"  ✗ Canvas error: {e}")

    # ── Done ─────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("✅ HSK Second Brain selesai dibuat!")
    print("\n📌 Langkah selanjutnya di Obsidian:")
    print("  1. Buka 'HSK/🏠 HSK Second Brain.md' sebagai hub utama")
    print("  2. Buka 'HSK/🧠 Second Brain.canvas' untuk Graph view visual")
    print("  3. Buka 'HSK/💬 Chat dengan HSK.md' untuk setup AI chat")
    print("  4. Install plugin 'Obsidian Copilot' untuk chat dengan AI")
    print("  5. Install plugin 'Dataview' untuk query dinamis")
    print("\n💡 Tips Graph View:")
    print("  - Buka Graph View (Ctrl+G)")
    print("  - Filter: path:HSK")
    print("  - Lihat koneksi antar kata, level, dan kategori!")


if __name__ == "__main__":
    main()
