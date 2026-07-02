import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LadderQuestion } from '@/hooks/useLadderWebSocket'

const CONTEXT_META = {
  main:   { emoji: '🎯', tint: 'text-primary-600 dark:text-primary-400' },
  ladder: { emoji: '🪜', tint: 'text-amber-600 dark:text-amber-400' },
  snake:  { emoji: '🐍', tint: 'text-error-600 dark:text-error-400' },
} as const

/** Question overlay for the answering player. Timer is cosmetic — the server enforces the real deadline. */
export default function QuestionModal({ question, onAnswer }: {
  question: LadderQuestion
  onAnswer: (index: number) => void
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(question.time_limit)

  useEffect(() => {
    setSelected(null)
    setSecondsLeft(question.time_limit)
    const iv = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(iv)
  }, [question])

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    onAnswer(i)
  }

  const meta = CONTEXT_META[question.context]
  const promptIsChinese = /[一-鿿]/.test(question.prompt)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white dark:bg-surface-elevated rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-widest ${meta.tint}`}>
            {meta.emoji} {t(`ladder.context.${question.context}`)} · HSK {question.hsk_level}
          </span>
          <span className={`text-sm font-extrabold tabular-nums ${
            secondsLeft <= 5 ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {secondsLeft}s
          </span>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${secondsLeft <= 5 ? 'bg-error-500' : 'bg-primary-500'}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: question.time_limit, ease: 'linear' }}
          />
        </div>

        <div className="text-center py-2">
          <p className={promptIsChinese
            ? 'font-chinese text-5xl font-bold text-gray-900 dark:text-gray-50 leading-none'
            : 'text-2xl font-extrabold text-gray-900 dark:text-gray-50'
          }>
            {question.prompt}
          </p>
          {question.prompt_hint && (
            <p className="text-primary-500 text-sm font-mono mt-1.5">{question.prompt_hint}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{question.prompt_label}</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {question.options.map((opt, i) => {
            const optIsChinese = /[一-鿿]/.test(opt)
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={selected !== null}
                className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-left transition-all ${
                  selected === i
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-800 dark:text-gray-100 hover:border-primary-300 disabled:opacity-50'
                } ${optIsChinese ? 'font-chinese text-xl' : 'text-sm'}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
