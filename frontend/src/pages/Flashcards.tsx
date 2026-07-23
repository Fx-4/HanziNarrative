import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import FlashcardContainer from '@/components/flashcard/FlashcardContainer'
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  ArrowLeft,
  Shuffle,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createLogger } from '@/utils/debugLogger'
import { useTranslation } from 'react-i18next'

const flashcardsLogger = createLogger('Flashcards')

type DifficultyRating = 0 | 1 | 2 | 3 | 4 | 5

interface SessionStats {
  total: number
  correct: number
  incorrect: number
  timeElapsed: number
  averageTime: number
}

export default function Flashcards() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [words, setWords] = useState<HanziWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedHSK, setSelectedHSK] = useState<number | undefined>()
  const [studyMode, setStudyMode] = useState<'review' | 'learn' | 'all'>('review')
  const [showSettings, setShowSettings] = useState(true)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total: 0,
    correct: 0,
    incorrect: 0,
    timeElapsed: 0,
    averageTime: 0
  })
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now())

  // Swipe gesture
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  useEffect(() => {
    if (sessionStarted && words.length > 0) {
      setCardStartTime(Date.now())
    }
  }, [currentIndex, sessionStarted, words.length])

  const loadWords = async () => {
    setLoading(true)
    try {
      let data: HanziWord[] = []

      if (studyMode === 'review') {
        const response = await learningApi.getReviewWords()
        // Extract words from reviews array
        data = response.reviews?.map((r: { word: HanziWord }) => r.word) || []
      } else if (studyMode === 'learn') {
        const response = await learningApi.getNewWords(selectedHSK || 1, 20)
        // Extract words array from response
        data = response.words || []
      } else {
        // Mix of both
        const reviewResponse = await learningApi.getReviewWords()
        const newWordsResponse = await learningApi.getNewWords(selectedHSK || 1, 10)
        const reviewWords = reviewResponse.reviews?.map((r: { word: HanziWord }) => r.word) || []
        const newWords = newWordsResponse.words || []
        data = [...reviewWords, ...newWords]
      }

      if (data.length === 0) {
        toast.error(t('flashcards.toasts.noWords'))
        setLoading(false)
        return
      }

      // Shuffle words
      const shuffled = data.sort(() => Math.random() - 0.5)
      setWords(shuffled)
      setLoading(false)
    } catch (error) {
      flashcardsLogger.error('Failed to load words:', error)
      toast.error(t('flashcards.toasts.loadFailed'))
      setLoading(false)
    }
  }

  const startSession = () => {
    setShowSettings(false)
    setSessionStarted(true)
    loadWords()
  }

  const recordReview = (quality: DifficultyRating) => {
    const currentWord = words[currentIndex]
    if (!currentWord) return

    x.set(0)
    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000)
    const isCorrect = quality >= 3

    // Update UI immediately (optimistic)
    setSessionStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      timeElapsed: prev.timeElapsed + timeSpent,
      averageTime: Math.floor((prev.timeElapsed + timeSpent) / (prev.total + 1))
    }))

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      // Session complete — advance index past end to trigger complete screen
      setCurrentIndex(words.length)
      setIsFlipped(false)
    }

    // Fire API call in background — don't block UI
    learningApi.recordReview(currentWord.id, quality).catch(err => {
      flashcardsLogger.error('Failed to record review:', err)
    })
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isFlipped) {
      toast(t('flashcards.toasts.flipFirst'), { icon: '↻' })
      return
    }

    if (direction === 'left') {
      recordReview(1) // Again
    } else {
      recordReview(4) // Easy
    }
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (!isFlipped) return

    const threshold = 100
    if (info.offset.x > threshold) {
      handleSwipe('right')
    } else if (info.offset.x < -threshold) {
      handleSwipe('left')
    }
  }

  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setWords(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    toast.success(t('flashcards.toasts.shuffled'))
  }

  const resetSession = () => {
    setSessionStarted(false)
    setShowSettings(true)
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionStats({
      total: 0,
      correct: 0,
      incorrect: 0,
      timeElapsed: 0,
      averageTime: 0
    })
  }

  // Keyboard (ala Anki): Space/Enter membalik kartu; setelah terbuka,
  // 1/2/3 = Hard / Good / Perfect. Diabaikan saat mengetik & saat sesi selesai.
  useEffect(() => {
    if (!sessionStarted || loading) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (currentIndex >= words.length) return // sesi selesai — abaikan
      if (!isFlipped) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(true) }
        return
      }
      if (e.key === '1') recordReview(1)
      else if (e.key === '2') recordReview(3)
      else if (e.key === '3') recordReview(5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, sessionStarted, loading, currentIndex, words.length])

  // ─── Settings Screen ───────────────────────────────────────────────────────
  if (!sessionStarted && showSettings) {
    return (
      <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          {/* Title header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50">
              {t('flashcards.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('flashcards.subtitle')}
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden dark:bg-surface-card dark:border-gray-800">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />

            <div className="p-6 sm:p-8">
              {/* Study Mode section */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 dark:text-gray-400">
                  {t('flashcards.studyMode')}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Review */}
                  <button
                    onClick={() => setStudyMode('review')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'review'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <Brain
                      className={`w-6 h-6 mx-auto mb-2 ${
                        studyMode === 'review' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-semibold ${
                        studyMode === 'review' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700'
                      }`}
                    >
                      {t('flashcards.modeReview')}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{t('flashcards.modeReviewDesc')}</div>
                  </button>

                  {/* Learn */}
                  <button
                    onClick={() => setStudyMode('learn')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'learn'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <Zap
                      className={`w-6 h-6 mx-auto mb-2 ${
                        studyMode === 'learn' ? 'text-orange-500' : 'text-gray-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-semibold ${
                        studyMode === 'learn' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700'
                      }`}
                    >
                      {t('flashcards.modeLearn')}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{t('flashcards.modeLearnDesc')}</div>
                  </button>

                  {/* Mixed */}
                  <button
                    onClick={() => setStudyMode('all')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'all'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-gray-200 hover:border-violet-200'
                    }`}
                  >
                    <Shuffle
                      className={`w-6 h-6 mx-auto mb-2 ${
                        studyMode === 'all' ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-semibold ${
                        studyMode === 'all' ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700'
                      }`}
                    >
                      {t('flashcards.modeMixed')}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{t('flashcards.modeMixedDesc')}</div>
                  </button>
                </div>
              </div>

              {/* HSK Level (only for non-review modes) */}
              {studyMode !== 'review' && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 dark:text-gray-400">
                    {t('flashcards.hskLevel')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedHSK(level)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                          selectedHSK === level
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        HSK {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 mb-6 dark:bg-primary-950/30 dark:border-primary-900/40">
                <h3 className="text-sm font-bold text-primary-800 dark:text-primary-300 mb-2">{t('flashcards.howItWorks')}</h3>
                <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
                  <li>• {t('flashcards.how1')}</li>
                  <li>• {t('flashcards.how2')}</li>
                  <li>• {t('flashcards.how3')}</li>
                  <li>• {t('flashcards.how4')}</li>
                </ul>
              </div>

              {/* Start button */}
              <button
                onClick={startSession}
                className="w-full bg-primary-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                {t('flashcards.startSession')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar skeleton */}
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6" />
        {/* Card skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-1.5" />
          <div className="p-8 sm:p-12 flex flex-col items-center gap-6">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-3xl h-40 w-40" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-36" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-10 w-48" />
          </div>
        </div>
        {/* Buttons skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-14" />
          ))}
        </div>
      </div>
    )
  }

  // ─── No Words State ────────────────────────────────────────────────────────
  if (words.length === 0) {
    return (
      <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-md w-full dark:bg-surface-card dark:border-gray-800">
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
          <div className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-gray-900 mb-2 dark:text-gray-50">{t('flashcards.noWordsTitle')}</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base dark:text-gray-400">
              {t('flashcards.noWordsDesc')}
            </p>
            <button
              onClick={resetSession}
              className="bg-primary-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-primary-700 transition-all"
            >
              {t('flashcards.backToSettings')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100
  const isSessionComplete = currentIndex >= words.length

  // ─── Session Complete Screen ───────────────────────────────────────────────
  if (isSessionComplete) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0

    return (
      <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden dark:bg-surface-card dark:border-gray-800">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />

            <div className="p-8 sm:p-12 text-center">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 dark:text-gray-50">
                {t('flashcards.sessionCompleteTitle')}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mb-8 dark:text-gray-400">
                {t('flashcards.sessionCompleteDesc')}
              </p>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-sm mx-auto">
                <div className="bg-primary-600 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{sessionStats.total}</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">{t('flashcards.totalCards')}</div>
                </div>
                <div className="bg-success-500 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{sessionStats.correct}</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">{t('flashcards.correct')}</div>
                </div>
                <div className="bg-violet-600 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{accuracy}%</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">{t('flashcards.accuracy')}</div>
                </div>
                <div className="bg-orange-500 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {Math.floor(sessionStats.timeElapsed / 60)}m
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">{t('flashcards.time')}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetSession}
                  className="w-full sm:w-auto flex-1 border-2 border-gray-200 text-gray-700 rounded-2xl px-6 py-3 font-semibold hover:border-primary-300 transition-all dark:border-gray-700 dark:text-gray-300"
                >
                  {t('flashcards.newSession')}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto flex-1 bg-primary-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-primary-700 transition-all"
                >
                  {t('flashcards.viewProgress')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Active Session ────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-screen">
      {/* Header area */}
      <div className="max-w-4xl mx-auto mb-4">
        {/* Top row: back btn + title + shuffle btn */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetSession}
              className="p-2 rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-primary-300 transition-all dark:border-gray-700 dark:text-gray-300"
              aria-label="Back to settings"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                {t('flashcards.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('flashcards.counter', { current: currentIndex + 1, total: words.length })}
              </p>
            </div>
          </div>
          <button
            onClick={shuffleWords}
            className="p-2 rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-primary-300 transition-all dark:border-gray-700 dark:text-gray-300"
            aria-label="Shuffle cards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4 dark:bg-gray-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 3 stat tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center dark:bg-surface-card dark:border-gray-800">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                {sessionStats.correct}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('flashcards.correct')}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center dark:bg-surface-card dark:border-gray-800">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-4 h-4 text-error-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                {sessionStats.incorrect}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('flashcards.incorrect')}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center dark:bg-surface-card dark:border-gray-800">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                {sessionStats.averageTime}s
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('flashcards.avgTime')}</div>
          </div>
        </div>
      </div>

      {/* Flashcard area */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <FlashcardContainer
              word={currentWord}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Swipe buttons – shown after flip */}
        {isFlipped && (
          <div className="flex justify-center gap-3 mt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => handleSwipe('left')}
                className="border-2 border-error-200 text-gray-700 rounded-2xl px-6 sm:px-8 py-3 font-semibold hover:bg-error-50 transition-all flex items-center gap-2 dark:text-gray-300 dark:border-error-800 dark:hover:bg-error-950/30"
              >
                <XCircle className="w-5 h-5 text-error-400" />
                {t('flashcards.again')}
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => handleSwipe('right')}
                className="bg-success-500 text-white rounded-2xl px-6 sm:px-8 py-3 font-semibold hover:bg-success-600 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {t('flashcards.easy')}
              </button>
            </motion.div>
          </div>
        )}

        {/* Detailed rating card – shown after flip */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4 dark:bg-surface-card dark:border-gray-800"
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center dark:text-gray-400">
              {t('flashcards.howWell')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => recordReview(1)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-error-50 dark:bg-error-950/40 text-error-600 dark:text-error-400 hover:bg-error-100 border border-error-100 dark:border-error-900/50 dark:hover:bg-error-900/40"
              >
                {t('flashcards.hard')}
                <kbd className="hidden sm:inline-flex items-center justify-center h-4 min-w-[16px] px-1 ml-1.5 rounded border border-current text-[10px] leading-none opacity-50 font-sans align-middle">1</kbd>
              </button>
              <button
                onClick={() => recordReview(3)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-100 dark:border-amber-900/50 dark:hover:bg-amber-900/40"
              >
                {t('flashcards.good')}
                <kbd className="hidden sm:inline-flex items-center justify-center h-4 min-w-[16px] px-1 ml-1.5 rounded border border-current text-[10px] leading-none opacity-50 font-sans align-middle">2</kbd>
              </button>
              <button
                onClick={() => recordReview(5)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-primary-600 text-white hover:bg-primary-700"
              >
                {t('flashcards.perfect')}
                <kbd className="hidden sm:inline-flex items-center justify-center h-4 min-w-[16px] px-1 ml-1.5 rounded border border-white/40 text-[10px] leading-none opacity-80 font-sans align-middle">3</kbd>
              </button>
            </div>
          </motion.div>
        )}

        {/* Instruction text – before flip */}
        {!isFlipped && (
          <p className="text-center text-sm text-gray-400 mt-6 dark:text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
            {t('flashcards.instruction')}
            <span className="hidden sm:inline-flex items-center gap-1 text-gray-300 dark:text-gray-600">
              ·
              <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-current text-[10px] leading-none font-sans">Space</kbd>
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

