/**
 * Pinyin colored by tone (Pleco-style) — a proven mnemonic aid for tone recall.
 *   tone 1 → red · tone 2 → green · tone 3 → blue · tone 4 → purple · neutral → gray
 * Tone is detected from the combining diacritic (NFD): macron/acute/caron/grave.
 */

const TONE_CLASSES: Record<number, string> = {
  1: 'text-red-600 dark:text-red-400',
  2: 'text-emerald-600 dark:text-emerald-400',
  3: 'text-blue-600 dark:text-blue-400',
  4: 'text-violet-600 dark:text-violet-400',
  5: 'text-gray-500 dark:text-gray-400',
}

const DIACRITIC_TONE: Record<string, number> = {
  '̄': 1, // macron  ā
  '́': 2, // acute   á
  '̌': 3, // caron   ǎ
  '̀': 4, // grave   à
}

function toneOf(syllable: string): number {
  for (const ch of syllable.normalize('NFD')) {
    const tone = DIACRITIC_TONE[ch]
    if (tone) return tone
  }
  return 5
}

export default function TonedPinyin({ py, className = '' }: { py: string; className?: string }) {
  const parts = py.split(/\s+/).filter(Boolean)
  return (
    <span className={className}>
      {parts.map((syllable, i) => (
        <span key={i} className={TONE_CLASSES[toneOf(syllable)]}>
          {syllable}
          {i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}
