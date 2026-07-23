# Kit User Testing HanziNarrative — Putaran "Kritik Jujur"

> Dijalankan pada **versi redesign** (navbar 4 pintu + Home "Hari Ini"), bukan versi lama.
> Target: 5 sesi × ±45 menit, moderasi langsung (tatap muka atau screen-share).

---

## 1. Tujuan

Menjawab tiga pertanyaan yang tidak bisa dijawab dari dalam tim:

1. Apakah user baru tahu **harus mulai dari mana** tanpa dipandu? (beban kognitif)
2. Apakah alur latihan terasa **responsif atau menunggu-nunggu**? (micro-interaction)
3. Kata sifat apa yang **user sendiri** pakai untuk mendeskripsikan aplikasi ini? (validasi "kaku/off")

Ini **bukan** demo produk. Moderator tidak menolong, tidak menjelaskan fitur, tidak membela desain.

---

## 2. Partisipan (5 orang)

| # | Profil | Kenapa |
|---|--------|--------|
| P1–P3 | Pemula Mandarin (0–6 bulan belajar, atau baru berniat) | Target user sebenarnya |
| P4–P5 | Pengguna aktif Duolingo / Anki / app belajar lain | Punya pembanding — sumber kritik paling tajam |

Syarat: belum pernah memakai HanziNarrative. Jangan rekrut teman dekat yang tahu kamu pembuatnya.

---

## 3. Framing pembuka (baca verbatim)

> "Terima kasih sudah mau bantu. Saya **diminta mengevaluasi** aplikasi belajar Mandarin ini — **pembuatnya tidak ada di sini**, jadi kamu bebas berkomentar sekasar apa pun; justru itu yang paling berguna. Tidak ada jawaban salah. Yang dites aplikasinya, bukan kamu. Sambil memakai, tolong **ucapkan apa yang kamu pikirkan** — apa yang kamu cari, apa yang membingungkan, apa yang kamu harapkan terjadi."

Aturan moderator selama sesi:

- Jangan menjawab "gimana caranya…" — balikkan: *"Menurutmu di mana itu?"*
- Jeda ≥5 detik itu data, bukan masalah. Catat, jangan selamatkan.
- Probe netral saja: *"Tadi kamu berharap apa yang terjadi?"*, *"Apa yang membuatmu klik itu?"*

---

## 4. Skenario

Setiap skenario ditutup dengan **SEQ**: *"Dari 1 (sangat sulit) sampai 7 (sangat mudah), tugas tadi seberapa mudah?"* + *"Kenapa angka itu?"*

### S1 — First run (beban kognitif)

> "Kamu ingin mulai belajar Mandarin dari nol dan punya 10 menit sekarang. Silakan mulai."

Partisipan register + onboarding sendiri. **Jangan dibantu.**

Catat:
- ⏱ **Time-to-first-learning-action** — dari landing sampai benar-benar mengerjakan materi (bukan sekadar membuka halaman). Target: <3 menit.
- 🔁 **Menu thrashing** — berapa kali buka menu/halaman lalu keluar tanpa memilih. ≥3 = bukti overload.
- Ke mana mereka pergi dari Home: kartu "Lanjutkan lesson"? Library? Nyasar?

### S2 — Return visit (menguji Home "Hari Ini")

Di sesi yang sama, setelah S1 selesai + jeda singkat:

> "Anggap ini besok. Kemarin kamu menyelesaikan satu lesson. Lanjutkan belajarmu."

(Moderator me-refresh app ke Home dulu.)

Catat:
- Menemukan jalur lanjut dalam **<10 detik**? Lewat kartu Continue atau muter dulu?
- Apakah kartu Review due terbaca sebagai "tugas hari ini" atau terlewat?

### S3 — Recall test (arsitektur informasi)

Setelah S2, minta partisipan eksplorasi bebas **2 menit**. Lalu minta menutup layar:

> "Tanpa melihat: sebutkan 3 hal yang bisa kamu lakukan di aplikasi ini."

Catat jawaban verbatim. Jawaban spesifik ("baca cerita lalu klik katanya") = IA jelas. Jawaban kabur ("banyak latihan-latihan gitu") = IA gagal — itu bukan salah memori partisipan.

### S4 — Core loop feel (micro-interaction)

> "Kerjakan sesi review ini sampai ±15 kartu."

(Butuh akun dengan kata due — siapkan akun seed sebelum sesi.)

Catat:
- Tap/klik saat jeda antar-kartu (tanda menunggu)?
- Ritme: makin cepat (masuk flow) atau konstan-lambat?
- Setelah selesai, tanya **terbuka**: *"Pace-nya gimana tadi?"* — JANGAN tanya "apakah terasa lambat" (leading).

### S5 — Anchor komparatif (khusus P4–P5, pemancing kritik terbaik)

> "Pakai Duolingo 5 menit… sekarang pakai aplikasi ini 5 menit… **Apa yang terasa berbeda?**"

Orang sulit mengkritik langsung tapi lancar membandingkan. Catat verbatim — di sinilah kata seperti "kaku", "ramai", "berat" muncul sendiri kalau memang valid. Follow-up: *"Kalau kamu cuma boleh pakai satu selama sebulan, pilih mana? Kenapa?"*

---

## 5. Sesi penutup (10 menit terakhir)

Urutannya sengaja: **negatif dulu.**

1. **Negatif-dulu:** *"Sebutkan 2 hal paling menyebalkan dari aplikasi tadi."* (baru setelah itu: 2 hal yang disukai)
2. **Feature auction:** *"Kalau developer harus **menghapus 5 fitur** supaya aplikasinya jadi lebih baik, kamu hapus yang mana?"* — paksa sampai dapat 5.
3. **Desirability cards:** tunjukkan 25 kata ini, minta pilih **5** yang paling menggambarkan aplikasi:

   > profesional · membingungkan · menyenangkan · **kaku** · ramai · cepat · lambat · modern · kuno · ramah · melelahkan · memotivasi · berlebihan · sederhana · rumit · membosankan · segar · berat · intuitif · canggung · rapi · berantakan · hidup · hambar · bikin-nagih

   (Memilih kartu negatif terasa aman secara sosial dibanding mengucapkannya. Minta alasan singkat per kartu.)
4. **UMUX-Lite** (skala 1–7): (a) *"Kemampuan aplikasi ini sesuai kebutuhan saya"*, (b) *"Aplikasi ini mudah digunakan"*.

---

## 6. Lembar observasi per partisipan

| Item | Nilai |
|------|-------|
| Profil (P1–P5) | |
| S1: time-to-first-action | ___ menit |
| S1: menu thrashing | ___ kali |
| S2: temukan jalur lanjut <10 dtk? | ya / tidak |
| S3: 3 hal (verbatim) | |
| S4: komentar pace (verbatim) | |
| S5: beda vs Duolingo (verbatim) | |
| SEQ S1 / S2 / S4 | ___ / ___ / ___ |
| 2 hal menyebalkan | |
| 5 fitur yang dihapus | |
| 5 kartu kata sifat + alasan | |
| UMUX-Lite (a) / (b) | ___ / ___ |

---

## 7. Sintesis setelah 5 sesi

1. Kumpulkan semua temuan jadi satu daftar; kelompokkan yang mirip (affinity).
2. Prioritaskan dengan **frekuensi × dampak**: dialami ≥3 partisipan DAN menghambat belajar = P0.
3. Bandingkan kartu kata sifat vs hipotesis: kalau "kaku/ramai/rumit" masih terpilih ≥2 partisipan setelah redesign → masalah belum selesai, gali verbatim alasannya.
4. Fitur yang masuk daftar hapus ≥3 partisipan = kandidat serius untuk progressive disclosure (disembunyikan dari user baru) — bukan langsung dihapus.
5. Baseline metrik untuk putaran berikutnya: median time-to-first-action, median SEQ, skor UMUX-Lite.
