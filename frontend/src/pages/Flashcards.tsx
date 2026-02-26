import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
        data = response.reviews?.map((r: any) => r.word) || []
      } else if (studyMode === 'learn') {
        const response = await learningApi.getNewWords(selectedHSK || 1, 20)
        // Extract words array from response
        data = response.words || []
      } else {
        // Mix of both
        const reviewResponse = await learningApi.getReviewWords()
        const newWordsResponse = await learningApi.getNewWords(selectedHSK || 1, 10)
        const reviewWords = reviewResponse.reviews?.map((r: any) => r.word) || []
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

  const recordReview = async (quality: DifficultyRating) => {
    const currentWord = words[currentIndex]
    if (!currentWord) return

    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000)

    try {
      await learningApi.recordReview(currentWord.id, quality)

      // Update session stats
      const isCorrect = quality >= 3
      setSessionStats(prev => ({
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        timeElapsed: prev.timeElapsed + timeSpent,
        averageTime: Math.floor((prev.timeElapsed + timeSpent) / (prev.total + 1))
      }))

      // Move to next card
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setIsFlipped(false)
      } else {
        // Session complete
        toast.success(`Session complete! ${sessionStats.correct + (isCorrect ? 1 : 0)}/${sessionStats.total + 1} correct`)
      }
    } catch (error) {
      console.error('Failed to record review:', error)
      toast.error('Failed to save progress')
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isFlipped) {
      toast('Flip the card first to see the answer!', { icon: '↻' })
      return
    }

    if (direction === 'left') {
      recordReview(1) // Again
    } else {
      recordReview(4) // Easy
    }
  }

  const handleDragEnd = (_: any, info: any) => {
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

  if (!sessionStarted && showSettings) {
    return (
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/practice')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Flashcard Study
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Master vocabulary with spaced repetition
              </p>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Study Settings</h2>

            {/* Study Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setStudyMode('review')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    studyMode === 'review'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Brain className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Review</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Due words only</div>
                </button>

                <button
                  onClick={() => setStudyMode('learn')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    studyMode === 'learn'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Learn New</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Fresh words</div>
                </button>

                <button
                  onClick={() => setStudyMode('all')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    studyMode === 'all'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Shuffle className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Mixed</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Review + New</div>
                </button>
              </div>
            </div>

            {/* HSK Level */}
            {studyMode !== 'review' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HSK Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedHSK(level)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedHSK === level
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      HSK {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How it works:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Click to flip and see the answer</li>
                <li>• Swipe left (Again) or right (Easy)</li>
                <li>• Rate difficulty to improve spaced repetition</li>
                <li>• Track your progress in real-time</li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startSession}
              className="w-full"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start Study Session
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center p-8">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">No Words Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try selecting a different study mode or HSK level
          </p>
          <Button onClick={resetSession}>
            Back to Settings
          </Button>
        </Card>
      </div>
    )
  }

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100
  const isSessionComplete = currentIndex >= words.length

  if (isSessionComplete) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0

    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="text-center p-8">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Session Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Great work! Keep up the momentum
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sessionStats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {sessionStats.correct}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.floor(sessionStats.timeElapsed / 60)}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={resetSession} className="flex-1">
                New Session
              </Button>
              <Button variant="primary" onClick={() => navigate('/dashboard')} className="flex-1">
                View Progress
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-screen">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={resetSession}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Flashcard Study
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} of {words.length}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={shuffleWords}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-primary-600 h-2 rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <Card className="p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {sessionStats.correct}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {sessionStats.incorrect}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Incorrect</div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {sessionStats.averageTime}s
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Time</div>
          </Card>
        </div>
      </div>

      {/* Flashcard */}
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

        {/* Swipe Indicators */}
        {isFlipped && (
          <div className="flex justify-center gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleSwipe('left')}
                className="min-w-[120px]"
              >
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                Again
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleSwipe('right')}
                className="min-w-[120px]"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Easy
              </Button>
            </motion.div>
          </div>
        )}

        {/* Detailed Rating (shown after flip) */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                How well did you know this?
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => recordReview(1)}
                  className="text-xs"
                >
                  Hard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => recordReview(3)}
                  className="text-xs"
                >
                  Good
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => recordReview(5)}
                  className="text-xs"
                >
                  Perfect
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        {!isFlipped && (
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Click card to flip • Swipe left (Again) or right (Easy)
          </div>
        )}
      </div>
    </div>
  )
}
