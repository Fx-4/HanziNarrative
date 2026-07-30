import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { onboardingApi } from '@/services/api'
import type { QuestionData, AssessmentAnswer } from '@/types'
import { Award, Check, X, AlertCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { createLogger } from '@/utils/debugLogger'

const adaptiveAssessmentLogger = createLogger('AdaptiveAssessment')

// Fisher-Yates shuffle — distribusi seragam. `Array.sort(() => 0.5 - Math.random())`
// bias (posisi jawaban benar bisa ditebak), jadi jangan dipakai untuk mengacak opsi.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface AdaptiveAssessmentProps {
  onComplete: (determinedLevel: number, xpEarned: number) => void
}

interface GeneratedQuestion {
  word_id: number
  hsk_level: number
  chinese: string
  pinyin: string
  english: string
  options: string[]
  correctIndex: number
}

const AdaptiveAssessment = ({ onComplete }: AdaptiveAssessmentProps) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [questionsPool, setQuestionsPool] = useState<QuestionData[]>([])
  const [currentLevel, setCurrentLevel] = useState(2)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null)
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Prevent double submission if race condition between timeout + useEffect
  const submittedRef = useRef(false)
  // Store last finalAnswers so submit error can retry
  const pendingAnswersRef = useRef<AssessmentAnswer[]>([])
  // Track the feedback setTimeout so we can cancel it on unmount
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  useEffect(() => { loadQuestions() }, [])

  useEffect(() => {
    if (questionsPool.length > 0 && !currentQuestion && !submittedRef.current) {
      generateNextQuestion()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsPool, currentQuestion, currentLevel])

  const loadQuestions = async () => {
    setLoadError(false)
    setLoading(true)
    try {
      const data = await onboardingApi.getAssessmentQuestions()
      setQuestionsPool(data.questions_pool)
      setLoading(false)
    } catch (error) {
      adaptiveAssessmentLogger.error('Failed to load questions:', error)
      setLoadError(true)
      setLoading(false)
    }
  }

  const generateNextQuestion = () => {
    if (submittedRef.current) return
    const usedWordIds = new Set(answers.map(a => a.word_id))
    const available = questionsPool.filter(
      q => q.hsk_level === currentLevel && !usedWordIds.has(q.word_id)
    )
    if (available.length === 0) { submitAssessment(); return }

    const q = available[Math.floor(Math.random() * available.length)]
    // Distraktor: level sama, kata beda, dan teks arti != jawaban benar.
    // Dedupe by english supaya tak ada dua opsi bertuliskan sama.
    const seen = new Set<string>([q.english])
    const wrongs: string[] = []
    for (const x of shuffle(questionsPool.filter(x => x.hsk_level === currentLevel && x.word_id !== q.word_id))) {
      if (seen.has(x.english)) continue
      seen.add(x.english)
      wrongs.push(x.english)
      if (wrongs.length === 3) break
    }

    const options = shuffle([q.english, ...wrongs])
    setCurrentQuestion({ ...q, options, correctIndex: options.indexOf(q.english) })
    setQuestionStartTime(Date.now())
  }

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback || !currentQuestion) return
    setSelectedAnswer(optionIndex)
    setShowFeedback(true)

    const isCorrect = optionIndex === currentQuestion.correctIndex
    const timeTaken = (Date.now() - questionStartTime) / 1000
    if (isCorrect) setTotalXP(prev => prev + 5)

    const answer: AssessmentAnswer = {
      question_id: questionIndex,
      word_id: currentQuestion.word_id,
      hsk_level: currentQuestion.hsk_level,
      user_answer: currentQuestion.options[optionIndex],
      correct_answer: currentQuestion.options[currentQuestion.correctIndex],
      is_correct: isCorrect,
      time_taken: timeTaken,
    }
    setAnswers(prev => [...prev, answer])

    if ((questionIndex + 1) % 3 === 0 && questionIndex > 0) {
      const recent = [...answers, answer].slice(-3)
      const correct = recent.filter(a => a.is_correct).length
      if (correct >= 2) setCurrentLevel(prev => Math.min(6, prev + 1))
      else if (correct <= 1) setCurrentLevel(prev => Math.max(1, prev - 1))
    }

    const shouldFinish = questionIndex >= 29 || hasStableLevel([...answers, answer])

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => {
      feedbackTimerRef.current = null
      setShowFeedback(false)
      setSelectedAnswer(null)
      setQuestionIndex(prev => prev + 1)
      setCurrentQuestion(null)
      if (shouldFinish) {
        submitAssessment([...answers, answer])
      }
    }, 1200)
  }

  const hasStableLevel = (all: AssessmentAnswer[]) => {
    const groups: Record<number, AssessmentAnswer[]> = {}
    all.forEach(a => { if (!groups[a.hsk_level]) groups[a.hsk_level] = []; groups[a.hsk_level].push(a) })
    for (const lvl in groups) {
      const g = groups[lvl]
      if (g.length >= 6 && g.filter(a => a.is_correct).length / g.length >= 0.7) return true
    }
    return false
  }

  const submitAssessment = async (finalAnswers = answers) => {
    // Guard against double submission from race condition
    if (submittedRef.current) return
    submittedRef.current = true
    pendingAnswersRef.current = finalAnswers
    try {
      const result = await onboardingApi.submitAssessment({
        answers: finalAnswers,
        total_time: (Date.now() - startTime) / 1000,
      })
      onComplete(result.determined_level, result.xp_earned)
    } catch (error) {
      adaptiveAssessmentLogger.error('Failed to submit assessment:', error)
      submittedRef.current = false // Allow retry
      toast.error(t('onboarding.assessment.toastSaveFailed'))
    }
  }

  const retrySubmit = () => {
    submitAssessment(pendingAnswersRef.current)
  }

  if (loading) {
    // Question card skeleton (prompt + 4 options) while the assessment loads
    return (
      <div className="min-h-[400px] max-w-xl mx-auto w-full space-y-4 py-6">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-2" />
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-3xl h-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-12" />
        ))}
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-10 h-10 text-error-400" />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-xs">
          {t('onboarding.assessment.loadError')}
        </p>
        <button
          onClick={loadQuestions}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('onboarding.assessment.tryAgain')}
        </button>
      </div>
    )
  }

  // Submission failed — show retry panel instead of blank/stuck state
  if (!submittedRef.current && pendingAnswersRef.current.length > 0 && !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-10 h-10 text-amber-400" />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-xs">
          {t('onboarding.assessment.saveError')}
        </p>
        <button
          onClick={retrySubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('onboarding.assessment.retry')}
        </button>
      </div>
    )
  }

  if (!currentQuestion) return null

  const progress = ((questionIndex + 1) / 30) * 100

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-2">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('onboarding.assessment.questionCounter', { n: questionIndex + 1 })}
        </span>
        <motion.div
          key={totalXP}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-full text-sm font-bold shadow-md"
        >
          <Award className="w-3.5 h-3.5" />
          {totalXP} XP
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-primary-600 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* HSK level badge */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full border border-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-500/20">
          HSK {currentQuestion.hsk_level}
        </span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="w-full"
        >
          <div className="mb-5 p-6 bg-gray-50 dark:bg-surface-elevated border border-gray-200 dark:border-surface-border rounded-2xl text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-50 font-chinese mb-2">
              {currentQuestion.chinese}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400">{currentQuestion.pinyin}</p>
          </div>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">{t('onboarding.assessment.prompt')}</p>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswer === idx
              const isCorrect  = idx === currentQuestion.correctIndex

              let cls = 'w-full px-4 py-3 text-left rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-between '
              if (showFeedback) {
                if (isCorrect)            cls += 'bg-success-50 border-success-400 text-success-900 dark:bg-success-500/10 dark:text-success-300'
                else if (isSelected)       cls += 'bg-error-50 border-error-400 text-error-900 dark:bg-error-500/10 dark:text-error-300'
                else                       cls += 'bg-white border-gray-200 text-gray-400 dark:bg-surface-elevated dark:border-surface-border dark:text-gray-500'
              } else {
                cls += isSelected
                  ? 'bg-primary-50 border-primary-400 text-primary-900 dark:bg-primary-500/10 dark:text-primary-200'
                  : 'bg-white border-gray-200 text-gray-800 hover:border-primary-300 hover:bg-primary-50 dark:bg-surface-elevated dark:border-surface-border dark:text-gray-100 dark:hover:border-primary-500/40 dark:hover:bg-primary-500/10'
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showFeedback}
                  className={cls}
                  whileHover={!showFeedback ? { scale: 1.01 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                >
                  <span>{option}</span>
                  {showFeedback && isCorrect  && <Check className="w-4 h-4 text-success-600 shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <X className="w-4 h-4 text-error-500 shrink-0" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AdaptiveAssessment
