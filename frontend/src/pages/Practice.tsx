import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vocabularyApi, learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import AudioButton from '@/components/AudioButton'
import {
  GraduationCap,
  RefreshCw,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  Trophy
} from 'lucide-react'
import { toast } from 'react-hot-toast'

type LearningMode = 'learn' | 'review' | 'test'
type QuestionType = 'recognition' | 'meaning' | 'pinyin'

interface Question {
  word: HanziWord
  type: QuestionType
  options: string[]
  correctAnswer: number
}

export default function Practice() {
  const [mode, setMode] = useState<LearningMode | null>(null)
  const [hskLevel, setHskLevel] = useState(1)
  const [words, setWords] = useState<HanziWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // Test mode state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [testComplete, setTestComplete] = useState(false)

  const loadWords = async () => {
    setLoading(true)
    try {
      let wordsToUse: HanziWord[] = []

      if (mode === 'learn') {
        // Get new words for learning (words not yet started)
        const data = await learningApi.getNewWords(hskLevel, 20)
        wordsToUse = data.words || []
      } else if (mode === 'review') {
        // Get words due for review (SRS system)
        const data = await learningApi.getReviewWords(hskLevel)
        wordsToUse = (data.reviews || []).map((r: any) => r.word)
      } else if (mode === 'test') {
        // Get words for testing (learned words)
        const data = await learningApi.getTestWords(hskLevel, 20)
        wordsToUse = (data.words || []).map((w: any) => w.word)
      }

      setWords(wordsToUse)

      if (mode === 'test' && wordsToUse.length > 0) {
        generateQuestions(wordsToUse)
      } else if (mode === 'test' && wordsToUse.length === 0) {
        toast.error('No words available for testing. Practice more words first!')
      }
    } catch (error: any) {
      console.error('Failed to load words:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(`Failed to load vocabulary: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = (wordList: HanziWord[]) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5).slice(0, 10)
    const qs: Question[] = shuffled.map(word => {
      const questionTypes: QuestionType[] = ['recognition', 'meaning', 'pinyin']
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]

      // Generate 3 wrong options + 1 correct
      const wrongWords = wordList
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      let options: string[] = []
      let correctAnswer = Math.floor(Math.random() * 4)

      if (type === 'recognition') {
        // Show pinyin/english, ask for character
        options = wrongWords.map(w => w.simplified)
        options.splice(correctAnswer, 0, word.simplified)
      } else if (type === 'meaning') {
        // Show character, ask for meaning
        options = wrongWords.map(w => w.english)
        options.splice(correctAnswer, 0, word.english)
      } else {
        // Show character, ask for pinyin
        options = wrongWords.map(w => w.pinyin)
        options.splice(correctAnswer, 0, word.pinyin)
      }

      return { word, type, options, correctAnswer }
    })

    setQuestions(qs)
  }

  const handleModeSelect = (selectedMode: LearningMode) => {
    setMode(selectedMode)
    setCurrentWordIndex(0)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTestComplete(false)
    setSelectedAnswer(null)
  }

  useEffect(() => {
    if (mode) {
      loadWords()
    }
  }, [mode, hskLevel])

  const handleNextWord = async (knewIt: boolean = true) => {
    if (mode === 'learn' || mode === 'review') {
      // Track progress using SRS system
      try {
        const currentWord = words[currentWordIndex]
        // Quality ratings:
        // Learn mode: 3 (good) - they're seeing it for the first time
        // Review mode: 4 (easy) if they knew it without revealing, 2 (hard) if they revealed
        let quality = 3 // default for learn mode

        if (mode === 'review') {
          quality = knewIt ? 4 : 2
        }

        await learningApi.recordReview(currentWord.id, quality)
      } catch (error) {
        console.error('Failed to update progress:', error)
      }
    }

    // Reset showAnswer for next word
    setShowAnswer(false)

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      toast.success('Great job! You completed this set!')
      setMode(null)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)
    const question = questions[currentQuestionIndex]

    if (answerIndex === question.correctAnswer) {
      setScore(score + 1)
      toast.success('Correct!', { icon: '✅' })
    } else {
      toast.error('Incorrect', { icon: '❌' })
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
      } else {
        setTestComplete(true)
      }
    }, 1500)
  }

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Practice & Learn
        </h1>
        <p className="text-xl text-gray-600">
          Choose your learning mode and HSK level
        </p>
      </motion.div>

      {/* HSK Level Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <h3 className="text-lg font-semibold mb-4">Select HSK Level</h3>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <Button
                key={level}
                variant={hskLevel === level ? 'primary' : 'secondary'}
                onClick={() => setHskLevel(level)}
              >
                HSK {level}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleModeSelect('learn')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Learn Mode
            </h3>
            <p className="text-gray-600 mb-4">
              Study new words with flashcards. See the character, pinyin, and meaning.
            </p>
            <Badge variant="default">Beginner Friendly</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleModeSelect('review')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Review Mode
            </h3>
            <p className="text-gray-600 mb-4">
              Test yourself without seeing the answer first. Hide the meaning until you're ready!
            </p>
            <Badge variant="default">Active Recall</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleModeSelect('test')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Test Mode
            </h3>
            <p className="text-gray-600 mb-4">
              Quiz yourself with multiple choice questions. Track your score!
            </p>
            <Badge variant="default">Challenge</Badge>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  const renderLearnMode = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (words.length === 0) {
      return (
        <div className="max-w-2xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No Words Available</h2>
          <p className="text-gray-600 mb-6">
            {mode === 'learn' && 'All words for this level have been started. Try a different HSK level!'}
            {mode === 'review' && 'No words due for review right now. Great job staying on top of your reviews!'}
          </p>
          <Button onClick={() => setMode(null)}>Back to Menu</Button>
        </div>
      )
    }

    const currentWord = words[currentWordIndex]
    const progress = ((currentWordIndex + 1) / words.length) * 100
    const isReviewMode = mode === 'review'

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => setMode(null)}>
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="default">
                {isReviewMode ? 'Review Mode' : 'Learn Mode'}
              </Badge>
              <span className="text-sm text-gray-600">
                {currentWordIndex + 1} / {words.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isReviewMode
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 text-center">
              <div className="mb-8">
                <div className="text-8xl font-chinese text-gray-900 mb-6">
                  {currentWord.simplified}
                </div>

                {/* Learn mode: Show info immediately */}
                {mode === 'learn' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-3xl text-primary-600 font-semibold">
                        {currentWord.pinyin}
                      </div>
                      <AudioButton
                        text={currentWord.simplified}
                        language="zh-CN"
                        size="md"
                        variant="secondary"
                        tooltipText="Hear the pronunciation"
                      />
                    </div>
                    <div className="text-2xl text-gray-700">
                      {currentWord.english}
                    </div>
                    {currentWord.category && (
                      <Badge variant="default" className="text-sm">
                        {currentWord.category}
                      </Badge>
                    )}
                  </motion.div>
                )}

                {/* Review mode: Hide until user clicks */}
                {mode === 'review' && showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-3xl text-primary-600 font-semibold">
                        {currentWord.pinyin}
                      </div>
                      <AudioButton
                        text={currentWord.simplified}
                        language="zh-CN"
                        size="md"
                        variant="secondary"
                        tooltipText="Hear the pronunciation"
                      />
                    </div>
                    <div className="text-2xl text-gray-700">
                      {currentWord.english}
                    </div>
                    {currentWord.category && (
                      <Badge variant="default" className="text-sm">
                        {currentWord.category}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                {mode === 'learn' ? (
                  <Button onClick={handleNextWord} size="lg" variant="primary">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Next Word
                  </Button>
                ) : (
                  <>
                    {!showAnswer ? (
                      <Button onClick={() => setShowAnswer(true)} size="lg">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Show Answer
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => handleNextWord(true)} size="lg" variant="primary">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          I Knew It!
                        </Button>
                        <Button onClick={() => handleNextWord(false)} size="lg" variant="secondary">
                          <XCircle className="w-5 h-5 mr-2" />
                          Missed It
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Hint card */}
        {mode === 'learn' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Learn Mode:</strong> Take your time to study each character.
                All information is shown to help you learn.
              </p>
            </Card>
          </motion.div>
        )}

        {mode === 'review' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm text-green-900">
                <strong>Review Mode:</strong> Try to recall the meaning before revealing the answer.
                Active recall strengthens memory!
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    )
  }

  const renderTestMode = () => {
    if (loading || questions.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (testComplete) {
      const percentage = Math.round((score / questions.length) * 100)
      const passed = percentage >= 70

      return (
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <div className="mb-8">
                {passed ? (
                  <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                ) : (
                  <Target className="w-24 h-24 mx-auto text-gray-400" />
                )}
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {passed ? 'Congratulations!' : 'Good Effort!'}
              </h2>

              <div className="text-6xl font-bold text-primary-600 mb-6">
                {percentage}%
              </div>

              <p className="text-xl text-gray-600 mb-8">
                You got {score} out of {questions.length} correct
              </p>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setMode(null)} size="lg" variant="secondary">
                  Back to Menu
                </Button>
                <Button onClick={() => handleModeSelect('test')} size="lg">
                  Try Again
                </Button>
              </div>
            </motion.div>
          </Card>
        </div>
      )
    }

    const question = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => setMode(null)}>
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-sm font-semibold text-primary-600">
                Score: {score}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="p-8">
              <div className="mb-8">
                <Badge variant="default" className="mb-4">
                  {question.type === 'recognition' && 'Character Recognition'}
                  {question.type === 'meaning' && 'Meaning'}
                  {question.type === 'pinyin' && 'Pinyin'}
                </Badge>

                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {question.type === 'recognition' && `What character is "${question.word.pinyin}" (${question.word.english})?`}
                  {question.type === 'meaning' && `What does "${question.word.simplified}" mean?`}
                  {question.type === 'pinyin' && `What is the pinyin for "${question.word.simplified}"?`}
                </h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === question.correctAnswer
                  const showResult = selectedAnswer !== null

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        showResult && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : showResult && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-lg ${question.type === 'recognition' ? 'text-4xl font-chinese' : ''}`}>
                          {option}
                        </span>
                        {showResult && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {!mode && renderModeSelection()}
      {(mode === 'learn' || mode === 'review') && renderLearnMode()}
      {mode === 'test' && renderTestMode()}
    </div>
  )
}
