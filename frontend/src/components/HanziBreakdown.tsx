/**
 * HanziBreakdown — renders a Chinese word/sentence where every Han character is
 * tappable: tapping shows a small popover with that single character's pinyin
 * and meaning. Helps beginners see what each hanzi contributes to a compound
 * (e.g. 再见 = 再 "again" + 见 "to see").
 *
 * Meaning lookup order:
 *   1. single-character words anywhere in the curriculum (authoritative)
 *   2. CHAR_GLOSS — canonical glosses for common HSK1 component characters
 *   3. pinyin only (no gloss available)
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pinyin as toPinyin } from 'pinyin-pro'
import { ALL_UNITS } from '@/data/curriculum'
import TonedPinyin from '@/components/TonedPinyin'

const HAN_RE = /[一-鿿]/

// Canonical single-character glosses for characters that appear inside compounds
// but have no standalone curriculum entry
const CHAR_GLOSS: Record<string, string> = {
  再: 'again', 见: 'to see; to meet', 谢: 'to thank', 客: 'guest', 气: 'air; manner',
  对: 'correct; facing', 起: 'to rise; to get up', 没: 'not (have)', 关: 'to close; to involve',
  系: 'to relate; system', 的: '(possessive particle)', 们: '(plural suffix)',
  学: 'to study', 生: 'to be born; student', 老: 'old', 师: 'teacher',
  中: 'middle', 国: 'country', 人: 'person', 什: 'what (in 什么)', 么: '(question suffix)',
  名: 'name', 字: 'character; name', 朋: 'friend', 友: 'friend',
  天: 'sky; day', 明: 'bright', 昨: 'yesterday', 今: 'now; today',
  时: 'time', 候: 'to wait; time', 上: 'up; on', 下: 'down; under',
  早: 'early; morning', 晚: 'late; evening', 午: 'noon',
  电: 'electricity', 脑: 'brain', 视: 'to look', 影: 'shadow; film', 话: 'speech; words',
  飞: 'to fly', 机: 'machine', 车: 'vehicle', 站: 'to stand; station',
  火: 'fire', 水: 'water', 茶: 'tea', 饭: 'cooked rice; meal',
  吃: 'to eat', 喝: 'to drink', 买: 'to buy', 钱: 'money', 块: 'piece; yuan (money)',
  多: 'many; much', 少: 'few; little', 大: 'big', 小: 'small',
  岁: 'years of age', 号: 'number; date', 月: 'moon; month', 年: 'year', 日: 'sun; day',
  家: 'home; family', 妈: 'mom', 爸: 'dad', 哥: 'older brother', 姐: 'older sister',
  弟: 'younger brother', 妹: 'younger sister', 儿: 'child; (suffix)', 子: 'child; (suffix)',
  女: 'female', 男: 'male', 想: 'to think; to want', 要: 'to want; to need',
  有: 'to have', 在: 'at; to be at', 去: 'to go', 来: 'to come',
  会: 'can; to know how', 能: 'can; to be able', 说: 'to speak', 读: 'to read',
  写: 'to write', 听: 'to listen', 看: 'to look; to read', 做: 'to do; to make',
  坐: 'to sit; to take (transport)', 住: 'to live (somewhere)', 工: 'work', 作: 'to do; work',
  汉: 'Han (Chinese)', 语: 'language', 文: 'writing; language',
  几: 'how many; several', 两: 'two (of something)', 零: 'zero',
  一: 'one', 二: 'two', 三: 'three', 四: 'four', 五: 'five',
  六: 'six', 七: 'seven', 八: 'eight', 九: 'nine', 十: 'ten',
}

// zh (single char) → { py, en } — built lazily once from the whole curriculum
let _charDict: Map<string, { py: string; en: string }> | null = null

function getCharInfo(ch: string): { py: string; en: string | null } {
  if (!_charDict) {
    _charDict = new Map()
    for (const unit of ALL_UNITS) {
      for (const session of unit.sessions) {
        for (const w of session.words ?? []) {
          if ([...w.zh].length === 1 && !_charDict.has(w.zh)) {
            _charDict.set(w.zh, { py: w.py, en: w.en })
          }
        }
      }
    }
  }
  const fromCurriculum = _charDict.get(ch)
  if (fromCurriculum) return fromCurriculum
  const py = toPinyin(ch, { toneType: 'symbol', type: 'string' })
  return { py, en: CHAR_GLOSS[ch] ?? null }
}

interface HanziBreakdownProps {
  text: string
  /** Classes for the text itself (font size, weight, colors) */
  className?: string
}

export default function HanziBreakdown({ text, className = '' }: HanziBreakdownProps) {
  const [active, setActive] = useState<number | null>(null)
  const rootRef = useRef<HTMLSpanElement>(null)

  // Close popover on outside tap
  useEffect(() => {
    if (active === null) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [active])

  // Reset when the text changes
  useEffect(() => { setActive(null) }, [text])

  const chars = [...text]
  const activeInfo = active !== null && HAN_RE.test(chars[active]) ? getCharInfo(chars[active]) : null

  return (
    <span ref={rootRef} className="relative inline-block">
      <span className={className}>
        {chars.map((ch, i) =>
          HAN_RE.test(ch) ? (
            <button
              key={i}
              type="button"
              onClick={() => setActive(active === i ? null : i)}
              className={`inline transition-colors rounded-md px-[1px] underline decoration-dotted decoration-1 underline-offset-4 cursor-pointer ${
                active === i
                  ? 'bg-amber-100 dark:bg-amber-900/40 decoration-amber-400'
                  : 'decoration-gray-300 dark:decoration-gray-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              {ch}
            </button>
          ) : (
            <span key={i}>{ch}</span>
          )
        )}
      </span>

      <AnimatePresence>
        {active !== null && activeInfo && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 flex items-center gap-2.5 w-max max-w-[260px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2 text-left"
          >
            <span className="font-chinese text-2xl leading-none text-gray-900 dark:text-gray-100">{chars[active]}</span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold"><TonedPinyin py={activeInfo.py} /></span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {activeInfo.en ?? '—'}
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
