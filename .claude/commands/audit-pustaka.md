---
description: Audit UX satu fitur berikutnya di tab Pustaka + perbaiki temuannya (di-loop sampai kelar)
---

Kamu mengeksekusi **satu iterasi** audit UX fitur tab Pustaka. Sumber kebenaran: `.claude/goals/pustaka-ux-audit.md`.

## Protokol (satu fitur per invokasi)

1. **Baca** `.claude/goals/pustaka-ux-audit.md` — rubrik 8 dimensi (A–H) + daftar fitur.
2. Ambil task **pertama** yang masih `[ ]` (urut: AUD-00 → AUD-18).
   - Kalau **tidak ada** `[ ]` tersisa → laporkan "✅ Audit Pustaka tuntas", ringkas temuan agregat, dan **berhenti**.
3. **AUDIT fitur itu** terhadap **kedelapan dimensi rubrik**:
   - Baca file halaman + komponen yang dipakainya.
   - Dimensi A (i18n): grep literal Inggris user-facing, cek key ada di `id.json` **dan** `en.json`.
   - Dimensi G (tipe & data): bandingkan field yang dibaca UI dengan `backend/app/schemas.py` — cari field yang tak pernah dikirim server.
   - Catat temuan, beri prioritas: **P0** (rusak/menyesatkan) · **P1** (jebakan UX nyata) · **P2** (peningkatan).
4. **PERBAIKI semua P0 + P1** di iterasi ini. **P2 cukup dicatat**, jangan dikerjakan.
   - Kalau P0/P1 ternyata terlalu besar untuk satu iterasi, kerjakan bagian pertama yang utuh & buildable, lalu tulis sisanya sebagai sub-`[ ]` baru di goal doc.
5. **Verifikasi:** `cd frontend && npm run build` harus lolos. Kalau gagal → perbaiki sampai hijau.
6. **Review diff → commit → push** per concern. Body commit list perubahan per file.
   - **Sintaks commit (WAJIB):** heredoc lewat tool Bash — `git commit -F - <<'EOF' ... EOF`.
     JANGAN `@'...'@` (sintaks PowerShell; di Bash `@` bocor jadi subject `@ ...`).
   - Verifikasi sekali dengan `git log -1 --format=%s` bahwa subject bersih.
7. **Catat hasil** di goal doc:
   - Ubah `[ ]` → `[x]` untuk task itu.
   - Tambah blok di bagian `## Temuan per fitur`:
     ```
     ### AUD-xx · <Nama> — <YYYY-MM-DD> <hash>
     **Diperbaiki:** <ringkas P0/P1 yang dibereskan>
     **Dicatat (P2):** <yang sengaja ditunda, atau "tidak ada">
     ```
   - Tambah baris di `## Log`.
8. **Laporkan** singkat ke user: fitur apa yang diaudit, temuan P0/P1 yang diperbaiki, P2 yang ditunda, hasil build, dan sisa task.

## Catatan
- Fokus temuan **nyata dan spesifik** — jangan mengarang masalah demi mengisi laporan. Kalau sebuah fitur ternyata sudah rapi, katakan apa adanya, centang, lanjut.
- Jangan sentuh file di luar fitur yang diaudit kecuali memang syaratnya (`@/types`, `services/api.ts`, locale, router backend).
- Jangan buat ulang route `/practice` (sudah dihapus).
- Verifikasi visual opsional lewat preview dev server bila perubahan terlihat di UI.
