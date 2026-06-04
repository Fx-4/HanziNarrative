import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
        toast.error('No words available. Try a different mode or HSK level.')
        setLoading(false)
        return
      }

      // Shuffle words
      const shuffled = data.sort(() => Math.random() - 0.5)
      setWords(shuffled)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load words:', error)
      toast.error('Failed to load words')
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
      // Session complete â€” advance index past end to trigger complete screen
      setCurrentIndex(words.length)
      setIsFlipped(false)
    }

    // Fire API call in background â€” don't block UI
    learningApi.recordReview(currentWord.id, quality).catch(err => {
      console.error('Failed to record review:', err)
    })
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isFlipped) {
      toast('Flip the card first to see the answer!', { icon: 'â†»' })
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
    toast.success('Cards shuffled!')
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

  // â”€â”€â”€ Settings Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!sessionStarted && showSettings) {
    return (
      <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          {/* Back + Title header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-primary-300 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Flashcard Study
              </h1>
              <p className="text-sm text-gray-500">
                Master vocabulary with spaced repetition
              </p>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />

            <div className="p-6 sm:p-8">
              {/* Study Mode section */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Study Mode
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Review */}
                  <button
                    onClick={() => setStudyMode('review')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'review'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <Brain
                      className={`w-6 h-6 mx-auto mb-2 ${
                        studyMode === 'review' ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-semibold ${
                        studyMode === 'review' ? 'text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      Review
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Due words</div>
                  </button>

                  {/* Learn */}
                  <button
                    onClick={() => setStudyMode('learn')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'learn'
                        ? 'border-orange-500 bg-orange-50'
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
                        studyMode === 'learn' ? 'text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      Learn New
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Fresh words</div>
                  </button>

                  {/* Mixed */}
                  <button
                    onClick={() => setStudyMode('all')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      studyMode === 'all'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-200'
                    }`}
                  >
                    <Shuffle
                      className={`w-6 h-6 mx-auto mb-2 ${
                        studyMode === 'all' ? 'text-violet-600' : 'text-gray-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-semibold ${
                        studyMode === 'all' ? 'text-violet-700' : 'text-gray-700'
                      }`}
                    >
                      Mixed
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Review + New</div>
                  </button>
                </div>
              </div>

              {/* HSK Level (only for non-review modes) */}
              {studyMode !== 'review' && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    HSK Level
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedHSK(level)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                          selectedHSK === level
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        HSK {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 mb-6">
                <h3 className="text-sm font-bold text-primary-800 mb-2">How it works</h3>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>â€¢ Click to flip and see the answer</li>
                  <li>â€¢ Swipe left (Again) or right (Easy)</li>
                  <li>â€¢ Rate difficulty to improve spaced repetition</li>
                  <li>â€¢ Track your progress in real-time</li>
                </ul>
              </div>

              {/* Start button */}
              <button
                onClick={startSession}
                className="w-full bg-primary-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Start Study Session
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // â”€â”€â”€ Loading State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // â”€â”€â”€ No Words State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (words.length === 0) {
    return (
      <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-md w-full">
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
          <div className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">No Words Available</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Try selecting a different study mode or HSK level
            </p>
            <button
              onClick={resetSession}
              className="bg-primary-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-primary-700 transition-all"
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100
  const isSessionComplete = currentIndex >= words.length

  // â”€â”€â”€ Session Complete Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />

            <div className="p-8 sm:p-12 text-center">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Session Complete!
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mb-8">
                Great work! Keep up the momentum
              </p>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-sm mx-auto">
                <div className="bg-primary-600 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{sessionStats.total}</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">Total Cards</div>
                </div>
                <div className="bg-success-500 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{sessionStats.correct}</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">Correct</div>
                </div>
                <div className="bg-violet-600 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{accuracy}%</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">Accuracy</div>
                </div>
                <div className="bg-orange-500 rounded-2xl p-4 text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {Math.floor(sessionStats.timeElapsed / 60)}m
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 mt-0.5">Time</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetSession}
                  className="w-full sm:w-auto flex-1 border-2 border-gray-200 text-gray-700 rounded-2xl px-6 py-3 font-semibold hover:border-primary-300 transition-all"
                >
                  New Session
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto flex-1 bg-primary-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-primary-700 transition-all"
                >
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // â”€â”€â”€ Active Session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-screen">
      {/* Header area */}
      <div className="max-w-4xl mx-auto mb-4">
        {/* Top row: back btn + title + shuffle btn */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetSession}
              className="p-2 rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-primary-300 transition-all"
              aria-label="Back to settings"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Flashcard Study
              </h1>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {words.length}
              </p>
            </div>
          </div>
          <button
            onClick={shuffleWords}
            className="p-2 rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-primary-300 transition-all"
            aria-label="Shuffle cards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 3 stat tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {sessionStats.correct}
              </span>
            </div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-4 h-4 text-error-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {sessionStats.incorrect}
              </span>
            </div>
            <div className="text-xs text-gray-500">Incorrect</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {sessionStats.averageTime}s
              </span>
            </div>
            <div className="text-xs text-gray-500">Avg Time</div>
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

        {/* Swipe buttons â€“ shown after flip */}
        {isFlipped && (
          <div className="flex justify-center gap-3 mt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => handleSwipe('left')}
                className="border-2 border-error-200 text-gray-700 rounded-2xl px-6 sm:px-8 py-3 font-semibold hover:bg-error-50 transition-all flex items-center gap-2"
              >
                <XCircle className="w-5 h-5 text-error-400" />
                Again
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => handleSwipe('right')}
                className="bg-success-500 text-white rounded-2xl px-6 sm:px-8 py-3 font-semibold hover:bg-success-600 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Easy
              </button>
            </motion.div>
          </div>
        )}

        {/* Detailed rating card â€“ shown after flip */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4"
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center">
              How well did you know this?
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => recordReview(1)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-error-50 text-error-600 hover:bg-error-100 border border-error-100"
              >
                Hard
              </button>
              <button
                onClick={() => recordReview(3)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100"
              >
                Good
              </button>
              <button
                onClick={() => recordReview(5)}
                className="rounded-xl py-3 text-sm font-semibold transition-all bg-primary-600 text-white hover:bg-primary-700"
              >
                Perfect
              </button>
            </div>
          </motion.div>
        )}

        {/* Instruction text â€“ before flip */}
        {!isFlipped && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Click card to flip &bull; Swipe left (Again) or right (Easy)
          </p>
        )}
      </div>
    </div>
  )
}

