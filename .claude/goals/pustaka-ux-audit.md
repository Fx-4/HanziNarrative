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

- [x] **AUD-00 · Halaman Pustaka** (`pages/Library.tsx` + `data/practiceCatalog.ts`, 130+49 baris)
  - Sudah terlihat sebelum audit: gating `unlockAt` memakai `total_words_learning` dan **fail-open** saat fetch gagal — perlu dicek apakah itu disengaja & konsisten dengan LockedCard.
  - Cek: search hanya cocokkan label+desc (tak ada sinonim/route), tak ada state loading saat `wordsLearned` belum tiba.

## Bagian 2 — Latihan (PRACTICE_ITEMS)

- [x] **AUD-01 · Kartu Kosakata** — `/flashcards` · `Flashcards.tsx` (656)
- [x] **AUD-02 · Menulis** — `/writing` · `Writing.tsx` (350) + `components/writing/WritingCanvas.tsx`
- [x] **AUD-03 · Mengetik** — `/typing` · `Typing.tsx` (186)
- [x] **AUD-04 · Berbicara** — `/speaking` · `SpeakingPractice.tsx` (716) — STT, cek izin mikrofon & error state
- [x] **AUD-05 · Dikte** — `/dictation` · `Dictation.tsx` (510) — TTS
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

### AUD-00 · Halaman Pustaka — 2026-07-27 0c05474
Diaudit: `pages/Library.tsx`, `data/practiceCatalog.ts`.

**Bersih:** A (i18n — semua key `library.*`, `nav.sections.*`, `nav.items.*` lengkap di id+en, tak ada literal hardcoded) · B (LockedCard jujur menyebut ambangnya) · F (grid responsif, varian dark lengkap) · G (**dicek khusus:** `readCachedWordCount` baca `data.overallStats` sementara API pakai `res.overall` — terlihat seperti mismatch, ternyata **dua-duanya benar**; Dashboard menulis `{data:{overallStats,…}}`).

**Diperbaiki (P1):**
- *Kedip item terkunci* — untuk user baru tanpa cache, `wordsLearned` mulai `null` → 4 item bergerbang (Petualangan/Tantangan Cerita/Duel/Ular Tangga) tampil **terbuka** lalu menyentak jadi terkunci saat stats tiba; sempat bisa keburu diklik. State jadi `{words, resolved}` + `PendingCard` skeleton. Fail-open saat error jaringan **dipertahankan** (perilaku yang memang disengaja).
- *Input pencarian tanpa nama aksesibel* — hanya `placeholder`; ditambah `aria-label` + `id` + `name` (selaras `Stories.tsx`).

**Dicatat (P2, belum dikerjakan):**
- Ikon dekoratif (`Search`, `SearchX`, `Lock`, ikon section) belum `aria-hidden="true"`.
- Pencarian hanya cocokkan label+desc — kata kunci alternatif (mis. "SRS" → Kartu Kosakata, "pinyin" → Mengetik) tak ketemu.
- `LockedCard` mengandalkan `title` untuk tooltip (tak muncul di sentuh), tapi teks hint sudah tampil di kartu — jadi bukan dead-end.

### AUD-01 · Kartu Kosakata — 2026-07-27 445ef06
Diaudit: `pages/Flashcards.tsx` (656), `components/flashcard/FlashcardContainer.tsx`.

**Bersih:** A (49 pemakaian `t()`, tak ada teks JSX hardcoded — hanya 2 `aria-label` yang lolos, lihat bawah) · B (tak ada placeholder palsu) · C (skeleton loading lengkap; empty state punya jalan keluar) · F (varian dark lengkap, grid responsif) · G (bentuk `response.reviews[].word` & `response.words` cocok dengan pemakaian) · H (token desain konsisten).

**Diperbaiki (P1):**
- *Error jaringan menyamar jadi "Tidak Ada Kata"* — `catch` hanya toast (transien) lalu `words.length === 0` menjatuhkan user ke layar "Tidak Ada Kata" yang menyarankan ganti mode/level. Penjelasan salah + tak ada tombol coba lagi. Sekarang ada state `loadError` dengan layar sendiri + tombol Coba Lagi.
- *2 `aria-label` hardcoded Inggris* ("Back to settings", "Shuffle cards") di app dwibahasa → `t()`.

**Dicatat (P2, belum dikerjakan):**
- Kartu flip adalah `<div onClick>` tanpa `role="button"`/`tabIndex`/`aria-pressed`. Keyboard tetap jalan lewat handler global (Space/Enter), tapi semantik screen-reader lemah. Menambah `tabIndex` perlu hati-hati agar tak dobel-picu dengan handler global.
- `data.sort(() => Math.random() - 0.5)` (2 tempat) — shuffle bias; idealnya Fisher–Yates.
- `<kbd>Space</kbd>` di petunjuk keyboard tak dilokalkan.

### AUD-02 · Menulis — 2026-07-27 b5faf8d
Diaudit: `pages/Writing.tsx` (350), `pages/writing/WritingSession.tsx` (338), `components/writing/WritingCanvas.tsx` (489).

**Bersih:** `Writing.tsx` (18× `t()`, penanganan error per-status sudah ada) · `WritingSession.tsx` (murni orkestrasi, **tak ada** string user-facing — jadi 0 `useTranslation` di sini wajar, bukan temuan) · F (varian dark lengkap di canvas) · G (tipe `HanziWord`/`AttemptResult` cocok).

**Diperbaiki (P1):**
- *`WritingCanvas.tsx` sama sekali tanpa i18n* — 11 blok teks hardcoded di komponen yang dipakai **dua fitur** (Menulis + Tantangan Cerita). Termasuk baris Tips yang **campur bahasa**: `<strong>Tip:</strong> Tulis setiap goresan… Toggle hints…` → user Inggris melihat kalimat Indonesia, user Indonesia melihat "Tip:"/"hints". Semua ke namespace `writingCanvas`.
- Hitungan kesalahan memakai pluralisasi Inggris manual (`mistake{s}`) → plural i18next (`mistakes_one`/`_other`).
- Tombol reveal karakter hanya punya `title` hardcoded → `title` + `aria-label` ter-i18n.

**Dicatat (P2, belum dikerjakan):**
- Ambang umpan balik (80/60) tertanam di dua tempat (`WritingCanvas` untuk teks, `StoryChallenge` pakai `accuracy >= 60` untuk membuka kata) — tak sinkron secara eksplisit.
- Kelas `xs:inline` dipakai untuk menyembunyikan kata "Sembunyikan/Tampilkan"; perlu dicek breakpoint `xs` memang terdefinisi di `tailwind.config.js`.

### AUD-03 · Mengetik — 2026-07-27 094bff7
Diaudit: `pages/Typing.tsx` (186), `pages/typing/TypingModeSelection.tsx` (314), `components/typing/{PinyinTypingMode,IMEPracticeMode,SpeedTypingMode}.tsx` (248+290+291).

**Bersih:** `Typing.tsx` & `TypingModeSelection.tsx` (i18n dipakai, skeleton loading ada, 401 ditangani dengan fallback stats nol) · F · G · H.

**Diperbaiki (P1):**
- *Ketiga komponen mode ketik tanpa i18n* (829 baris) — judul mode, tombol, placeholder input, toast benar/salah, layar "Session Complete" (Average/Best WPM, Accuracy), label "You typed/Correct pinyin", teks progres akurasi. Semua ke namespace `typingModes`.
- *Error jaringan mendarat di layar latihan kosong* — `handleModeSelect` mengembalikan ke pemilihan mode untuk 401 tapi **tidak** untuk error lain, sehingga user melihat layar bertuliskan "tidak ada kata untuk level HSK ini" padahal masalahnya jaringan (pola sama seperti AUD-01). Kini kedua jalur konsisten.

**Dicatat (P2, belum dikerjakan):**
- Guard `if (!currentWord)` di 3 komponen memakai pesan "tidak ada kata" yang sama — masih generik bila penyebabnya bukan level kosong.
- `TypingModeSelection` menerima `onNavigate={navigate}` sebagai prop alih-alih memakai `useNavigate` sendiri — pola tak biasa, tapi tak merugikan user.

### AUD-04 · Berbicara — 2026-07-28 501a183
Diaudit: `pages/SpeakingPractice.tsx` (716) + `backend/app/routers/stt.py` (untuk verifikasi format audio).

**Bersih:** A (i18n menyeluruh — 48 key `speaking.*`; hanya `<kbd>Space</kbd>` yang tak dilokalkan, sama seperti Flashcards) · C (skeleton via `SessionSkeleton`, `loadFailed`/`sttFailed` ditangani) · F · G · H.

**Diperbaiki (P1):**
- *Semua kegagalan mikrofon dilaporkan sebagai "izin ditolak"* — `startRecording` memakai `catch {}` tanpa membedakan penyebab. Kini: `NotAllowedError`/`SecurityError` → ditolak · `NotFoundError` → mikrofon tak ada · `NotReadableError` → dipakai aplikasi lain · sisanya → gagal umum. Saran "izinkan mikrofon" tak menolong kalau perangkatnya memang tak ada.
- *Browser tanpa dukungan WebM/Opus terjebak loop tanpa penjelasan* — backend STT dikonfigurasi khusus `WEBM_OPUS` 48kHz, jadi di Safari/iOS perekaman **tak akan pernah berhasil**; sebelumnya user cuma melihat "izin mikrofon ditolak" dan akan terus memberi izin sia-sia. Kini dicek `MediaRecorder.isTypeSupported` lebih dulu dengan pesan yang benar. **Sengaja tidak** menambah fallback `audio/mp4` — server tak bisa mendekodenya, itu hanya akan menukar kegagalan jelas dengan hasil transkrip salah.

**Dicatat (P2, belum dikerjakan):**
- `response.feedback` dari backend ditoast apa adanya — teks itu dihasilkan server dan kemungkinan hanya Inggris, jadi lolos dari i18n frontend. Perlu dicek di `stt.py`.
- Ketidakcocokan codec hanya muncul sebagai toast transien; idealnya banner permanen di layar rekam untuk browser yang tak didukung.
- `<kbd>Space</kbd>` tak dilokalkan (sama seperti AUD-01).

### AUD-05 · Dikte — 2026-07-28 7086308
Diaudit: `pages/Dictation.tsx` (510).

**Bersih:** A (tak ada literal user-facing tersisa; `dictation.*` lengkap di id+en) · B · C (`noStories` vs `loadFailed` sudah dibedakan — lebih baik dari Flashcards sebelum AUD-01) · E · F · G · H.

**Diperbaiki (P1):**
- *Kegagalan audio ditelan diam-diam* — `playAudio` punya `catch {}` kosong dan `audio.onerror` yang hanya mereset `isPlaying`. Di latihan dikte **audio itu soalnya**: user menekan putar, tak terjadi apa-apa, tanpa pesan, lalu tetap diminta mengetik apa yang "didengar". Kedua jalur kini memunculkan toast `audioFailed`.

**Dicatat (P2, belum dikerjakan):**
- Petunjuk terjemahan Inggris (`english_hint`) tersedia sebagai jalan keluar sebagian, tapi tak ditawarkan saat audio gagal — idealnya saat gagal berulang, tawarkan lihat teksnya.
- Tak ada tombol "ulangi audio lambat" — hanya satu kecepatan tetap (0.75).

## Log
<!-- `- YYYY-MM-DD AUD-xx <hash> ringkas` -->
- 2026-07-27 AUD-00 0c05474 Pustaka: hilangkan kedip terbuka→terkunci (PendingCard), aria-label pencarian; i18n & tipe bersih. Build hijau
- 2026-07-27 AUD-01 445ef06 Flashcards: layar error jaringan + Coba Lagi (dulu menyamar jadi "Tidak Ada Kata"), i18n 2 aria-label. Build hijau
- 2026-07-27 AUD-02 b5faf8d WritingCanvas: 11 blok teks ke i18n (dulu tanpa terjemahan & satu baris campur bahasa), plural kesalahan, aria-label reveal. Kena 2 fitur. Build hijau
- 2026-07-27 AUD-03 094bff7 Mengetik: i18n 3 komponen mode (829 baris, dulu 0 terjemahan) + error jaringan tak lagi mendarat di layar "tidak ada kata". Build hijau
- 2026-07-28 AUD-04 501a183 Berbicara: pesan gagal mikrofon dibedakan per penyebab + deteksi browser tanpa WebM/Opus (Safari/iOS tak akan pernah bisa merekam, dulu disamarkan jadi "izin ditolak"). Build hijau
- 2026-07-28 AUD-05 7086308 Dikte: kegagalan TTS kini diberitahukan (dulu catch kosong — user menekan putar, hening, tetap disuruh menulis). Build hijau
