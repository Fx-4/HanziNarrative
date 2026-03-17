/**
 * PinyinText — Chinese text with pinyin above each character.
 *
 * Layout: each character is a fixed-width inline-flex column (pinyin top, hanzi bottom).
 * Long syllables overflow the cell visually — matching printed textbook style.
 */

import React from 'react'

// ─── Punctuation (full-width CJK + common ASCII used in Chinese text) ────────
export const PUNCT = new Set([
  // Full-width
  '。','，','！','？','；','：','、','…','—','～',
  '"','"','「','」','『','』','（','）','《','》','【','】','·',
  // ASCII equivalents that appear in AI-generated Chinese text
  ',', '.', '!', '?', ';', ':', '(', ')', '-', '"', "'", '`', '~', '/', '\\',
])

// ─── Types ───────────────────────────────────────────────────────────────────
interface Unit {
  hanzi: string
  pinyin: string
  isPunct: boolean
  isBreak: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isPerCharPinyinParts(chars: string[], parts: string[]): boolean {
  const ratio = chars.length > 0 ? parts.length / chars.length : 0
  return ratio > 0.6 && ratio < 1.6
}

export function parse(content: string, contentPinyin?: string | null): Unit[] {
  const chars = Array.from(content)
  const units: Unit[] = []

  // Split pinyin once — reused for both the heuristic check and alignment
  const parts = contentPinyin ? contentPinyin.trim().split(/\s+/).filter(Boolean) : []
  const nonSpaceChars = chars.filter(c => c.trim() !== '')

  const perChar = contentPinyin != null && isPerCharPinyinParts(nonSpaceChars, parts)

  if (!perChar) {
    // No usable per-char pinyin — render characters without annotation
    for (const ch of chars) {
      if (ch === '\n') { units.push({ hanzi: '\n', pinyin: '', isPunct: false, isBreak: true }); continue }
      if (ch === ' ')  continue
      if (PUNCT.has(ch)) { units.push({ hanzi: ch, pinyin: '', isPunct: true, isBreak: false }); continue }
      units.push({ hanzi: ch, pinyin: '', isPunct: false, isBreak: false })
    }
    return units
  }

  let pIdx = 0
  for (const ch of chars) {
    if (ch === '\n') { units.push({ hanzi: '\n', pinyin: '', isPunct: false, isBreak: true }); continue }
    if (ch === ' ')  continue

    if (PUNCT.has(ch)) {
      units.push({ hanzi: ch, pinyin: '', isPunct: true, isBreak: false })
      // Consume the matching punctuation token so the index stays aligned
      if (pIdx < parts.length && (PUNCT.has(parts[pIdx]) || parts[pIdx] === ch)) pIdx++
      continue
    }

    units.push({ hanzi: ch, pinyin: pIdx < parts.length ? parts[pIdx++] : '', isPunct: false, isBreak: false })
  }

  return units
}

// ─── Style constants (module-level — never recreated) ────────────────────────
const CHAR_SIZE = '1.75rem'
const PINYIN_H  = '1rem'
const PINYIN_FS = '0.68rem'

const outerPunctStyle: React.CSSProperties = {
  display: 'inline-flex', flexDirection: 'column',
  alignItems: 'center', verticalAlign: 'bottom',
}
const punctCharStyle: React.CSSProperties = {
  display: 'block', fontSize: CHAR_SIZE, lineHeight: 1.2, color: '#1f2937',
}
const punctSpacerStyle: React.CSSProperties = { display: 'block', height: PINYIN_H }

const outerCharStyle: React.CSSProperties = {
  display: 'inline-flex', flexDirection: 'column',
  alignItems: 'center', width: CHAR_SIZE, verticalAlign: 'bottom',
}
// Clickable variant — pre-spread so no object is created per character per render
const outerCharClickableStyle: React.CSSProperties = {
  ...outerCharStyle, cursor: 'pointer',
}
const pinyinStyle: React.CSSProperties = {
  display: 'block', height: PINYIN_H, lineHeight: PINYIN_H,
  fontSize: PINYIN_FS, color: '#6366f1', fontWeight: 400,
  letterSpacing: '0.01em', textAlign: 'center',
  whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
}
// Two visibility variants — avoids spread on every character per render
const pinyinVisibleStyle: React.CSSProperties = { ...pinyinStyle, visibility: 'visible' }
const pinyinHiddenStyle:  React.CSSProperties = { ...pinyinStyle, visibility: 'hidden'  }
const hanziStyle: React.CSSProperties = {
  display: 'block', width: CHAR_SIZE, fontSize: CHAR_SIZE,
  lineHeight: 1.2, textAlign: 'center', color: '#1f2937',
}
const containerStyle: React.CSSProperties = { lineHeight: 1 }

// ─── Component ───────────────────────────────────────────────────────────────
interface PinyinTextProps {
  content: string
  contentPinyin?: string | null
  showPinyin?: boolean
  onCharClick?: (char: string, event: React.MouseEvent<HTMLElement>) => void
  getPinyinFallback?: (char: string) => string
}

export function PinyinText({
  content,
  contentPinyin,
  showPinyin = true,
  onCharClick,
  getPinyinFallback,
}: PinyinTextProps) {
  const units = React.useMemo(
    () => parse(content, contentPinyin),
    [content, contentPinyin],
  )

  // Event delegation — one handler on the container instead of one per character
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onCharClick) return
      const hanzi = (e.target as HTMLElement).closest<HTMLElement>('[data-hanzi]')?.dataset.hanzi
      if (hanzi) onCharClick(hanzi, e)
    },
    [onCharClick],
  )

  return (
    <div style={containerStyle} onClick={onCharClick ? handleClick : undefined}>
      {units.map((unit, i) => {
        if (unit.isBreak) return <br key={i} />

        if (unit.isPunct) {
          return (
            <span key={i} style={outerPunctStyle}>
              {showPinyin && <span style={punctSpacerStyle} />}
              <span style={punctCharStyle}>{unit.hanzi}</span>
            </span>
          )
        }

        const py = unit.pinyin || (getPinyinFallback ? getPinyinFallback(unit.hanzi) : '')

        return (
          <span
            key={i}
            data-hanzi={unit.hanzi}
            style={onCharClick ? outerCharClickableStyle : outerCharStyle}
          >
            {showPinyin && (
              <span style={py ? pinyinVisibleStyle : pinyinHiddenStyle}>
                {py}
              </span>
            )}
            <span
              style={hanziStyle}
              className={onCharClick ? 'hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors' : ''}
            >
              {unit.hanzi}
            </span>
          </span>
        )
      })}
    </div>
  )
}
