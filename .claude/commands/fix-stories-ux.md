---
description: Kerjakan satu task berikutnya dari goal Perbaikan UX Stories (di-loop sampai kelar)
---

Kamu mengeksekusi **satu iterasi** perbaikan UX fitur Stories. Sumber kebenaran: `.claude/goals/stories-ux.md`.

## Protokol (satu task per invokasi)

1. **Baca** `.claude/goals/stories-ux.md`. Cari task **pertama** yang masih `[ ]` (urut dari atas: P0 → P1 → P2).
   - Jika **tidak ada** `[ ]` tersisa → laporkan "✅ Semua task Stories UX kelar" dan **berhenti** (jangan cari kerjaan lain).
2. **Kerjakan task itu sampai tuntas** sesuai kriteria "Selesai bila". Hanya SATU task per invokasi — jangan gabung beberapa.
3. **Patuhi konvensi proyek** (root + frontend CLAUDE.md):
   - Teks user-facing lewat `t('...')`; tambah key di **`frontend/src/i18n/locales/id.json` DAN `en.json`** (dua-duanya, struktur sama).
   - TypeScript strict tanpa `any`; path alias `@/`; styling token Tailwind (`primary-*`, `success-*`, `error-*`, `surface-card`); animasi Framer Motion.
   - Jangan buat ulang route `/practice`.
4. **Verifikasi:** jalankan `cd frontend && npm run build`. Harus lolos. Jika gagal → perbaiki sampai hijau sebelum lanjut.
   - Untuk task yang butuh backend (mis. SUX-10): tambah endpoint di router terkait, `alembic revision --autogenerate` + `upgrade head` bila model berubah, lalu kabari kalau perlu deploy Koyeb.
5. **Review diff → commit → push** per concern (user setuju commit+push tiap iterasi, syarat: review diff dulu). Body list perubahan per file.
   - **Sintaks commit (WAJIB):** lewat tool Bash pakai heredoc, JANGAN `@'...'@` (itu here-string PowerShell; di Bash karakter `@` bocor jadi subject `@ ...`). Contoh benar:
     ```bash
     git commit -F - <<'EOF'
     feat(stories): i18n StoryReader (SUX-01)

     - frontend/src/pages/StoryReader.tsx: semua string ke t(), namespace storyReader.*
     - frontend/src/i18n/locales/id.json: tambah blok storyReader
     - frontend/src/i18n/locales/en.json: tambah blok storyReader

     Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
     EOF
     ```
     (Kalau pakai tool PowerShell, `@'...'@` baru benar.)
6. **Tandai selesai** di `.claude/goals/stories-ux.md`: ubah `[ ]` task itu jadi `[x]`, dan tambah baris di bagian `## Log`:
   `- <YYYY-MM-DD> SUX-xx <hash pendek> <ringkas>`
7. **Laporkan** singkat: task apa yang selesai, hasil build, dan task berikutnya yang tersisa.

## Catatan
- Kalau sebuah task ternyata perlu dipecah, kerjakan bagian pertama yang utuh & buildable, dan tulis sisanya sebagai sub-`[ ]` baru di goal doc.
- Jangan sentuh file di luar ruang lingkup Stories kecuali memang syarat task (mis. `@/types`, `services/api.ts`, router backend).
- Verifikasi visual opsional lewat preview dev server bila perubahan terlihat di UI.
