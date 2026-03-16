/**
 * PinyinText — renders Chinese text with pinyin annotations ABOVE each character.
 *
 * Uses inline-flex column layout (not <ruby>) so pinyin is always on top,
 * reliably across all browsers.
 *
 * content_pinyin format (AI stories): one syllable per character, space-separated,
 * including punctuation tokens. e.g. "xiǎo míng shì 。 tā lái"
 */

import React from 'react'

// ─── Punctuation ─────────────────────────────────────────────────────────────

const PUNCT = new Set([
  '。','，','！','？','；','：','、','…','—',
  '"','"','\u2018','\u2019','（','）','《','》',
  '【','】','·','.', ',','!','?',';',':','"',"'",
  '\'','"','`','～','~','「','」','『','』',
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPerCharPinyin(content: string, pinyinStr: string): boolean {
  const parts = pinyinStr.trim().split(/\s+/).filter(Boolean)
  const chars = Array.from(content).filter(c => c.trim() !== '')
  const ratio = chars.length > 0 ? parts.length / chars.length : 0
  return ratio > 0.6 && ratio < 1.6
}

interface CharUnit {
  hanzi: string
  pinyin: string
  isPunct: boolean
  isSpace: boolean
}

function parse(content: string, contentPinyin: string | null | undefined): CharUnit[] {
  const chars = Array.from(content)
  const units: CharUnit[] = []

  if (!contentPinyin || !isPerCharPinyin(content, contentPinyin)) {
    // No per-char pinyin — render chars without pinyin annotation
    for (const ch of chars) {
      if (ch === '\n' || ch === ' ') {
        units.push({ hanzi: ' ', pinyin: '', isPunct: false, isSpace: true })
      } else if (PUNCT.has(ch)) {
        units.push({ hanzi: ch, pinyin: '', isPunct: true, isSpace: false })
      } else {
        units.push({ hanzi: ch, pinyin: '', isPunct: false, isSpace: false })
      }
    }
    return units
  }

  const pinyinParts = contentPinyin.trim().split(/\s+/).filter(Boolean)
  let pIdx = 0

  for (const ch of chars) {
    if (ch === '\n' || ch === ' ') {
      units.push({ hanzi: ' ', pinyin: '', isPunct: false, isSpace: true })
      continue
    }

    if (PUNCT.has(ch)) {
      units.push({ hanzi: ch, pinyin: '', isPunct: true, isSpace: false })
      // consume the matching punctuation token in the pinyin list
      if (pIdx < pinyinParts.length && PUNCT.has(pinyinParts[pIdx])) pIdx++
      continue
    }

    const py = pIdx < pinyinParts.length ? pinyinParts[pIdx] : ''
    units.push({ hanzi: ch, pinyin: py, isPunct: false, isSpace: false })
    pIdx++
  }

  return units
}

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

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        lineHeight: 1,
        rowGap: '0.75rem',
        columnGap: 0,
        paddingTop: '0.25rem',
      }}
    >
      {units.map((unit, i) => {
        // Newline / word-space → flex break
        if (unit.isSpace) {
          return (
            <span
              key={i}
              style={{ width: '0.35em', display: 'inline-block' }}
            />
          )
        }

        const py =
          unit.pinyin ||
          (getPinyinFallback && !unit.isPunct
            ? getPinyinFallback(unit.hanzi)
            : '')

        // Punctuation — no pinyin row above, just the character
        if (unit.isPunct) {
          return (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* empty slot so punctuation aligns with character bottoms */}
              {showPinyin && (
                <span
                  style={{
                    display: 'block',
                    height: '1.1em',
                    minWidth: '1px',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '1.5rem',
                  lineHeight: 1.2,
                  color: '#1f2937',
                }}
              >
                {unit.hanzi}
              </span>
            </span>
          )
        }

        // Chinese character with pinyin above
        return (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: onCharClick ? 'pointer' : undefined,
              padding: '0 3px',
            }}
            onClick={onCharClick ? (e) => onCharClick(unit.hanzi, e) : undefined}
            title={py || undefined}
          >
            {/* PINYIN — always on top */}
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                lineHeight: 1.3,
                color: '#6366f1',
                fontWeight: 400,
                letterSpacing: '0.02em',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                minHeight: showPinyin ? '0.9rem' : 0,
                visibility: showPinyin ? 'visible' : 'hidden',
              }}
            >
              {py || (showPinyin ? '\u00A0' : '')}
            </span>

            {/* HANZI — always on bottom */}
            <span
              style={{
                fontSize: '1.5rem',
                lineHeight: 1.2,
                color: '#1f2937',
                fontFamily: 'inherit',
              }}
              className="hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            >
              {unit.hanzi}
            </span>
          </span>
        )
      })}
    </div>
  )
}
