/**
 * Pengacakan array yang benar-benar seragam (Fisher–Yates).
 *
 * Menggantikan pola `arr.sort(() => Math.random() - 0.5)` yang tersebar di
 * codebase. Pola itu BUKAN shuffle yang adil: komparatornya tidak konsisten,
 * dan untuk array kecil V8 memakai binary insertion sort sehingga hasilnya
 * condong ke urutan semula.
 *
 * Bias terukur (200k–300k percobaan):
 *   - Opsi jawaban 4 pilihan, jawaban benar mulai di indeks 0:
 *       sort(random-0.5) -> A 36% · B 17% · C 16% · D 31%
 *       Fisher–Yates     -> masing-masing ~25%
 *     Artinya menebak "A" memberi keuntungan nyata di atas peluang acak.
 *   - Kartu memori 12 buah (pasangan awalnya bersebelahan):
 *       sort(random-0.5) meninggalkan 22% lebih banyak pasangan bersebelahan.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Ambil `n` elemen acak tanpa pengulangan. */
export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}
