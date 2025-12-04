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
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

interface ReviewItem {
  word: HanziWord
  progress: any
  days_overdue: number
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
    } catch (error) {
      console.error('Failed to load review words:', error)
      toast.error('Failed to load review words')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await learningApi.getStats(hskLevel)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleReview = async (quality: number) => {
    const currentItem = reviewItems[currentIndex]
    if (!currentItem) return

    try {
      await learningApi.recordReview(currentItem.word.id, quality)

      // Update session stats
      setSessionStats(prev => {
        const newStats = { ...prev, completed: prev.completed + 1 }
        if (quality === 5) newStats.perfect++
        else if (quality >= 3) newStats.good++
        else if (quality >= 2) newStats.hard++
        else newStats.wrong++
        return newStats
      })

      // Show feedback
      const feedbackMessages = {
        5: '🎉 Perfect! You mastered this word!',
        4: '✨ Excellent! Great recall!',
        3: '👍 Good job! Keep it up!',
        2: '📚 Not bad, needs more practice',
        1: '🔄 Hard, but you got it',
        0: '💪 Keep trying! Practice makes perfect'
      }
      toast.success(feedbackMessages[quality as keyof typeof feedbackMessages])

      // Move to next word
      setTimeout(() => {
        if (currentIndex < reviewItems.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowAnswer(false)
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

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionStats({
      total: reviewItems.length,
      completed: 0,
      perfect: 0,
      good: 0,
      hard: 0,
      wrong: 0
    })
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to access the review feature.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading your review words...</p>
      </div>
    )
  }

  const currentItem = reviewItems[currentIndex]
  const isSessionComplete = sessionStats.completed >= reviewItems.length

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Brain className="text-primary-600" />
              Spaced Repetition Review
            </h1>
            <p className="text-gray-600">Review words at optimal intervals for maximum retention</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setHskLevel(undefined)}>
              All Levels
            </Button>
            {[1, 2, 3, 4].map((level) => (
              <Button
                key={level}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">
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
          <div className="text-6xl mb-4">🎊</div>
          <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{sessionStats.perfect}</div>
              <div className="text-sm text-gray-600">Perfect</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.good}</div>
              <div className="text-sm text-gray-600">Good</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{sessionStats.hard}</div>
              <div className="text-sm text-gray-600">Hard</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{sessionStats.wrong}</div>
              <div className="text-sm text-gray-600">Wrong</div>
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
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {sessionStats.completed} / {sessionStats.total}</span>
              <span>{Math.round((sessionStats.completed / sessionStats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
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
                  <div className="text-8xl md:text-9xl font-bold mb-6 text-gray-900">
                    {currentItem?.word.simplified}
                  </div>
                  <div className="text-2xl text-gray-500 mb-2">
                    What does this character mean?
                  </div>
                </div>

                {/* Answer (Hidden initially) */}
                <AnimatePresence>
                  {showAnswer && currentItem && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center mb-8 p-6 bg-gray-50 rounded-lg"
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
                      <div className="text-2xl text-gray-800 mb-4">
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
                      className="px-12"
                    >
                      Show Answer
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600 mb-4">How well did you know this?</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="py-6 border-red-300 hover:bg-red-50"
                        onClick={() => handleReview(0)}
                      >
                        <XCircle className="w-5 h-5 mr-2 text-red-500" />
                        <div className="text-left">
                          <div className="font-bold">Wrong</div>
                          <div className="text-xs text-gray-500">Completely forgot</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-orange-300 hover:bg-orange-50"
                        onClick={() => handleReview(2)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Hard</div>
                          <div className="text-xs text-gray-500">Difficult to recall</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-blue-300 hover:bg-blue-50"
                        onClick={() => handleReview(3)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Good</div>
                          <div className="text-xs text-gray-500">Remembered with effort</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-green-300 hover:bg-green-50"
                        onClick={() => handleReview(4)}
                      >
                        <div className="text-left">
                          <div className="font-bold">Easy</div>
                          <div className="text-xs text-gray-500">Quick recall</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="py-6 border-purple-300 hover:bg-purple-50 md:col-span-2"
                        onClick={() => handleReview(5)}
                      >
                        <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />
                        <div className="text-left">
                          <div className="font-bold">Perfect</div>
                          <div className="text-xs text-gray-500">Instant recall</div>
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
