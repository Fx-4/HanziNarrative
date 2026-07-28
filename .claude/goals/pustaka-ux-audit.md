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
- [x] **AUD-06 · Kuis** — `/quiz` · `Quiz.tsx` (657) — **bersih, tanpa P0/P1**
- [x] **AUD-07 · Nada** — `/tones` · `ToneTrainer.tsx` (301)
- [x] **AUD-08 · Tes Simulasi** — `/mock-test` · `MockTest.tsx` (1060) — file terbesar, kandidat split per `feedback_split_large_files`
- [x] **AUD-09 · Kosakata** — `/vocabulary` · `Vocabulary.tsx` (521)
- [x] **AUD-10 · Isi Cerita** — `/explorer` · `SentenceScramble.tsx` (327) — **bagian Latihan tuntas**
  - **Sudah ditemukan sebelum audit:** satu fitur, **empat identitas** — route `/explorer`, LazyPage `name="HanziExplorer"`, komponen `SentenceScramble`, katalog key `storyBlanks` (label "Isi Cerita"). Membingungkan saat debug & lazy-chunk salah nama. Rapikan jadi konsisten.

## Bagian 3 — Main (PLAY_ITEMS)

- [x] **AUD-11 · Tantangan Harian** — `/daily-challenge` · `DailyChallenge.tsx` (333)
- [x] **AUD-12 · Chat AI** — `/conversation` · `Conversation.tsx` (483)
- [x] **AUD-13 · Cocokkan** — `/matching` · `MatchingGame.tsx` (272)
- [x] **AUD-14 · Susun Kalimat** — `/sentence-builder` · `SentenceBuilder.tsx` (515)
- [x] **AUD-15 · Petualangan** — `/adventure` · `Adventure.tsx` (547) · unlock 20 kata
- [x] **AUD-16 · Tantangan Cerita** — `/story-challenge` · `StoryChallenge.tsx` (602) · unlock 30 kata
  - Catatan: sudah tersentuh di SUX-03 (i18n) & SUX-08 (tipe). Audit sisanya (a11y, state, mobile).
- [x] **AUD-17 · Duel** — `/battle` · `Battle.tsx` (894) · unlock 50 kata — realtime, cek state koneksi terputus
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

### AUD-06 · Kuis — 2026-07-28 (tanpa perubahan kode)
Diaudit: `pages/Quiz.tsx` (657) + `backend/app/routers/quiz.py` (verifikasi bentuk data).

**Fitur pertama yang lolos delapan dimensi tanpa temuan P0/P1.** Tidak ada perubahan kode — mengarang perbaikan di sini hanya akan menambah risiko tanpa manfaat.

**Bersih:** A (tak ada literal user-facing) · B (penilaian ketiga mode benar; `correct_answer:int` backend cocok dengan indeks opsi frontend) · C (`SessionSkeleton` saat memuat) · D (gagal generate menyisakan layar setup utuh sehingga bisa langsung diulang — bukan dead-end) · E (8 tombol semuanya bertekstualisasi, jadi tak butuh `aria-label`; ada handler Enter per-tahap yang **benar** menjaga `INPUT`/`TEXTAREA` agar tak submit saat mengetik) · F (varian dark lengkap; target sentuh eksplisit `min-h-[44px]`) · G · H.

**Hipotesis yang diperiksa dan ternyata SALAH** (dicatat supaya tak diaudit ulang):
- Diduga skor `character_match` selalu 0 karena penilaian membaca `answers` sementara pasangan disimpan di `matches` — ternyata `setAnswers` **ikut** dipanggil di kedua jalur pemasangan (baris 330 & 342). Bukan bug.
- Diduga `blank_word` bisa mengandung spasi dari AI sehingga jawaban benar dinilai salah — ternyata nilainya dari `word.simplified` (DB), bukan keluaran AI. Hanya nit teoretis.

**Dicatat (P2, belum dikerjakan):**
- State ganda: `matches` dan `answers` menyimpan data character-match yang sama dan selalu di-set berbarengan — salah satunya bisa diturunkan dari yang lain.
- `sort(() => Math.random() - 0.5)` untuk mengacak `rightItems` — shuffle bias (sama seperti Flashcards).
- Sisi harapan pada perbandingan fill-blank tak di-`trim()` walau sisi user di-`trim()`; aman untuk sekarang, tapi asimetris.

### AUD-07 · Nada — 2026-07-28 9a0168f
Diaudit: `pages/ToneTrainer.tsx` (301).

**Bersih:** A (tak ada literal user-facing) · B · C (`SessionSkeleton`; `notEnough`/`noWords`/`loadFailed` sudah dibedakan bertingkat — termasuk yang terbaik sejauh ini) · E (pintasan keyboard 1–4 dengan guard `INPUT`/`TEXTAREA`) · F · G · H.

**Diperbaiki (P1):**
- *Kegagalan audio ditelan diam-diam* — pola identik AUD-05. Di sini konsekuensinya sama beratnya: soal hanya menampilkan **karakter + arti Inggris**, sedangkan pinyin baru dibuka setelah menjawab (baris 293), jadi nada memang harus didengar. Saat TTS gagal tanpa pesan, user hanya bisa menebak buta di antara 4 nada dan tak tahu ada yang rusak. Kedua jalur (`catch` dan `onerror`) kini memunculkan toast.

**Dicatat (P2, belum dikerjakan):**
- Auto-lanjut ke soal berikutnya lewat `setTimeout(…, 1200)` — tak bisa dijeda; user yang ingin memandangi jawaban benar lebih lama tak punya kendali.
- Tak ada opsi kecepatan audio (tetap 0.75) padahal membedakan nada 2 vs 3 justru terbantu oleh pemutaran lebih lambat.

### AUD-08 · Tes Simulasi — 2026-07-28 c9a144b
Diaudit: `pages/MockTest.tsx` (1060 — file terbesar di Pustaka).

**Bersih:** C (skeleton + `notEnough`/`loadFailed` dibedakan; gagal muat menyisakan halaman setup sehingga bisa diulang) · D · F · G · H (setelah pembersihan di bawah).

**Diperbaiki (P1):**
- *Seluruh fitur tanpa i18n* — celah terbesar yang ditemukan sejauh ini: 1060 baris, **nol** `useTranslation`, ~35 string user-facing hardcoded Inggris. Artinya user Indonesia mengerjakan **seluruh simulasi ujian** dalam bahasa Inggris: struktur tes, pemberitahuan audio, LULUS/GAGAL, "Waktu habis", 6 badge jenis soal, sampai `aria-label` tombol putar. Semua ke namespace `mockTest`.
- *Data mati `labelEn` & `desc` di `SECTION_META`* — setelah label bersumber dari i18n, keduanya tak pernah dirender lagi. Dibuang supaya label bagian punya **sumber tunggal**; membiarkan dua sumber persis jebakan yang memicu bug SUX-08 dulu (orang menyunting satu, UI membaca yang lain).

**Dicatat (P2, belum dikerjakan):**
- *Timer berbasis `setInterval` + penghitung lokal, bukan wall-clock* (baris ~356). Saat tab dilatarbelakangkan, browser mencekik interval sehingga hitungan mundur melambat — user mendapat waktu lebih dari seharusnya. Untuk simulasi ujian idealnya berbasis tenggat (`Date.now() + durasi`).
- *Tak ada persistensi* — muat ulang halaman di tengah tes menghilangkan seluruh progres 25 soal. Untuk ujian bertimer ini menyakitkan, tapi menambah penyimpanan adalah fitur baru, bukan perbaikan bug.
- File 1060 baris; kandidat split per `feedback_split_large_files` (setup / sesi / hasil).

### AUD-09 · Kosakata — 2026-07-28 cae3960
Diaudit: `pages/Vocabulary.tsx` (521).

**Bersih:** A (tak ada literal user-facing; `vocabulary.*` lengkap) · B · E · F · G · H. Skeleton-nya termasuk yang paling rapi — ada varian terpisah untuk tampilan grid dan daftar (`VocabGridSkeleton`/`VocabListRowSkeleton`).

**Diperbaiki (P1):**
- *Gagal jaringan mengklaim level HSK kosong* — varian paling menyesatkan dari pola yang berulang di audit ini. `loadVocabulary`/`handleSearch` hanya nge-log lalu user mendarat di empty state yang menyatakan dengan yakin **"Tidak ada kosakata di HSK Level X"**. Klaim itu selalu salah — level HSK memang selalu berisi kata. Tak ada tombol coba lagi; satu-satunya tombol adalah "hapus filter" yang tak menolong. Kini `loadError` punya layar sendiri + Coba Lagi yang memanggil ulang jalur yang tepat (pencarian vs daftar level).

**Dicatat (P2, belum dikerjakan):**
- `loadCategories` masih menelan error diam-diam — dampaknya kecil (daftar filter kosong), tapi pola yang sama.
- Saat gagal, kata yang sudah tampil sengaja dikosongkan (`setWords([])`) agar tak menampilkan data basi berdampingan dengan pesan error; alternatifnya menahan data lama + banner, tapi itu keputusan produk.

### AUD-10 · Isi Cerita — 2026-07-28 2933708
Diaudit: `pages/SentenceScramble.tsx` (327), `App.tsx` (baris route).

**Bersih:** C (`SessionSkeleton`; `noStories`/`notEnough`/`loadFailed` sudah dibedakan bertingkat) · E · F · G · H.

**Diperbaiki (P1):**
- *Halaman tanpa i18n* — 17 string hardcoded Inggris → namespace `storyBlanks`.
- *Judul halaman ≠ nama yang diklik user* — **identitas kelima** yang tak terlihat saat menyusun goal ini: H1 berbunyi "Fill in the Blank" sementara kartu di Pustaka berlabel "Isi Cerita". User mengklik satu nama dan mendarat di nama lain, dalam bahasa berbeda pula. Judul kini bersumber dari `storyBlanks.title` yang sama dengan label katalog.
- *Nama LazyPage salah* — `name="HanziExplorer"` padahal komponen bernama itu **tidak pernah ada**; chunk lazy & label debug jadi menyesatkan. Diubah ke `SentenceScramble` (chunk build kini `SentenceScramble-*`). Nol risiko: nama ini tak user-facing.

**Dicatat (P2, belum dikerjakan):**
- Route tetap `/explorer` — sengaja **tidak** diubah agar tautan/bookmark lama tak putus. Kalau mau dirapikan, perlu redirect dari `/explorer` ke nama baru, bukan penggantian langsung.
- Nama file/komponen `SentenceScramble` masih berbeda dari label produk "Isi Cerita" dan key katalog `storyBlanks`. Menyatukannya adalah refactor lintas file; kini tinggal 3 nama (route, komponen, key) dari sebelumnya 5.

### AUD-11 · Tantangan Harian — 2026-07-28 3fb1620
Diaudit: `pages/DailyChallenge.tsx` (333).

**Bersih:** C (skeleton rinci meniru bentuk layar; `loadFailed` punya layar sendiri) · D (tombol selesai punya state menyimpan + state "sudah selesai") · E · F · G · H.

**Diperbaiki (P1):**
- *Teks campur dua bahasa dalam satu layar* — kebalikan sekaligus pelengkap temuan AUD-02. Di sini bukan "semua Inggris", melainkan **campur dua arah**: Indonesia ("Tandai Selesai", "Menyimpan…", "Gagal memuat daily challenge.") berdampingan dengan Inggris ("Daily Challenge", "Day Streak", "Completed"), ditambah satu toast yang mencampur keduanya dalam satu kalimat ("+30 XP! Daily challenge selesai"). Akibatnya **tak ada satu pun bahasa yang utuh** — user Indonesia maupun Inggris sama-sama melihat teks asing. 14 string → namespace `dailyChallenge`.
- *Judul tanggal dipaku ke `en-US`* — `toLocaleDateString('en-US', …)` membuat H1 halaman (mis. "Tuesday, July 28") selalu Inggris walau UI berbahasa Indonesia. Kini mengikuti `i18n.language` memakai pola yang sudah ada di `App.tsx`.

**Dicatat (P2, belum dikerjakan):**
- `toLocaleDateString('en-US')` yang dipaku adalah **pola se-codebase**, bukan khusus fitur ini — ada 4 pemakaian eksplisit `'en-US'` plus 8 pemakaian tanpa argumen locale di `pages/`+`components/`. Yang berada di dalam lingkup Pustaka akan tertangkap di AUD berikutnya; sisanya (Dashboard, Profile, dll) di luar lingkup goal ini dan layak jadi task tersendiri.

### AUD-12 · Chat AI — 2026-07-28 cc66931
Diaudit: `pages/Conversation.tsx` (483).

**Bersih:** C (`TileGridSkeleton`; toast error di semua jalur) · F · G · H. **Penanganan stream-nya termasuk yang terbaik di Pustaka**: `AbortController` membatalkan permintaan sebelumnya, `AbortError` sengaja diabaikan agar pembatalan tak dilaporkan sebagai kegagalan, dan placeholder streaming dibersihkan saat error.

**Diperbaiki (P1):**
- *Halaman tanpa i18n* — 14 string → namespace `conversation`.
- *Teks hilang saat balasan gagal* — input dikosongkan sebelum request (`setInput('')`), jadi ketika balasan gagal user melihat pesannya menggantung tanpa jawaban dan **harus mengetik ulang seluruh kalimat** hanya untuk mencoba lagi. Kini pesan user yang tak terjawab dibuang bersama placeholder dan teksnya dikembalikan ke input — cukup tekan kirim lagi.
- *3 tombol ikon hanya punya `title`* (pinyin, terjemahan, percakapan baru) → ditambah `aria-label`.

**Dicatat (P2, belum dikerjakan):**
- Riwayat percakapan hilang saat berpindah halaman/muat ulang — tak ada persistensi (pola sama seperti MockTest).
- Tombol suara per-pesan (`speakText`) tak punya penanganan gagal; kalau TTS mati, tak ada umpan balik (pola sama seperti AUD-05/07, tapi di sini audio bukan soal jadi dampaknya kecil).

### AUD-13 · Cocokkan — 2026-07-28 0d2b6a3
Diaudit: `pages/MatchingGame.tsx` (272). Berujung ke `pages/MockTest.tsx` (lihat bawah).

**Bersih:** A (i18n lengkap, 13 key `matchingGame.*`) · B · C (skeleton meniru grid kartu) · D · E · F · G.

**Diperbaiki (P1) — shuffle bias, dan ternyata sistemik:**
Pola `arr.sort(() => Math.random() - 0.5)` dipakai **24 kali di 10+ file**. Itu bukan pengacakan adil: komparatornya tak konsisten, dan V8 memakai binary insertion sort untuk array kecil sehingga hasil condong ke urutan semula. Sebelumnya sudah dicatat sebagai P2 di AUD-01 & AUD-06; di sini diukur (200k–300k percobaan) dan ternyata berdampak nyata:

| Konteks | Shuffle lama | Adil |
|---|---|---|
| Opsi jawaban 4 pilihan (benar mulai di indeks 0) | A **36%** · B 17% · C 16% · D **31%** | ~25% merata |
| 12 kartu memori (pasangan awalnya bersebelahan) | 1.22 pasangan tetap berdampingan | 1.00 |

- *`MatchingGame`* — kartu dibuat berpasangan bersebelahan lalu diacak, jadi 22% lebih sering pasangan tertinggal berdampingan → permainan memori lebih mudah dari seharusnya.
- *`MockTest` (revisit AUD-08)* — **keenam** generator soal menyusun opsi sebagai `[correct, ...wrongs]` lalu mengacak, sehingga jawaban benar condong ke posisi A/D. Menebak "A" memberi 36% alih-alih 25% — keuntungan yang bisa dipelajari di fitur yang justru bertujuan mensimulasikan ujian. Diperbaiki sekalian karena dampaknya paling besar di sana, meski ditemukan saat mengaudit fitur lain.
- Dibuat `utils/shuffle.ts` (Fisher–Yates + `sample()`), angka bias terukur didokumentasikan di komentarnya.

**Catatan proses:** regex penggantian sempat menghapus `.sort(...)` di dua tempat MockTest tanpa membungkusnya ke `shuffle()` — pemilihan kata soal & distraktor jadi **tak teracak sama sekali**. Ketahuan saat meninjau diff sebelum commit dan langsung diperbaiki; tak ada yang ter-commit dalam kondisi itu.

**Dicatat (P2, belum dikerjakan):**
- Masih ada ~16 pemakaian `sort(() => Math.random() - 0.5)` di file **di luar** lingkup Pustaka (`Review.tsx`, `ReviewExercise.tsx`, `LearningSession.tsx`, `Battle.tsx` — Battle akan kena di AUD-17). Yang paling perlu dilihat: `Review.tsx` memakainya untuk memilih distraktor. Layak jadi task tersendiri memakai `utils/shuffle.ts` yang kini tersedia.
- `Flashcards.tsx` & `Quiz.tsx` (P2 dari AUD-01/06) kini bisa mengadopsi util yang sama.

### AUD-14 · Susun Kalimat — 2026-07-28 42d81f5
Diaudit: `pages/SentenceBuilder.tsx` (515).

**Bersih:** A (i18n lengkap) · B · F · G · H. Penanganan error pada **validasi kalimat** justru teladan — dibedakan per status (401/403 auth, 429 rate limit, lainnya) dengan pesan masing-masing.

**Diperbaiki (P1):**
- *Bank kata kosong senyap* — bentuk paling disengaja dari pola yang berulang di audit ini: `toast.error` di `fetchVocabulary` **dikomentari** dengan catatan "hanya tampilkan untuk refresh manual, bukan saat mount" — niat yang tak pernah diimplementasikan, jadi efeknya membungkam semua kegagalan. Karena skeleton bersyarat `wordsLoading && …` dan `wordsLoading` sudah `false` di `finally`, user melihat judul "Bank Kata 词库" dengan **area kosong melompong**: tanpa kata, tanpa skeleton, tanpa pesan, tanpa jalan keluar. Kini ada `wordsError` + pesan + tombol Coba Lagi.
- *Shuffle bias varian lain* — `sort(() => 0.5 - Math.random())`. Penulisannya terbalik dari yang disapu di AUD-13 sehingga **luput dari grep saya**; dampaknya sama: sebagian kata jauh lebih sering terpilih untuk latihan. Kini `sample()` Fisher–Yates.

**Koreksi angka AUD-13:** laporan "24 pemakaian" itu hitungan **sebelum** perbaikan dan hanya mencakup satu varian penulisan. Kondisi terkini: **18 tersisa** di seluruh codebase, 3 di antaranya varian `0.5 - Math.random()`.

**Dicatat (P2, belum dikerjakan):**
- `components/onboarding/AdaptiveAssessment.tsx` memakai varian bias yang sama. Itu **asesmen penempatan level HSK**, jadi bias di sana bisa memengaruhi level awal user — di luar lingkup Pustaka, tapi layak diprioritaskan tersendiri.
- `loadUsageStats` mengeset `{}` saat gagal agar tak "Loading…" selamanya — jujur, tapi batas kuota AI lalu tampil seolah belum terpakai.

### AUD-15 · Petualangan — 2026-07-28 6ab6c0e
Diaudit: `pages/Adventure.tsx` (547).

**Bersih:** B · C (`SessionSkeleton` + skeleton streaming terpisah) · F · G · H. Penanganan stream setara `Conversation`: `AbortController` + `AbortError` diabaikan, dan **batas kuota 429 dibedakan** dari kegagalan umum.

**Diperbaiki (P1):**
- *Halaman tanpa i18n* — 16 string → namespace `adventure`, termasuk panel kuota harian dan tombol yang berubah jadi "Kuota habis — coba lagi besok".
- *Audio narasi gagal senyap* — pola AUD-05/07 lagi (`catch` kosong + `onerror` hanya mereset flag). Di sini dampaknya lebih ringan karena teks cerita tetap terbaca, tapi tombol yang tak bereaksi tanpa penjelasan tetap membingungkan.

**Catatan proses:** pesan batas kuota muncul **dua kali** di file (jalur mulai & jalur lanjut), tapi skrip penggantian saya memakai `replace(..., 1)` sehingga hanya yang pertama tergantikan. Ketahuan dari sapuan verifikasi setelah commit; diperbaiki lalu commit di-*amend* sebelum push, jadi tak ada commit setengah jadi yang terkirim.

**Dicatat (P2, belum dikerjakan):**
- `loadUsageStats` menelan error diam-diam ("Ignore — will show default"), jadi saat gagal panel kuota bisa tampil seolah masih penuh. Pola sama seperti `SentenceBuilder`.

### AUD-16 · Tantangan Cerita — 2026-07-28 40486fe
Diaudit: `pages/StoryChallenge.tsx` (602). i18n & tipe sudah dibereskan di SUX-03/SUX-08, jadi fokus ke dimensi sisanya.

**Bersih:** A (terverifikasi masih bersih pasca SUX-03) · B · F · G (tipe global `Story` dari SUX-08 masih konsisten) · H.

**Diperbaiki (P1):**
- *Gagal muat daftar cerita menyuruh user membuat cerita* — `catch` sengaja membungkam toast ("Suppress toast for background initial load failure"), sehingga kegagalan jaringan mendarat di empty state **"Belum ada cerita untuk HSK X. Buat cerita dulu!"**. Persis pola AUD-09: saran yang keliru dan tak bisa ditindaklanjuti. Kini `listError` punya pesan sendiri + tombol Coba Lagi.
- *Shuffle bias menentukan kata yang disembunyikan* — kata tertentu jauh lebih sering terpilih, jadi latihan mengulang kata yang itu-itu saja. Kini `shuffle()` Fisher–Yates.
- *Modal menulis tak bisa ditutup dengan keyboard* — hanya klik backdrop. Ditambah handler Escape (pola sama seperti `StoryReader`), dan tombol tutup ikon-saja dapat `aria-label` (file ini sebelumnya punya **nol** `aria-label`).
- *Kegagalan TTS senyap* — pola AUD-05/07/15, kini bertoast.

**Dicatat (P2, belum dikerjakan):**
- `selectStory` punya `catch` bersarang yang mengabaikan kegagalan `getStoryWords` lalu diam-diam jatuh ke ekstraksi 2-karakter dari konten. Hasilnya kata "kosakata" tanpa pinyin/arti — latihan tetap jalan tapi petunjuknya kosong, tanpa penjelasan kenapa.

### AUD-17 · Duel — 2026-07-28 b18f5f5
Diaudit: `pages/Battle.tsx` (894), `hooks/useBattleWebSocket.ts`.

**Bersih — dan ini yang terbaik di Pustaka untuk dimensi D:** penanganan koneksi terputus **tidak diubah sama sekali** karena memang sudah benar. Hook punya 5 state (`idle`/`connecting`/`connected`/`reconnecting`/`failed`) dengan logika retry, `onclose` membedakan "akan mencoba lagi" dari "menyerah", dan UI menampilkan titik status berwarna + label. Bandingkan dengan mayoritas fitur lain yang justru menelan kegagalan diam-diam. · B · C · F · G.

**Diperbaiki (P1):**
- *Seluruh fitur tanpa i18n* — 894 baris, **nol** `useTranslation`. ~49 string UI + 16 efek (nama & deskripsi) → namespace `battle`. Mencakup lobi, pengaturan permainan, panel item, 6 label pertanyaan, layar reveal & skor akhir, tombol vote tanding ulang, sampai indikator koneksi.
- *`EFFECT_META` menyimpan nama & deskripsi yang kini juga ada di i18n* — dirampingkan jadi hanya `emoji`, sehingga 16 buff/debuff punya **sumber tunggal**. Sama seperti pembersihan `SECTION_META` di AUD-08; membiarkan dua sumber untuk teks yang sama adalah jebakan yang sudah terbukti di SUX-08.

**Dicatat (P2, belum dikerjakan):**
- `Battle.tsx` masih memakai `sort(() => Math.random() - 0.5)` untuk mengacak opsi jawaban (baris ~492, di dalam pemetaan `origIdx`). Berbeda dari MockTest, di sini indeks aslinya dilacak sehingga penilaian tetap benar — tapi **sebaran posisi jawaban benar tetap bias** seperti yang diukur di AUD-13. Perlu `shuffle()` dari `utils/shuffle.ts`; tidak dikerjakan di iterasi ini karena menyentuh alur skoring realtime yang butuh pengujian dua pemain.
- File 894 baris dengan 14 komponen dalam satu berkas — kandidat split per `feedback_split_large_files`.

## Log
<!-- `- YYYY-MM-DD AUD-xx <hash> ringkas` -->
- 2026-07-27 AUD-00 0c05474 Pustaka: hilangkan kedip terbuka→terkunci (PendingCard), aria-label pencarian; i18n & tipe bersih. Build hijau
- 2026-07-27 AUD-01 445ef06 Flashcards: layar error jaringan + Coba Lagi (dulu menyamar jadi "Tidak Ada Kata"), i18n 2 aria-label. Build hijau
- 2026-07-27 AUD-02 b5faf8d WritingCanvas: 11 blok teks ke i18n (dulu tanpa terjemahan & satu baris campur bahasa), plural kesalahan, aria-label reveal. Kena 2 fitur. Build hijau
- 2026-07-27 AUD-03 094bff7 Mengetik: i18n 3 komponen mode (829 baris, dulu 0 terjemahan) + error jaringan tak lagi mendarat di layar "tidak ada kata". Build hijau
- 2026-07-28 AUD-04 501a183 Berbicara: pesan gagal mikrofon dibedakan per penyebab + deteksi browser tanpa WebM/Opus (Safari/iOS tak akan pernah bisa merekam, dulu disamarkan jadi "izin ditolak"). Build hijau
- 2026-07-28 AUD-05 7086308 Dikte: kegagalan TTS kini diberitahukan (dulu catch kosong — user menekan putar, hening, tetap disuruh menulis). Build hijau
- 2026-07-28 AUD-06 (tanpa perubahan kode) Kuis: lolos 8 dimensi tanpa P0/P1; 2 dugaan bug diverifikasi dan ternyata salah; 3 catatan P2
- 2026-07-28 AUD-07 9a0168f Nada: kegagalan TTS kini diberitahukan (pinyin baru dibuka setelah menjawab, jadi audio gagal = menebak buta 4 nada). Build hijau
- 2026-07-28 AUD-08 c9a144b Tes Simulasi: i18n ~35 string (1060 baris, dulu 0 terjemahan — ujian penuh berbahasa Inggris) + buang data mati labelEn/desc. Build hijau
- 2026-07-28 AUD-09 cae3960 Kosakata: layar error + Coba Lagi (dulu gagal jaringan mengklaim "Tidak ada kosakata di HSK Level X"). Build hijau
- 2026-07-28 AUD-10 2933708 Isi Cerita: i18n 17 string, judul H1 disamakan dengan label katalog (dulu "Fill in the Blank" vs kartu "Isi Cerita"), nama LazyPage diperbaiki. **Bagian Latihan tuntas 11/11**
- 2026-07-28 AUD-11 3fb1620 Tantangan Harian: i18n 14 string (dulu campur ID+EN dalam satu layar) + tanggal ikut bahasa UI (dulu dipaku en-US). Build hijau
- 2026-07-28 AUD-12 cc66931 Chat AI: i18n 14 string, aria-label 3 tombol ikon, teks dipulihkan saat balasan gagal (dulu harus mengetik ulang). Build hijau
- 2026-07-28 AUD-13 0d2b6a3 Cocokkan: shuffle bias -> Fisher-Yates (utils/shuffle.ts). Terukur: jawaban benar MockTest condong ke A 36%/D 31%; kartu memori 22% lebih sering berpasangan. Ikut memperbaiki MockTest (revisit AUD-08). Build hijau
- 2026-07-28 AUD-14 42d81f5 Susun Kalimat: bank kata kosong senyap -> pesan + Coba Lagi (toast-nya dulu dikomentari); shuffle bias varian 0.5-Math.random() yang luput di AUD-13. Build hijau
- 2026-07-28 AUD-15 6ab6c0e Petualangan: i18n 16 string + audio gagal diberitahukan. Build hijau
- 2026-07-28 AUD-16 40486fe Tantangan Cerita: error daftar jujur + Coba Lagi (dulu menyuruh "buat cerita dulu"), shuffle adil, Escape + aria-label modal, TTS gagal bertoast. Build hijau
- 2026-07-28 AUD-17 b18f5f5 Duel: i18n ~49 string + 16 efek (894 baris, dulu 0 terjemahan), EFFECT_META jadi sumber tunggal. Penanganan koneksi terputus sudah benar, tak diubah. Build hijau
