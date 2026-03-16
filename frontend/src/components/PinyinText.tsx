/**
 * PinyinText — renders Chinese text with pinyin annotations above each word.
 *
 * content_pinyin format (from AI / claude_story_service):
 *   One pinyin syllable per Chinese character, space-separated.
 *   Punctuation characters appear as-is inside the pinyin string too
 *   (e.g. "xiǎo míng shì 。 tā lái").
 *
 * The seed stories use sentence-level pinyin (e.g. "Wǒ yǒu yī gè jiā."),
 * which won't align 1-per-char; in that case we fall back gracefully.
 *
 * Rendering strategy:
 *   - Parse content + content_pinyin into tokens: each token is either a
 *     Chinese word (1+ chars with their per-char pinyin joined) or a
 *     punctuation/whitespace character.
 *   - Each word token is wrapped in a whitespace-nowrap span so multi-char
 *     words (e.g. 学习) never split across lines.
 *   - Each character inside a word token gets its own <ruby> element with
 *     pinyin above it.
 *   - Punctuation renders inline with no pinyin above it.
 */

import React from 'react'

// ─── Punctuation set ────────────────────────────────────────────────────────

const PUNCT = new Set([
  '。', '，', '！', '？', '；', '：', '、', '…', '—',
  '"', '"', '\u2018', '\u2019', '（', '）', '《', '》',
  '【', '】', '·', '.', ',', '!', '?', ';', ':', '/',
  '\\', '·', '~', '～',
])

// ─── Types ───────────────────────────────────────────────────────────────────

interface CharToken {
  kind: 'char'
  hanzi: string
  pinyin: string
}

interface PunctToken {
  kind: 'punct'
  hanzi: string
}

interface NewlineToken {
  kind: 'newline'
}

type Token = CharToken | PunctToken | NewlineToken

// A word group: one or more CharTokens that should never break across lines
interface WordGroup {
  kind: 'word'
  chars: CharToken[]
}

interface PunctGroup {
  kind: 'punct'
  hanzi: string
}

interface NewlineGroup {
  kind: 'newline'
}

type Group = WordGroup | PunctGroup | NewlineGroup

// ─── Tokenizer ───────────────────────────────────────────────────────────────

/**
 * Returns true if the pinyin string looks like per-character syllables
 * (e.g. "wǒ yǒu yī gè jiā") rather than whole-word / sentence-level pinyin.
 * Heuristic: count space-separated parts vs character count.
 */
function isPerCharPinyin(content: string, pinyinStr: string): boolean {
  const parts = pinyinStr.trim().split(/\s+/).filter(Boolean)
  // Count Chinese characters + punctuation in content
  const chars = Array.from(content).filter(c => c !== '\n')
  // If parts count roughly matches char count (within 20%), treat as per-char
  const ratio = chars.length > 0 ? parts.length / chars.length : 0
  return ratio > 0.7 && ratio < 1.5
}

function tokenize(content: string, contentPinyin: string): Token[] {
  const tokens: Token[] = []
  const chars = Array.from(content)

  // Detect format
  if (!isPerCharPinyin(content, contentPinyin)) {
    // Sentence/word-level pinyin — can't align per-char; return char tokens
    // with empty pinyin (caller will use pinyin-pro fallback)
    for (const ch of chars) {
      if (ch === '\n') {
        tokens.push({ kind: 'newline' })
      } else if (PUNCT.has(ch) || ch === ' ') {
        if (ch !== ' ') tokens.push({ kind: 'punct', hanzi: ch })
      } else {
        tokens.push({ kind: 'char', hanzi: ch, pinyin: '' })
      }
    }
    return tokens
  }

  // Per-character pinyin — split by spaces
  const pinyinParts = contentPinyin.trim().split(/\s+/).filter(Boolean)

  let pIdx = 0 // index into pinyinParts

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]

    if (ch === '\n') {
      tokens.push({ kind: 'newline' })
      continue
    }

    if (ch === ' ') {
      // consume the corresponding pinyin part if it looks like a space placeholder
      if (pIdx < pinyinParts.length && pinyinParts[pIdx] === ' ') pIdx++
      continue
    }

    if (PUNCT.has(ch)) {
      tokens.push({ kind: 'punct', hanzi: ch })
      // The AI includes punctuation as-is in content_pinyin too — skip that part
      if (pIdx < pinyinParts.length && pinyinParts[pIdx] === ch) pIdx++
      continue
    }

    // Chinese character
    const py = pIdx < pinyinParts.length ? pinyinParts[pIdx] : ''
    tokens.push({ kind: 'char', hanzi: ch, pinyin: py })
    pIdx++
  }

  return tokens
}

/**
 * Group consecutive CharTokens into WordGroups (wrapped in whitespace-nowrap).
 * Simple heuristic: consecutive non-punct, non-newline chars form one word
 * until we hit punctuation, newline, or a "natural break" based on common
 * two-character word patterns. For simplicity (and correctness), we group
 * ALL consecutive Chinese chars — the key benefit is that they never
 * line-break mid-group. Each individual ruby still shows per-char pinyin.
 *
 * Max group size: 4 characters (avoids very long non-breakable runs).
 */
function groupTokens(tokens: Token[]): Group[] {
  const groups: Group[] = []
  let i = 0

  while (i < tokens.length) {
    const t = tokens[i]

    if (t.kind === 'newline') {
      groups.push({ kind: 'newline' })
      i++
      continue
    }

    if (t.kind === 'punct') {
      groups.push({ kind: 'punct', hanzi: t.hanzi })
      i++
      continue
    }

    // Accumulate consecutive char tokens into a word group (max 4)
    const wordChars: CharToken[] = []
    while (
      i < tokens.length &&
      tokens[i].kind === 'char' &&
      wordChars.length < 4
    ) {
      wordChars.push(tokens[i] as CharToken)
      i++
    }

    if (wordChars.length > 0) {
      groups.push({ kind: 'word', chars: wordChars })
    }
  }

  return groups
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PinyinTextProps {
  content: string
  contentPinyin?: string | null
  showPinyin?: boolean
  /** Called when a Chinese character is clicked */
  onCharClick?: (char: string, event: React.MouseEvent<HTMLElement>) => void
  /** Fallback pinyin lookup when content_pinyin is absent or misaligned */
  getPinyinFallback?: (char: string) => string
}

export function PinyinText({
  content,
  contentPinyin,
  showPinyin = true,
  onCharClick,
  getPinyinFallback,
}: PinyinTextProps) {
  const tokens = React.useMemo(() => {
    if (!contentPinyin) {
      // No pinyin data — build char/punct tokens with empty pinyin
      return Array.from(content).map((ch): Token => {
        if (ch === '\n') return { kind: 'newline' }
        if (PUNCT.has(ch) || ch === ' ') {
          if (ch === ' ') return { kind: 'newline' } // treat spaces as soft breaks
          return { kind: 'punct', hanzi: ch }
        }
        return { kind: 'char', hanzi: ch, pinyin: '' }
      })
    }
    return tokenize(content, contentPinyin)
  }, [content, contentPinyin])

  const groups = React.useMemo(() => groupTokens(tokens), [tokens])

  const renderChar = (ct: CharToken, key: string | number) => {
    const py =
      ct.pinyin ||
      (getPinyinFallback ? getPinyinFallback(ct.hanzi) : '')

    return (
      <ruby
        key={key}
        style={{ display: 'inline-block', textAlign: 'center', margin: '0 1px' }}
      >
        <span
          className="text-2xl font-chinese text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors hover:bg-indigo-100 rounded px-0.5"
          onClick={onCharClick ? (e) => onCharClick(ct.hanzi, e) : undefined}
        >
          {ct.hanzi}
        </span>
        <rp>(</rp>
        <rt
          style={{
            display: 'block',
            textAlign: 'center',
            lineHeight: 1.2,
            fontSize: '0.55em',
            color: 'rgb(99 102 241)', // indigo-500
            fontWeight: 400,
            letterSpacing: '0.025em',
            visibility: showPinyin && py ? 'visible' : 'hidden',
          }}
        >
          {py || '\u00A0'}
        </rt>
        <rp>)</rp>
      </ruby>
    )
  }

  return (
    <div
      className="text-2xl font-chinese"
      style={{ lineHeight: '3.2rem', wordBreak: 'keep-all' }}
    >
      {groups.map((group, gIdx) => {
        if (group.kind === 'newline') {
          return <br key={`nl-${gIdx}`} />
        }

        if (group.kind === 'punct') {
          return (
            <span
              key={`p-${gIdx}`}
              className="inline-block text-2xl text-gray-900"
              style={{ marginBottom: showPinyin ? '1.4rem' : undefined }}
            >
              {group.hanzi}
            </span>
          )
        }

        // word group — wrap in no-break span
        if (group.chars.length === 1) {
          // Single char — no wrapper needed, just render directly
          return renderChar(group.chars[0], `w-${gIdx}-0`)
        }

        return (
          <span
            key={`w-${gIdx}`}
            className="inline-block"
            style={{ whiteSpace: 'nowrap' }}
          >
            {group.chars.map((ct, cIdx) =>
              renderChar(ct, `w-${gIdx}-${cIdx}`)
            )}
          </span>
        )
      })}
    </div>
  )
}
