import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { RefreshCw, Target, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import LearnReviewMode from './practice/LearnReviewMode'
import TestMode, { Question, QuestionType } from './practice/TestMode'

type LearningMode = 'learn' | 'review' | 'test'

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
  const [showMotivationalBreak, setShowMotivationalBreak] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])

  const generateQuestions = (wordList: HanziWord[]) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5).slice(0, 10)
    const qs: Question[] = shuffled.map(word => {
      const questionTypes: QuestionType[] = ['recognition', 'meaning', 'pinyin']
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]

      const wrongWords = wordList
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      let options: string[] = []
      const correctAnswer = Math.floor(Math.random() * 4)

      if (type === 'recognition') {
        options = wrongWords.map(w => w.simplified)
        options.splice(correctAnswer, 0, word.simplified)
      } else if (type === 'meaning') {
        options = wrongWords.map(w => w.english)
        options.splice(correctAnswer, 0, word.english)
      } else {
        options = wrongWords.map(w => w.pinyin)
        options.splice(correctAnswer, 0, word.pinyin)
      }

      return { word, type, options, correctAnswer }
    })

    setQuestions(qs)
  }

  const loadWords = async () => {
    setLoading(true)
    try {
      let wordsToUse: HanziWord[] = []

      if (mode === 'learn') {
        const data = await learningApi.getNewWords(hskLevel, 20)
        wordsToUse = data.words || []
      } else if (mode === 'review') {
        const data = await learningApi.getReviewWords(hskLevel)
        wordsToUse = (data.reviews || []).map((r: { word: HanziWord }) => r.word)
      } else if (mode === 'test') {
        const data = await learningApi.getTestWords(hskLevel, 20)
        wordsToUse = (data.words || []).map((w: { word: HanziWord }) => w.word)
      }

      setWords(wordsToUse)

      if (mode === 'test' && wordsToUse.length > 0) {
        generateQuestions(wordsToUse)
      } else if (mode === 'test' && wordsToUse.length === 0) {
        toast.error('No words available for testing. Practice more words first!')
      }
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      if (err.response?.status !== 401) {
        console.error('Failed to load words:', error)
        toast.error(`Failed to load vocabulary: ${err.response?.data?.detail || err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelect = (selectedMode: LearningMode) => {
    setMode(selectedMode)
    setCurrentWordIndex(0)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTestComplete(false)
    setSelectedAnswer(null)
    setShowMotivationalBreak(false)
    setUserAnswers([])
  }

  const handleTryAgain = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setTestComplete(false)
    setSelectedAnswer(null)
    setShowMotivationalBreak(false)
    setUserAnswers([])
    loadWords()
  }

  useEffect(() => {
    if (mode) {
      loadWords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hskLevel])

  const handleNextWord = (knewIt: boolean = true) => {
    if (mode === 'learn' || mode === 'review') {
      const currentWord = words[currentWordIndex]
      const quality = mode === 'review' ? (knewIt ? 4 : 2) : 3
      learningApi.recordReview(currentWord.id, quality).catch(err =>
        console.error('Failed to update progress:', err)
      )
    }

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
    setUserAnswers(prev => [...prev, answerIndex])
    const question = questions[currentQuestionIndex]

    if (answerIndex === question.correctAnswer) {
      setScore(score + 1)
      toast.success('Correct!')
    } else {
      toast.error('Incorrect')
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        if (nextIndex % 5 === 0 && nextIndex < questions.length - 1) {
          setShowMotivationalBreak(true)
        } else {
          setCurrentQuestionIndex(nextIndex)
          setSelectedAnswer(null)
        }
      } else {
        setTestComplete(true)
      }
    }, 800)
  }

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Practice & Learn
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Choose your learning mode and HSK level
        </p>
      </motion.div>

      {/* HSK Level Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Select HSK Level</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => setHskLevel(level)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  hskLevel === level
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleModeSelect('learn')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Learn Mode</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Study new words with flashcards. See the character, pinyin, and meaning.
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Beginner Friendly
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleModeSelect('review')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Review Mode</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Test yourself without seeing the answer first. Hide the meaning until you're ready!
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Active Recall
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleModeSelect('test')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Test Mode</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Quiz yourself with multiple choice questions. Track your score!
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Challenge
          </span>
        </motion.div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {!mode && renderModeSelection()}

      {(mode === 'learn' || mode === 'review') && (
        <LearnReviewMode
          words={words}
          currentWordIndex={currentWordIndex}
          mode={mode}
          showAnswer={showAnswer}
          loading={loading}
          onShowAnswer={() => setShowAnswer(true)}
          onNextWord={handleNextWord}
          onBack={() => setMode(null)}
        />
      )}

      {mode === 'test' && (
        <TestMode
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={selectedAnswer}
          score={score}
          testComplete={testComplete}
          showMotivationalBreak={showMotivationalBreak}
          userAnswers={userAnswers}
          loading={loading}
          onAnswerSelect={handleAnswerSelect}
          onTryAgain={handleTryAgain}
          onBack={() => setMode(null)}
          onContinueFromBreak={() => {
            setShowMotivationalBreak(false)
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedAnswer(null)
          }}
        />
      )}
    </div>
  )
}
