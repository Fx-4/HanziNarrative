/**
 * PinyinText — Chinese text with pinyin above each character.
 *
 * Layout strategy:
 *   Each character is a fixed-width inline-flex column (pinyin on top, hanzi on bottom).
 *   The pinyin span uses overflow:visible so long syllables like "cháng" extend
 *   beyond the character box without pushing adjacent characters apart.
 *   This matches how printed Chinese textbooks render annotations.
 */

import React from 'react'

// ─── Punctuation ─────────────────────────────────────────────────────────────
const PUNCT = new Set([
  '。','，','！','？','；','：','、','…','—',
  '"','"','\u2018','\u2019','（','）','《','》',
  '【','】','·','"',"'",'`','～','~','「','」','『','』',
])

// ─── Parse content + pinyin into per-character units ────────────────────────
interface Unit {
  hanzi: string
  pinyin: string
  isPunct: boolean
  isBreak: boolean   // newline → line break element
}

function isPerCharPinyin(content: string, pinyinStr: string): boolean {
  const parts = pinyinStr.trim().split(/\s+/).filter(Boolean)
  const chars = Array.from(content).filter(c => c.trim() !== '')
  const ratio = chars.length > 0 ? parts.length / chars.length : 0
  return ratio > 0.6 && ratio < 1.6
}

function parse(content: string, contentPinyin?: string | null): Unit[] {
  const chars = Array.from(content)
  const units: Unit[] = []

  if (!contentPinyin || !isPerCharPinyin(content, contentPinyin)) {
    for (const ch of chars) {
      if (ch === '\n') { units.push({ hanzi: '\n', pinyin: '', isPunct: false, isBreak: true }); continue }
      if (ch === ' ') continue
      if (PUNCT.has(ch)) { units.push({ hanzi: ch, pinyin: '', isPunct: true, isBreak: false }); continue }
      units.push({ hanzi: ch, pinyin: '', isPunct: false, isBreak: false })
    }
    return units
  }

  const parts = contentPinyin.trim().split(/\s+/).filter(Boolean)
  let pIdx = 0

  for (const ch of chars) {
    if (ch === '\n') { units.push({ hanzi: '\n', pinyin: '', isPunct: false, isBreak: true }); continue }
    if (ch === ' ') continue

    if (PUNCT.has(ch)) {
      units.push({ hanzi: ch, pinyin: '', isPunct: true, isBreak: false })
      // consume matching punctuation token in pinyin list
      if (pIdx < parts.length && (PUNCT.has(parts[pIdx]) || parts[pIdx] === ch)) pIdx++
      continue
    }

    const py = pIdx < parts.length ? parts[pIdx++] : ''
    units.push({ hanzi: ch, pinyin: py, isPunct: false, isBreak: false })
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

// Fixed character cell size — must match hanzi font-size
const CHAR_SIZE = '1.75rem'   // hanzi font size
const PINYIN_H  = '1rem'      // reserved height for pinyin row
const PINYIN_FS = '0.68rem'   // pinyin font size

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
    <div style={{ lineHeight: 1 }}>
      {units.map((unit, i) => {
        // ── Line break ──
        if (unit.isBreak) {
          return <br key={i} />
        }

        // ── Punctuation — no pinyin row, inline with characters ──
        if (unit.isPunct) {
          return (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                verticalAlign: 'bottom',
              }}
            >
              {/* Reserve the same height as pinyin row so baselines align */}
              {showPinyin && (
                <span style={{ display: 'block', height: PINYIN_H }} />
              )}
              <span style={{
                display: 'block',
                fontSize: CHAR_SIZE,
                lineHeight: 1.2,
                color: '#1f2937',
              }}>
                {unit.hanzi}
              </span>
            </span>
          )
        }

        // ── Chinese character with pinyin above ──
        const py = unit.pinyin || (getPinyinFallback ? getPinyinFallback(unit.hanzi) : '')

        return (
          <span
            key={i}
            style={{
              // Fixed width = character width so pinyin never stretches the cell
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: CHAR_SIZE,
              verticalAlign: 'bottom',
              cursor: onCharClick ? 'pointer' : undefined,
              position: 'relative',
            }}
            onClick={onCharClick ? (e) => onCharClick(unit.hanzi, e) : undefined}
          >
            {/* PINYIN — centered above, allowed to overflow left/right */}
            {showPinyin && (
              <span
                style={{
                  display: 'block',
                  height: PINYIN_H,
                  lineHeight: PINYIN_H,
                  fontSize: PINYIN_FS,
                  color: '#6366f1',
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  // Key: let pinyin overflow beyond the fixed-width cell
                  position: 'relative',
                  zIndex: 1,
                  visibility: py ? 'visible' : 'hidden',
                }}
              >
                {py || '\u00A0'}
              </span>
            )}
            {!showPinyin && (
              /* keep layout stable when pinyin hidden */
              <span style={{ display: 'block', height: 0 }} />
            )}

            {/* HANZI — fixed-width cell, centered */}
            <span
              style={{
                display: 'block',
                width: CHAR_SIZE,
                fontSize: CHAR_SIZE,
                lineHeight: 1.2,
                textAlign: 'center',
                color: '#1f2937',
              }}
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
