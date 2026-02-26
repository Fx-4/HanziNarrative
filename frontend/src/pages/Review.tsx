import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import AudioButton from '@/components/AudioButton'
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Zap,
  Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

interface ReviewItem {
  word: HanziWord
  progress: any
  days_overdue: number
}

type QuizMode = 'meaning' | 'pinyin'

interface QuizQuestion {
  type: QuizMode
  options: string[]
  correctIndex: number
}

export default function Review() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    perfect: 0,
    good: 0,
    hard: 0,
    wrong: 0
  })
  const [hskLevel, setHskLevel] = useState<number | undefined>(undefined)
  const [stats, setStats] = useState<any>(null)

  // Active testing states
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadReviewWords()
    loadStats()
  }, [user, hskLevel])

  const loadReviewWords = async () => {
    setLoading(true)
    try {
      const data = await learningApi.getReviewWords(hskLevel)
      setReviewItems(data.reviews)
      setSessionStats(prev => ({ ...prev, total: data.reviews.length }))

      // Generate quiz for first word
      if (data.reviews.length > 0) {
        generateQuizQuestion(0, data.reviews)
      }
    } catch (error: any) {
      console.error('Failed to load review words:', error)
      // Don't show error toast if user is not authenticated - they'll see the login prompt
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load review words')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateQuizQuestion = (index: number, items: ReviewItem[]) => {
    if (index >= items.length) return

    const currentWord = items[index].word
    const allWords = items.map(item => item.word)

    // Randomly choose between meaning or pinyin quiz
    const quizType: QuizMode = Math.random() > 0.5 ? 'meaning' : 'pinyin'

    // Get 3 wrong options
    const wrongWords = allWords
      .filter(w => w.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    // Create options array
    const correctIndex = Math.floor(Math.random() * 4)
    const options: string[] = []

    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push(quizType === 'meaning' ? currentWord.english : currentWord.pinyin)
      } else {
        const wrongWord = wrongWords[options.length - (i < correctIndex ? 0 : 1)]
        if (wrongWord) {
          options.push(quizType === 'meaning' ? wrongWord.english : wrongWord.pinyin)
        }
      }
    }

    setQuizQuestion({ type: quizType, options, correctIndex })
    setSelectedAnswer(null)
    setShowQuizResult(false)
    setIsCorrectAnswer(false)
    setShowAnswer(false)
  }

  const loadStats = async () => {
    try {
      const data = await learningApi.getStats(hskLevel)
      setStats(data.stats)
    } catch (error: any) {
      // Silently fail for stats - not critical
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Failed to load stats:', error)
      }
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (!quizQuestion) return

    setSelectedAnswer(answerIndex)
    const correct = answerIndex === quizQuestion.correctIndex
    setIsCorrectAnswer(correct)
    setShowQuizResult(true)

    // Auto-show full answer after a brief delay
    setTimeout(() => {
      setShowAnswer(true)
    }, 800)
  }

  const handleReview = async (quality: number) => {
    const currentItem = reviewItems[currentIndex]
    if (!currentItem) return

    try {
      // Auto-adjust quality based on quiz result if quiz was attempted
      let finalQuality = quality
      if (selectedAnswer !== null && showQuizResult) {
        // If they got quiz right, boost the quality
        if (isCorrectAnswer) {
          finalQuality = Math.max(quality, 4) // At least "easy"
        } else {
          // If they got quiz wrong, cap the quality
          finalQuality = Math.min(quality, 2) // At most "hard"
        }
      }

      await learningApi.recordReview(currentItem.word.id, finalQuality)

      // Update session stats
      setSessionStats(prev => {
        const newStats = { ...prev, completed: prev.completed + 1 }
        if (finalQuality === 5) newStats.perfect++
        else if (finalQuality >= 3) newStats.good++
        else if (finalQuality >= 2) newStats.hard++
        else newStats.wrong++
        return newStats
      })

      // Show feedback
      const feedbackMessages = {
        5: 'Perfect! You mastered this word!',
        4: 'Excellent! Great recall!',
        3: 'Good job! Keep it up!',
        2: 'Not bad, needs more practice',
        1: 'Hard, but you got it',
        0: 'Keep trying! Practice makes perfect'
      }
      toast.success(feedbackMessages[finalQuality as keyof typeof feedbackMessages])

      // Move to next word
      setTimeout(() => {
        if (currentIndex < reviewItems.length - 1) {
          const nextIndex = currentIndex + 1
          setCurrentIndex(nextIndex)
          generateQuizQuestion(nextIndex, reviewItems)
        } else {
          // Session complete
          toast.success(`Review session complete! You reviewed ${reviewItems.length} words.`)
        }
      }, 1000)

    } catch (error) {
      console.error('Failed to record review:', error)
      toast.error('Failed to record review')
    }
  }

  // const resetSession = () => {
  //   setCurrentIndex(0)
  //   setShowAnswer(false)
  //   setSessionStats({
  //     total: reviewItems.length,
  //     completed: 0,
  //     perfect: 0,
  //     good: 0,
  //     hard: 0,
  //     wrong: 0
  //   })
  // }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <Brain className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-500 mb-6 text-sm">You need to be logged in to access the review feature.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Go to Login
          </button>
        </div>
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

  const currentItem = reviewItems[currentIndex]
  const isSessionComplete = sessionStats.completed >= reviewItems.length

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" />
              Spaced Repetition Review
            </h1>
            <p className="text-sm text-gray-500">Review words at optimal intervals for maximum retention</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHskLevel(undefined)}
              className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${hskLevel === undefined ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setHskLevel(level)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${hskLevel === level ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
            <div className="bg-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg shadow-indigo-500/20">
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Learning</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.total_words_learning}</div>
            </div>
            <div className="bg-emerald-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium">Mastered</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.mastered_words}</div>
            </div>
            <div className="bg-orange-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg shadow-orange-500/20">
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Due Today</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.due_for_review}</div>
            </div>
            <div className="bg-violet-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg shadow-violet-500/20">
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Total Reviews</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.total_reviews}</div>
            </div>
            <div className="bg-pink-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg shadow-pink-500/20 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Accuracy</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.accuracy.toFixed(0)}%</div>
            </div>
          </div>
        )}
      </div>

      {reviewItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <div className="p-8 sm:p-12 text-center">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              You have no words due for review right now. Great job!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/practice')}
                className="bg-indigo-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Start Learning New Words
              </button>
              <button
                onClick={() => navigate('/vocabulary')}
                className="border-2 border-gray-200 text-gray-700 rounded-2xl px-6 py-3 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Browse Vocabulary
              </button>
            </div>
          </div>
        </div>
      ) : isSessionComplete ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <div className="p-8 sm:p-12 text-center">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Session Complete!</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
              <div className="bg-emerald-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl sm:text-3xl font-bold">{sessionStats.perfect}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">Perfect</div>
              </div>
              <div className="bg-indigo-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl sm:text-3xl font-bold">{sessionStats.good}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">Good</div>
              </div>
              <div className="bg-orange-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl sm:text-3xl font-bold">{sessionStats.hard}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">Hard</div>
              </div>
              <div className="bg-red-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl sm:text-3xl font-bold">{sessionStats.wrong}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">Wrong</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => loadReviewWords()}
                className="bg-indigo-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Start New Session
              </button>
              <button
                onClick={() => navigate('/practice')}
                className="border-2 border-gray-200 text-gray-700 rounded-2xl px-6 py-3 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Practice More Words
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress: {sessionStats.completed} / {sessionStats.total}</span>
              <span>{Math.round((sessionStats.completed / sessionStats.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(sessionStats.completed / sessionStats.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Review Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
                <div className="p-6 sm:p-8 md:p-10">
                  {/* Days Overdue Badge */}
                  {currentItem && currentItem.days_overdue > 0 && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                        <Clock className="w-3.5 h-3.5" />
                        {currentItem.days_overdue} day{currentItem.days_overdue > 1 ? 's' : ''} overdue
                      </span>
                    </div>
                  )}

                  {/* Question */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="text-7xl sm:text-8xl md:text-9xl font-bold mb-4 text-gray-900"
                      style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}>
                      {currentItem?.word.simplified}
                    </div>
                    <div className="text-base sm:text-lg text-gray-500">
                      {quizQuestion?.type === 'meaning'
                        ? 'What does this character mean?'
                        : 'What is the pinyin pronunciation?'}
                    </div>
                  </div>

                  {/* Quiz Result Feedback */}
                  {showQuizResult && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-center mb-6 p-4 rounded-2xl border-2 ${
                        isCorrectAnswer
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {isCorrectAnswer ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-base font-semibold">Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-red-700">
                          <XCircle className="w-5 h-5" />
                          <span className="text-base font-semibold">Incorrect – See the answer below</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Multiple Choice Quiz */}
                  {!showAnswer && quizQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 sm:mb-8"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quizQuestion.options.map((option, index) => {
                          const isSelected = selectedAnswer === index
                          const isCorrect = index === quizQuestion.correctIndex
                          const showResult = showQuizResult

                          let btnClass = 'w-full p-4 sm:p-5 text-left rounded-2xl border-2 transition-all cursor-pointer font-medium'
                          if (showResult) {
                            if (isCorrect) {
                              btnClass += ' border-emerald-400 bg-emerald-50 text-emerald-900'
                            } else if (isSelected && !isCorrect) {
                              btnClass += ' border-red-400 bg-red-50 text-red-900'
                            } else {
                              btnClass += ' border-gray-200 bg-gray-50 text-gray-400'
                            }
                          } else {
                            btnClass += isSelected
                              ? ' border-indigo-500 bg-indigo-50 text-indigo-900'
                              : ' border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-800'
                          }

                          return (
                            <button
                              key={index}
                              className={btnClass}
                              onClick={() => !showQuizResult && handleQuizAnswer(index)}
                              disabled={showQuizResult}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-base sm:text-lg">{option}</span>
                                {showResult && isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Answer */}
                  <AnimatePresence>
                    {showAnswer && currentItem && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center mb-6 sm:mb-8 p-5 sm:p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                            {currentItem.word.pinyin}
                          </div>
                          <AudioButton
                            text={currentItem.word.simplified}
                            language="zh-CN"
                            size="md"
                            variant="secondary"
                            tooltipText="Hear the pronunciation"
                          />
                        </div>
                        <div className="text-lg sm:text-xl text-gray-800 mb-3">
                          {currentItem.word.english}
                        </div>
                        {currentItem.word.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            {currentItem.word.category}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  {!showAnswer ? (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="border-2 border-gray-200 text-gray-700 rounded-2xl px-8 py-3.5 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        Skip Quiz – Show Answer
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center text-sm text-gray-500 mb-3">How well did you know this?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <button
                          onClick={() => handleReview(0)}
                          className="py-4 px-3 rounded-2xl border-2 border-red-200 hover:bg-red-50 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-gray-900 text-sm">Wrong</span>
                          </div>
                          <div className="text-xs text-gray-500">Completely forgot</div>
                        </button>
                        <button
                          onClick={() => handleReview(2)}
                          className="py-4 px-3 rounded-2xl border-2 border-orange-200 hover:bg-orange-50 transition-all text-left cursor-pointer"
                        >
                          <div className="font-bold text-gray-900 text-sm mb-0.5">Hard</div>
                          <div className="text-xs text-gray-500">Difficult to recall</div>
                        </button>
                        <button
                          onClick={() => handleReview(3)}
                          className="py-4 px-3 rounded-2xl border-2 border-blue-200 hover:bg-blue-50 transition-all text-left cursor-pointer"
                        >
                          <div className="font-bold text-gray-900 text-sm mb-0.5">Good</div>
                          <div className="text-xs text-gray-500">Remembered with effort</div>
                        </button>
                        <button
                          onClick={() => handleReview(4)}
                          className="py-4 px-3 rounded-2xl border-2 border-emerald-200 hover:bg-emerald-50 transition-all text-left cursor-pointer"
                        >
                          <div className="font-bold text-gray-900 text-sm mb-0.5">Easy</div>
                          <div className="text-xs text-gray-500">Quick recall</div>
                        </button>
                        <button
                          onClick={() => handleReview(5)}
                          className="py-4 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 col-span-2 sm:col-span-1 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-bold text-sm">Perfect</div>
                            <div className="text-xs opacity-80">Instant recall</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
