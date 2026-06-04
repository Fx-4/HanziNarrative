import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import AudioButton from '@/components/AudioButton'
import { ALL_UNITS, FillBlank } from '@/data/curriculum'
import { HanziWord } from '@/types'

export interface ReviewItem {
  word: HanziWord
  progress: unknown
  days_overdue: number
}

type ExerciseMode = 'fill_blank' | 'meaning_recall' | 'char_recall' | 'reveal'

interface Props {
  item: ReviewItem
  allItems: ReviewItem[]
  onRate: (quality: number) => void
}

function findFillBlankForWord(zh: string): FillBlank | null {
  for (const unit of ALL_UNITS) {
    for (const session of unit.sessions) {
      for (const gp of session.grammarPoints ?? []) {
        for (const fb of gp.fillBlanks) {
          if (fb.options[fb.correct] === zh) return fb
        }
      }
    }
  }
  return null
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ReviewExercise({ item, allItems, onRate }: Props) {
  const [mode, setMode] = useState<ExerciseMode>('reveal')
  const [fillBlank, setFillBlank] = useState<FillBlank | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    setSelected(null)
    setShowAnswer(false)
    setIsCorrect(false)
    setAttempted(false)

    // Try fill-in-the-blank from curriculum grammar data first
    const fb = findFillBlankForWord(item.word.simplified)
    if (fb) {
      setMode('fill_blank')
      setFillBlank(fb)
      setOptions(fb.options)
      setCorrectIndex(fb.correct)
      return
    }

    // Gather distractors from other review items
    const distractors = shuffle(
      allItems.filter(r => r.word.id !== item.word.id)
    ).slice(0, 3)

    if (distractors.length === 0) {
      // Not enough words for MCQ — just show the card
      setMode('reveal')
      setShowAnswer(true)
      return
    }

    const chosenMode: ExerciseMode = Math.random() > 0.5 ? 'meaning_recall' : 'char_recall'
    setMode(chosenMode)
    setFillBlank(null)

    if (chosenMode === 'meaning_recall') {
      const opts = shuffle([item.word.english, ...distractors.map(d => d.word.english)])
      setOptions(opts)
      setCorrectIndex(opts.indexOf(item.word.english))
    } else {
      const opts = shuffle([item.word.simplified, ...distractors.map(d => d.word.simplified)])
      setOptions(opts)
      setCorrectIndex(opts.indexOf(item.word.simplified))
    }
  }, [item.word.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    setAttempted(true)
    setIsCorrect(i === correctIndex)
    setTimeout(() => setShowAnswer(true), 900)
  }

  const modeLabel: Record<ExerciseMode, string> = {
    fill_blank: 'Isi bagian yang kosong',
    meaning_recall: 'Apa artinya?',
    char_recall: 'Karakter mana yang berarti:',
    reveal: '',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
      <div className="p-6 sm:p-8">

        {/* Overdue badge */}
        {item.days_overdue > 0 && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              <Clock className="w-3.5 h-3.5" />
              {item.days_overdue} hari terlambat
            </span>
          </div>
        )}

        {/* Mode label */}
        {mode !== 'reveal' && (
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            {modeLabel[mode]}
          </p>
        )}

        {/* Prompt area */}
        {mode === 'fill_blank' && fillBlank && (
          <div className="bg-primary-50 dark:bg-primary-950/30 rounded-2xl p-4 text-center mb-6">
            <p className="font-chinese text-2xl font-bold text-gray-900 dark:text-gray-50">
              {fillBlank.sentence_zh.replace('___', '＿＿＿')}
            </p>
            <p className="text-sm text-gray-400 italic mt-1">{fillBlank.sentence_en}</p>
          </div>
        )}

        {mode === 'meaning_recall' && (
          <p className="text-center font-chinese text-8xl sm:text-9xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            {item.word.simplified}
          </p>
        )}

        {mode === 'char_recall' && (
          <p className="text-center text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-6">
            &ldquo;{item.word.english}&rdquo;
          </p>
        )}

        {/* Options */}
        {mode !== 'reveal' && (
          <div className={`grid gap-3 mb-4 ${mode === 'char_recall' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {options.map((opt, i) => {
              const isSel = selected === i
              const isCorr = i === correctIndex
              const answered = selected !== null

              let cls = 'p-4 rounded-2xl border-2 transition-all font-medium text-left'
              if (answered) {
                if (isCorr) cls += ' border-success-400 bg-success-50 dark:bg-success-950/40 text-success-900 dark:text-success-300'
                else if (isSel) cls += ' border-error-400 bg-error-50 dark:bg-error-950/40 text-error-900 dark:text-error-300'
                else cls += ' border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'
              } else {
                cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-800 dark:text-gray-200 cursor-pointer'
              }

              return (
                <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={mode === 'char_recall' ? 'font-chinese text-3xl' : 'text-sm sm:text-base'}>
                      {opt}
                    </span>
                    {answered && isCorr && <CheckCircle className="w-5 h-5 text-success-600 shrink-0" />}
                    {answered && isSel && !isCorr && <XCircle className="w-5 h-5 text-error-600 shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Skip to answer */}
        {!showAnswer && mode !== 'reveal' && selected === null && (
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowAnswer(true)}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline cursor-pointer transition-colors"
            >
              Lihat jawaban
            </button>
          </div>
        )}

        {/* Answer reveal + rating */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Result banner — only if user attempted the exercise */}
              {attempted && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl mb-4 font-semibold text-sm ${
                  isCorrect
                    ? 'bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
                    : 'bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300'
                }`}>
                  {isCorrect
                    ? <><CheckCircle className="w-4 h-4" /> Benar!</>
                    : <><XCircle className="w-4 h-4" /> Salah — lihat jawaban di atas</>
                  }
                </div>
              )}

              {/* Full answer card */}
              <div className="text-center p-5 bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-950/30 dark:to-violet-950/30 rounded-2xl border border-primary-100 dark:border-primary-900/40 mb-5">
                <p className="font-chinese text-5xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                  {item.word.simplified}
                </p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {item.word.pinyin}
                  </p>
                  <AudioButton
                    text={item.word.simplified}
                    language="zh-CN"
                    size="sm"
                    variant="secondary"
                    tooltipText="Dengarkan"
                  />
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300">{item.word.english}</p>
                {item.word.category && (
                  <span className="mt-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {item.word.category}
                  </span>
                )}
              </div>

              {/* Rating buttons */}
              <p className="text-center text-xs text-gray-400 mb-3">Seberapa mudah kamu ingat ini?</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onRate(0)}
                  className="py-3.5 rounded-2xl border-2 border-error-200 dark:border-error-900 hover:bg-error-50 dark:hover:bg-error-950/30 text-center transition-all cursor-pointer"
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">Lagi</div>
                  <div className="text-xs text-gray-400">Lupa</div>
                </button>
                <button
                  onClick={() => onRate(3)}
                  className="py-3.5 rounded-2xl border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-center transition-all cursor-pointer"
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">Bagus</div>
                  <div className="text-xs text-gray-400">Perlu usaha</div>
                </button>
                <button
                  onClick={() => onRate(5)}
                  className="py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-center transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm">Mudah</div>
                  <div className="text-xs opacity-80">Langsung ingat</div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
