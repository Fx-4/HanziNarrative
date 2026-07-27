# Goal: Perbaikan UX Fitur Stories

> Checklist ini adalah **source of truth** untuk perbaikan UX fitur Stories.
> Dijalankan lewat slash command `/fix-stories-ux` (satu task per iterasi), di-`/loop` sampai semua `[x]`.
> Setelah menyelesaikan sebuah task: build hijau → commit per concern (konvensi git proyek) → centang `[x]` + tanggal di sini.

## Ruang lingkup file
| File | Peran |
|---|---|
| `frontend/src/pages/Stories.tsx` | Halaman Browse + Generate (list, filter, search) |
| `frontend/src/pages/StoryReader.tsx` | Pembaca cerita interaktif (pinyin, TTS, kuis, vocab, bookmark) |
| `frontend/src/components/StoryGenerator.tsx` | Form generate cerita AI (Quick/Advanced) |
| `frontend/src/pages/StoryChallenge.tsx` | Mode isi-rumpang menulis karakter |
| `frontend/src/i18n/locales/{id,en}.json` | Sumber teks dwibahasa |

## Aturan pengerjaan (WAJIB tiap task)
- Teks user-facing lewat `t('...')`, tambah key di **id.json DAN en.json** (dua-duanya).
- TypeScript strict, tanpa `any`; styling via token Tailwind (`primary-*`, `success-*`, `error-*`, `surface-card`).
- `npm run build` harus lolos sebelum commit.
- Commit per concern; body list perubahan per file.
- Jangan bikin ulang route `/practice` (sudah dihapus).

---

## P0 — Konsistensi Bahasa (i18n) — paling terlihat, app dwibahasa

- [x] **SUX-01 · i18n StoryReader** — Semua string di `StoryReader.tsx` masih hardcoded English (label tombol "Show/Hide Pinyin", "Read Aloud", "Vocabulary", "Take Quiz", "Save"; semua `toast.*`; blok "English Translation"; "Comprehension Quiz"/"Submit Quiz"/"Explanation:"/"Retry Quiz"; sidebar "Vocabulary List"/"Click to see full definition"; hint "Click any character for details"; "Story not found"; dialog delete). Pindahkan ke namespace `storyReader.*` di id.json+en.json, ganti semua ke `t()`.
  - *Selesai bila:* tak ada literal Inggris user-facing tersisa di file; toggle bahasa mengubah seluruh UI reader; build hijau.

- [x] **SUX-02 · i18n StoryGenerator** — `StoryGenerator.tsx` hardcoded English: kartu mode "Quick"/"Advanced" + deskripsi, label form ("HSK Level", "Topic (Optional)", "Story Length", "Genre", "Tone / Mood", "Setting / Location", "Cultural Theme", "Perspective", "Dialogue", "Character Names", "Target Vocabulary", "Grammar Patterns"), pesan loading, "Story saved! Find it in Browse Stories.", heading "Story"/"Pinyin"/"Key Vocabulary"/"Grammar Points"/"Error", "Rate limit reached...", "left today"/"left/hour". Namespace `storyGen.*`.
  - *Catatan:* label emoji pada opsi (genre/tone/setting/cultural) boleh tetap, tapi teksnya diterjemahkan.
  - *Selesai bila:* seluruh UI generator ikut bahasa UI; build hijau.

- [x] **SUX-03 · i18n StoryChallenge** — `StoryChallenge.tsx` hardcoded English: "Unlock the Story", "Write characters to reveal hidden words in stories", "Select HSK Level", "No stories available..."/"Generate some stories first!", blok "How it works" (1. Read / 2. Write / 3. Unlock), header "← Back"/"Listen"/"Playing...", "unlocked", hint "Click a blank to write and unlock:", modal "Write:", celebration "Story Unlocked!"/"You wrote all N hidden words correctly!"/"English translation:"/"Try Another Story", semua toast. Namespace `storyChallenge.page.*` (jangan bentrok dgn nav label `storyChallenge` yang sudah ada).
  - *Selesai bila:* seluruh UI challenge ikut bahasa UI; build hijau.

## P1 — Bug & jebakan UX fungsional

- [x] **SUX-04 · Delete Story aman & bergaya** — Tombol "Delete Story" merah tampil untuk SEMUA cerita (termasuk curated / bukan milik user), padahal backend menolak non-pemilik → dead-end membingungkan. Dan pakai `window.confirm` native (tak bergaya, rusak di dark mode).
  - *Selesai bila:* tombol hanya muncul untuk cerita yang boleh dihapus user (mis. `category === 'ai_generated'` / milik user); konfirmasi pakai modal bergaya design system + i18n; build hijau.

- [x] **SUX-05 · Vocabulary sidebar bukan placeholder** — Sidebar hanya ambil 30 karakter unik pertama & setiap "Meaning" berbunyi "Click on vocabulary page to see detailed meaning...". Ini placeholder menyamar jadi fitur.
  - *Selesai bila:* tampilkan arti asli (gunakan `storiesApi.getStoryWords(id)` / `vocabularyApi`); bila data tak ada, tampilkan state jujur (bukan kalimat placeholder). Sidebar dapat backdrop, tutup via Esc & klik-luar, tombol ✕ punya `aria-label`. Build hijau.

- [x] **SUX-06 · Klik karakter tak buntu** — "Click any character for details" sering berakhir toast "Word not found in vocabulary" karena `searchWords(char)` gagal untuk kata multi-karakter.
  - *Selesai bila:* saat single-char gagal, coba kata multi-karakter di sekitar posisi klik sebelum menyerah; feedback lebih baik daripada sekadar toast gagal. Build hijau.

- [x] **SUX-07 · Kuis: hapus fallback palsu** — Saat generate kuis gagal, muncul pertanyaan generik Inggris "What is the main topic of this story?" dgn `correctAnswer: 0` (selalu "benar") — menyesatkan.
  - *Selesai bila:* kegagalan menampilkan pesan error jujur + tombol coba lagi (i18n), bukan pertanyaan palsu. Build hijau.

- [x] **SUX-08 · Hapus duplikasi tipe Story** — `StoryChallenge.tsx` mendefinisikan `interface Story` lokal (`difficulty_level`, `content_english`) yang beda field dari tipe global `Story` (`hsk_level`, `english_translation`) → risiko field mismatch (mis. badge `HSK {story.difficulty_level}` bisa `undefined`).
  - *Selesai bila:* pakai tipe global `Story` dari `@/types` (atau map field secara eksplisit & konsisten); tak ada field yang salah nama. Build hijau.

## P2 — Peningkatan pengalaman baca

- [x] **SUX-09 · Read Aloud dengan highlight & kontrol** — TTS berjalan tanpa indikasi posisi. Untuk pembelajar, sorot paragraf/kalimat yang sedang dibaca; tambah tombol pause (bukan cuma stop) dan opsi kecepatan.
  - *Selesai bila:* paragraf aktif ter-highlight saat dibaca; ada pause/resume; build hijau. (Frontend-only cukup.)

- [x] **SUX-10 · Progress baca + reward** — Membaca cerita tidak memberi apa pun (beda dgn StoryChallenge yang beri XP). Tak ada tanda "sudah dibaca".
  - *Selesai bila:* cerita yang selesai dibaca ditandai (badge di kartu Browse) + beri XP. **Perlu endpoint backend baru** (mis. `POST /stories/{id}/complete`) — kerjakan backend + migrasi bila perlu, lalu frontend. Build hijau.

- [x] **SUX-11 · Terjemahan inline per-paragraf** — Terjemahan muncul sebagai satu blok di paling bawah, jauh dari teks. Untuk pembelajar lebih berguna per-paragraf.
  - *Selesai bila:* saat "Show Translation" aktif, terjemahan tampil selaras per paragraf (interlinear/di bawah tiap paragraf), bukan satu blok terpisah. Build hijau.

- [x] **SUX-12 · Browse list lebih berguna** — Search hanya cocokkan judul (bukan konten); kartu tak menunjukkan status sudah-dibaca/tersimpan; tak ada sort.
  - *Selesai bila:* search mencakup konten; kartu tampilkan badge tersimpan/sudah-dibaca; ada sort (terbaru/level). Build hijau.

- [x] **SUX-13 · Story Challenge dapat ditemukan** — Halaman Stories punya tab Browse+Generate tapi tak menautkan mode Story Challenge (isi-rumpang) — dua pengalaman cerita terpisah.
  - *Selesai bila:* ada entri jelas dari Stories menuju Story Challenge (tab/tombol/kartu), i18n. Build hijau.

- [x] **SUX-14 · Excerpt kartu rapi** — Kartu Browse pakai `content.substring(0,100)` → memotong di tengah kalimat/karakter.
  - *Selesai bila:* excerpt dipotong di batas kalimat (。！？) atau pakai pendekatan bersih; opsional preview pinyin. Build hijau.

---

## Log
<!-- Iterasi menambahkan baris: `- YYYY-MM-DD SUX-xx <commit hash> ringkas` -->
- 2026-07-26 SUX-01 4948b4a i18n StoryReader → namespace storyReader (id+en), semua string ke t(), build hijau
- 2026-07-26 SUX-02 c09abf8 i18n StoryGenerator → namespace storyGen (id+en), opsi preset emoji+key, build hijau
- 2026-07-27 SUX-03 4bd48ae i18n StoryChallenge → namespace storyChallengePage (id+en), landing+challenge+modal ke t(), build hijau
- 2026-07-27 SUX-04 0390942 Delete Story: tombol hanya pemilik/admin + modal konfirmasi bergaya (Esc/backdrop), ganti window.confirm, build hijau
- 2026-07-27 SUX-05 2f30ceb Vocabulary sidebar: definisi asli via getStoryWords + fallback jujur, backdrop/Esc/aria-label, build hijau
- 2026-07-27 SUX-06 aacecc3 Klik karakter: PinyinText kirim konteks tetangga, handler coba kata multi-karakter (longest-first, exact-preference), build hijau
- 2026-07-27 SUX-07 b784cc4 Kuis: hapus fallback palsu → error state + retry + loading skeleton, build hijau
- 2026-07-27 SUX-08 148a9ef Tipe Story global di StoryChallenge; perbaiki 4 field mismatch (badge HSK, terjemahan, subjudul, chip vocab yang selama ini kosong), build hijau. **P1 tuntas**
- 2026-07-27 SUX-09 2dc537e Read Aloud: highlight paragraf aktif (chunk bawa paraIdx) + tombol pause/resume, build hijau
- 2026-07-27 SUX-10 2ccfe2f (BE) + c29be54 (FE) XP baca: model StoryRead + migrasi 357688903f9d (SUDAH di-apply ke Supabase), POST /stories/{id}/complete idempotent 15 XP, GET /stories/reads/my-reads, tombol Selesai Baca + badge Browse. **Butuh deploy Koyeb agar endpoint live**
- 2026-07-27 SUX-11 dd693bb Terjemahan inline per-paragraf saat jumlah paragraf selaras; blok bawah jadi fallback, build hijau
- 2026-07-27 SUX-12 7693686 Browse: search cakup isi cerita, badge Tersimpan (getMyBookmarks), sort Terbaru/Level HSK, build hijau
- 2026-07-27 SUX-13 7aa94ed Kartu ajakan ke /story-challenge di akhir tab Jelajahi, build hijau
- 2026-07-27 SUX-14 e99484c Excerpt kartu dipotong di batas kalimat (helper excerpt), build hijau. **SEMUA 14 TASK SELESAI**

## Sisa / catatan lanjutan
- **Deploy Koyeb** masih diperlukan agar endpoint SUX-10 (`POST /stories/{id}/complete`, `GET /stories/reads/my-reads`) hidup di produksi. Migrasi DB-nya sudah ter-apply ke Supabase.
- Autogenerate Alembic sempat mengusulkan `uq_user_progress_user_word` + beberapa index pada `ai_usage`/`user_progress`; sengaja TIDAK diikutkan (bisa gagal bila ada baris duplikat). Kalau memang diinginkan, jadikan task tersendiri dengan cek duplikat lebih dulu.
