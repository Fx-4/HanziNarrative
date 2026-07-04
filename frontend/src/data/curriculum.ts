/**
 * HanziNarrative Structured Curriculum
 * Inspired by Duolingo, Super Chinese, ChineseSimple HSK.
 *
 * Structure:
 *   Unit  → themed group of sessions (e.g. "Greetings")
 *   Session → one lesson (~5-12 exercise steps)
 *     type 'vocab'    → word-introduction flow
 *     type 'grammar'  → theory + fill-blank exercises
 *     type 'practice' → mixed review of the unit
 *
 * Level content lives in:
 *   hsk1.ts  — HSK 1 (10 units, 49 sessions)
 *   hsk2.ts  — HSK 2 (6 units, 30 sessions)
 */

export interface Word {
  zh: string   // simplified Chinese
  py: string   // pinyin with tone marks
  en: string   // English meaning
  note?: string
  /** Usage-in-context example shown on the intro card */
  example?: { zh: string; py: string; en: string }
  /** "Why" cultural explanation (e.g. why 喂 is phone-only) — rendered as a fun-fact box */
  funFact?: string
}

export interface FillBlank {
  sentence_zh: string  // use ___ for blank
  sentence_en: string
  options: string[]    // exactly 4
  correct: number      // index 0-3
}

export interface GrammarPoint {
  pattern: string
  explanation: string
  examples: { zh: string; py: string; en: string }[]
  fillBlanks: FillBlank[]
}

export type SessionType = 'vocab' | 'grammar' | 'practice'

export interface SessionDef {
  id: string
  title: string
  subtitle: string
  type: SessionType
  xp: number
  words?: Word[]
  grammarPoints?: GrammarPoint[]
}

export interface UnitDef {
  id: string
  hsk_level: number
  title: string
  subtitle: string
  emoji: string
  color: string        // tailwind gradient classes
  culturalNote?: string // shown in the unit header when expanded
  sessions: SessionDef[]
  locked?: boolean     // future placeholder
}

// ─────────────────────────────────────────────────────────────────────────────
// Level content (split into separate files to keep each manageable)
// ─────────────────────────────────────────────────────────────────────────────

import { HSK1 } from './hsk1'
import { HSK2 } from './hsk2'
import { HSK3 } from './hsk3'
import { HSK4 } from './hsk4'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 5–6  stubs (locked — content coming soon)
// ─────────────────────────────────────────────────────────────────────────────

function makeStub(level: number, unitCount = 4): UnitDef[] {
  const colors = ['from-slate-400 to-gray-500', 'from-zinc-400 to-stone-500']
  return Array.from({ length: unitCount }, (_, i) => ({
    id: `h${level}-u${i + 1}`,
    hsk_level: level,
    title: `Unit ${i + 1}`,
    subtitle: `HSK ${level} — Coming soon`,
    emoji: '🔒',
    color: colors[i % colors.length],
    locked: true,
    sessions: [
      { id: `h${level}-u${i + 1}-s1`, type: 'vocab' as SessionType,    xp: 30, title: 'Vocabulary', subtitle: 'Coming soon' },
      { id: `h${level}-u${i + 1}-s2`, type: 'grammar' as SessionType,  xp: 30, title: 'Grammar',    subtitle: 'Coming soon' },
      { id: `h${level}-u${i + 1}-s3`, type: 'practice' as SessionType, xp: 35, title: 'Practice',   subtitle: 'Coming soon' },
    ],
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Full curriculum export
// ─────────────────────────────────────────────────────────────────────────────

export const CURRICULUM: Record<number, UnitDef[]> = {
  1: HSK1,
  2: HSK2,
  3: HSK3,
  4: HSK4,
  5: makeStub(5),
  6: makeStub(6),
}

export const ALL_UNITS: UnitDef[] = Object.values(CURRICULUM).flat()

/** Flat list of all session definitions */
export const ALL_SESSIONS: SessionDef[] = ALL_UNITS.flatMap(u => u.sessions)

/** Look up a unit by id */
export function getUnit(unitId: string): UnitDef | undefined {
  return ALL_UNITS.find(u => u.id === unitId)
}

/** Look up a session by id */
export function getSession(sessionId: string): { session: SessionDef; unit: UnitDef } | undefined {
  for (const unit of ALL_UNITS) {
    const session = unit.sessions.find(s => s.id === sessionId)
    if (session) return { session, unit }
  }
  return undefined
}

/** All words from a unit (across all vocab sessions) */
export function getUnitWords(unitId: string): Word[] {
  const unit = getUnit(unitId)
  if (!unit) return []
  return unit.sessions.flatMap(s => s.words ?? [])
}
