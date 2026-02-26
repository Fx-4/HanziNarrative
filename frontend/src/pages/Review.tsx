import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to access the review feature.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <LoadingSpinner />
        <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your review words...</p>
      </div>
    )
  }

  const currentItem = reviewItems[currentIndex]
  const isSessionComplete = sessionStats.completed >= reviewItems.length

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              Spaced Repetition Review
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Review words at optimal intervals for maximum retention</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setHskLevel(undefined)}>
              All Levels
            </Button>
            {[1, 2, 3, 4].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={hskLevel === level ? 'primary' : 'outline'}
                onClick={() => setHskLevel(level)}
              >
                HSK {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Learning</span>
              </div>
              <div className="text-2xl font-bold">{stats.total_words_learning}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Mastered</span>
              </div>
              <div className="text-2xl font-bold">{stats.mastered_words}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Due Today</span>
              </div>
              <div className="text-2xl font-bold">{stats.due_for_review}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Total Reviews</span>
              </div>
              <div className="text-2xl font-bold">{stats.total_reviews}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-pink-600 mb-1">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold">{stats.accuracy.toFixed(0)}%</div>
            </Card>
          </div>
        )}
      </div>

      {reviewItems.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You have no words due for review right now. Great job!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/practice')}>
              Start Learning New Words
            </Button>
            <Button variant="outline" onClick={() => navigate('/vocabulary')}>
              Browse Vocabulary
            </Button>
          </div>
        </Card>
      ) : isSessionComplete ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">{sessionStats.perfect}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Perfect</div>
            </div>
            <div className="bg-info-50 dark:bg-info-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-info-600 dark:text-info-400">{sessionStats.good}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Good</div>
            </div>
            <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">{sessionStats.hard}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hard</div>
            </div>
            <div className="bg-error-50 dark:bg-error-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-error-600 dark:text-error-400">{sessionStats.wrong}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => loadReviewWords()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
            <Button variant="outline" onClick={() => navigate('/practice')}>
              Practice More Words
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Progress: {sessionStats.completed} / {sessionStats.total}</span>
              <span>{Math.round((sessionStats.completed / sessionStats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(sessionStats.completed / sessionStats.total) * 100}%` }}
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
              <Card className="p-8 md:p-12">
                {/* Days Overdue Badge */}
                {currentItem && currentItem.days_overdue > 0 && (
                  <div className="mb-4">
                    <Badge variant="warning">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentItem.days_overdue} day{currentItem.days_overdue > 1 ? 's' : ''} overdue
                    </Badge>
                  </div>
                )}

                {/* Question */}
                <div className="text-center mb-8">
                  <div className="text-8xl md:text-9xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    {currentItem?.word.simplified}
                  </div>
                  <div className="text-2xl text-gray-600 mb-2">
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
                    className={`text-center mb-6 p-4 rounded-lg ${
                      isCorrectAnswer
                        ? 'bg-success-50 dark:bg-success-900/20 border-2 border-success-300 dark:border-success-700'
                        : 'bg-error-50 dark:bg-error-900/20 border-2 border-error-300 dark:border-error-700'
                    }`}
                  >
                    {isCorrectAnswer ? (
                      <div className="flex items-center justify-center gap-2 text-success-700 dark:text-success-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-error-700 dark:text-error-400">
                        <XCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">Incorrect - See the answer below</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Multiple Choice Quiz - Show before answer */}
                {!showAnswer && quizQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrect = index === quizQuestion.correctIndex
                        const showResult = showQuizResult

                        let buttonClass = "py-4 px-6 text-left transition-all"
                        if (showResult) {
                          if (isCorrect) {
                            buttonClass += " border-success-500 bg-success-50 dark:bg-success-900/20 text-success-900 dark:text-success-200"
                          } else if (isSelected && !isCorrect) {
                            buttonClass += " border-error-500 bg-error-50 dark:bg-error-900/20 text-error-900 dark:text-error-200"
                          } else {
                            buttonClass += " border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }
                        } else {
                          buttonClass += isSelected
                            ? " border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : " border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        }

                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={buttonClass}
                            onClick={() => !showQuizResult && handleQuizAnswer(index)}
                            disabled={showQuizResult}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-lg">{option}</span>
                              {showResult && isCorrect && (
                                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Answer (Show after quiz attempt) */}
                <AnimatePresence>
                  {showAnswer && currentItem && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center mb-8 p-6 bg-gradient-to-br from-primary-50 to-info-50 dark:from-primary-900/20 dark:to-info-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-700"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-3xl font-bold text-primary-600">
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
                      <div className="text-2xl text-gray-800 dark:text-gray-200 mb-4">
                        {currentItem.word.english}
                      </div>
                      {currentItem.word.category && (
                        <Badge>{currentItem.word.category}</Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                {!showAnswer ? (
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => setShowAnswer(true)}
                      variant="outline"
                      className="px-12"
                    >
                      Skip Quiz - Show Answer
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-4">How well did you know this?</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="py-6 border-error-300 dark:border-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
                        onClick={() => handleReview(0)}
                      >
                        <XCircle className="w-5 h-5 mr-2 text-error-500" />
                        <div className="text-left">
                          <div className="font-bold">Wrong</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completely forgot</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-warning-300 dark:border-warning-700 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                        onClick={() => handleReview(2)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Hard</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Difficult to recall</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-info-300 dark:border-info-700 hover:bg-info-50 dark:hover:bg-info-900/20"
                        onClick={() => handleReview(3)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Good</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Remembered with effort</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-success-300 dark:border-success-700 hover:bg-success-50 dark:hover:bg-success-900/20"
                        onClick={() => handleReview(4)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Easy</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Quick recall</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 md:col-span-2"
                        onClick={() => handleReview(5)}
                      >
                        <CheckCircle className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                        <div className="text-left">
                          <div className="font-bold">Perfect</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Instant recall</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
