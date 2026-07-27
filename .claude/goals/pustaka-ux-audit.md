# Goal: Audit UX Menyeluruh — Semua Fitur Tab Pustaka

> Source of truth untuk audit + perbaikan UX 18 fitur di tab Pustaka (`/library`).
> Dijalankan lewat `/audit-pustaka` — **satu fitur per iterasi**, di-`/loop` sampai semua `[x]`.
> Karena tiap iterasi mandiri & hasilnya dicatat di sini, loop aman dijeda kapan pun
> (mis. kena limit) dan tinggal dilanjut: iterasi berikutnya ambil `[ ]` pertama.

## Rubrik audit (periksa 8 dimensi ini tiap fitur)

Rubrik ini disusun dari temuan nyata audit Stories (SUX-01..14), bukan checklist generik.

| # | Dimensi | Yang dicari |
|---|---|---|
| A | **i18n** | String user-facing hardcoded (di Stories: 3 dari 4 file 100% Inggris padahal app EN+ID). Cek juga `toast.*`, `placeholder`, `title`, `aria-label` |
| B | **Kejujuran UI** | Placeholder menyamar jadi fitur; fallback palsu (mis. kuis generik `correctAnswer:0` yang selalu "benar"); teks "coming soon" tersamar |
| C | **State loading/empty/error** | Ada skeleton? Error tampil jujur + tombol coba lagi? Empty state menjelaskan langkah berikutnya? |
| D | **Dead-end & umpan balik** | Tombol yang gagal diam-diam; aksi tanpa konfirmasi/hasil; tombol tampil padahal backend pasti menolak (mis. Delete untuk cerita bukan milik user) |
| E | **A11y** | `aria-label` di tombol ikon-saja; Esc menutup modal/panel; backdrop klik-tutup; fokus terlihat; `window.confirm` native (tak bergaya, rusak di dark mode) |
| F | **Mobile & dark mode** | Overflow horizontal; target sentuh < 40px; warna hardcoded tanpa varian `dark:` (mis. `text-purple-900` polos) |
| G | **Tipe & data** | Field yang dibaca UI tapi tak ada di respons API → diam-diam `undefined` (persis bug SUX-08: badge HSK & terjemahan kosong berbulan-bulan). Cek lawan `backend/app/schemas.py` |
| H | **Konsistensi** | Token desain (`primary-*`, `success-*`, `error-*`, `surface-card`); pola komponen; duplikasi tipe/logic |

## Aturan pengerjaan (WAJIB tiap iterasi)

- **Satu fitur per iterasi.** Audit dulu (baca file + cek lawan schema/i18n), lalu perbaiki temuan **P0/P1** di iterasi yang sama.
- Temuan P2 (nice-to-have) **dicatat saja** di bagian fitur tsb, jangan dikerjakan — biar loop tetap bergerak.
- Teks user-facing lewat `t('...')`; key ditambah di **`id.json` DAN `en.json`**.
- TypeScript strict tanpa `any`; token Tailwind; `@/` alias; Framer Motion.
- `cd frontend && npm run build` **wajib hijau** sebelum commit.
- Commit lewat tool Bash pakai **heredoc** (`git commit -F - <<'EOF'`), JANGAN `@'...'@` (itu PowerShell — `@` bocor ke pesan).
- Kalau butuh backend: tambah endpoint, `alembic revision --autogenerate` → **review & pangkas** hasil autogenerate (repo ini rutin mengusulkan drop `story_bookmarks` / `uq_user_progress_user_word` yang tak terkait) → `upgrade head`, lalu kabari bahwa perlu deploy Koyeb.

---

## Bagian 1 — Hub

- [ ] **AUD-00 · Halaman Pustaka** (`pages/Library.tsx` + `data/practiceCatalog.ts`, 130+49 baris)
  - Sudah terlihat sebelum audit: gating `unlockAt` memakai `total_words_learning` dan **fail-open** saat fetch gagal — perlu dicek apakah itu disengaja & konsisten dengan LockedCard.
  - Cek: search hanya cocokkan label+desc (tak ada sinonim/route), tak ada state loading saat `wordsLearned` belum tiba.

## Bagian 2 — Latihan (PRACTICE_ITEMS)

- [ ] **AUD-01 · Kartu Kosakata** — `/flashcards` · `Flashcards.tsx` (656)
- [ ] **AUD-02 · Menulis** — `/writing` · `Writing.tsx` (350) + `components/writing/WritingCanvas.tsx`
- [ ] **AUD-03 · Mengetik** — `/typing` · `Typing.tsx` (186)
- [ ] **AUD-04 · Berbicara** — `/speaking` · `SpeakingPractice.tsx` (716) — STT, cek izin mikrofon & error state
- [ ] **AUD-05 · Dikte** — `/dictation` · `Dictation.tsx` (510) — TTS
- [ ] **AUD-06 · Kuis** — `/quiz` · `Quiz.tsx` (657)
- [ ] **AUD-07 · Nada** — `/tones` · `ToneTrainer.tsx` (301)
- [ ] **AUD-08 · Tes Simulasi** — `/mock-test` · `MockTest.tsx` (1060) — file terbesar, kandidat split per `feedback_split_large_files`
- [ ] **AUD-09 · Kosakata** — `/vocabulary` · `Vocabulary.tsx` (521)
- [ ] **AUD-10 · Isi Cerita** — `/explorer` · `SentenceScramble.tsx` (327)
  - **Sudah ditemukan sebelum audit:** satu fitur, **empat identitas** — route `/explorer`, LazyPage `name="HanziExplorer"`, komponen `SentenceScramble`, katalog key `storyBlanks` (label "Isi Cerita"). Membingungkan saat debug & lazy-chunk salah nama. Rapikan jadi konsisten.

## Bagian 3 — Main (PLAY_ITEMS)

- [ ] **AUD-11 · Tantangan Harian** — `/daily-challenge` · `DailyChallenge.tsx` (333)
- [ ] **AUD-12 · Chat AI** — `/conversation` · `Conversation.tsx` (483)
- [ ] **AUD-13 · Cocokkan** — `/matching` · `MatchingGame.tsx` (272)
- [ ] **AUD-14 · Susun Kalimat** — `/sentence-builder` · `SentenceBuilder.tsx` (515)
- [ ] **AUD-15 · Petualangan** — `/adventure` · `Adventure.tsx` (547) · unlock 20 kata
- [ ] **AUD-16 · Tantangan Cerita** — `/story-challenge` · `StoryChallenge.tsx` (602) · unlock 30 kata
  - Catatan: sudah tersentuh di SUX-03 (i18n) & SUX-08 (tipe). Audit sisanya (a11y, state, mobile).
- [ ] **AUD-17 · Duel** — `/battle` · `Battle.tsx` (894) · unlock 50 kata — realtime, cek state koneksi terputus
- [ ] **AUD-18 · Ular Tangga HSK** — `/ladder` · `LadderRace.tsx` (423) · unlock 50 kata

---

## Temuan per fitur
<!-- Tiap iterasi menambahkan blok di bawah ini:
### AUD-xx · <Nama> — <tanggal> <hash>
**Diperbaiki:** ...
**Dicatat (P2, belum dikerjakan):** ...
-->

## Log
<!-- `- YYYY-MM-DD AUD-xx <hash> ringkas` -->
