import { useState } from 'react'
import { motion } from 'framer-motion'
import { quizApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Brain, CheckCircle, XCircle, Trophy, RotateCcw, Flame, Star, Dumbbell, Target, Gem, Check, PenLine, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

type QuizType = 'multiple_choice' | 'fill_blank' | 'character_match'

// Motivational messages based on performance
const getMotivationalMessage = (percentage: number) => {
  if (percentage >= 90) {
    return {
      Icon: Flame,
      iconClass: 'text-orange-500',
      title: 'Absolutely Crushing It!',
      message: 'Your Chinese skills are on fire! You\'re a HSK superstar!',
      color: 'from-orange-400 to-red-500'
    }
  } else if (percentage >= 80) {
    return {
      Icon: Star,
      iconClass: 'text-yellow-500',
      title: 'Excellent Work!',
      message: 'You\'re mastering Chinese like a pro! Keep this momentum going!',
      color: 'from-yellow-400 to-orange-500'
    }
  } else if (percentage >= 70) {
    return {
      Icon: Dumbbell,
      iconClass: 'text-purple-500',
      title: 'Great Job!',
      message: 'You\'re making solid progress! Your dedication is paying off!',
      color: 'from-purple-400 to-pink-500'
    }
  } else if (percentage >= 60) {
    return {
      Icon: Target,
      iconClass: 'text-blue-500',
      title: 'Good Effort!',
      message: 'You\'re on the right track! A bit more practice and you\'ll nail it!',
      color: 'from-blue-400 to-purple-500'
    }
  } else {
    return {
      Icon: Gem,
      iconClass: 'text-cyan-500',
      title: 'Keep Going!',
      message: 'Every mistake is a learning opportunity! You got this - practice makes perfect!',
      color: 'from-cyan-400 to-blue-500'
    }
  }
}

interface CharacterMatchQuestion {
  id: number
  chinese: string
  pinyin: string
  english: string
  word_id: number
}

interface MultipleChoiceQuestion {
  question: string
  options: string[]
  correct_answer: number  // Fixed: should be number (index), not string
  explanation?: string
  chinese?: string
  pinyin?: string
  english?: string
}

interface FillBlankQuestion {
  sentence: string
  blank_word: string
  pinyin: string
  hint: string
  english?: string
}

type QuizQuestion = CharacterMatchQuestion | MultipleChoiceQuestion | FillBlankQuestion

interface Quiz {
  questions: QuizQuestion[]
}

export default function Quiz() {
  const [hskLevel, setHskLevel] = useState(1)
  const [quizType, setQuizType] = useState<QuizType>('multiple_choice')
  const [numQuestions, setNumQuestions] = useState(10)
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<string | number, string | number>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [leftItems, setLeftItems] = useState<CharacterMatchQuestion[]>([])
  const [rightItems, setRightItems] = useState<CharacterMatchQuestion[]>([])
  // Character match states
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [matches, setMatches] = useState<Record<number, number>>({})

  const quizTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', Icon: Check },
    { value: 'fill_blank', label: 'Fill in Blank', Icon: PenLine },
    { value: 'character_match', label: 'Character Match', Icon: RefreshCw }
  ]

  const startQuiz = async () => {
    setLoading(true)
    try {
      const data = await quizApi.generate(hskLevel, quizType, numQuestions)
      setQuiz(data)
      setAnswers({})
      setShowResults(false)
      setScore(0)
      // Initialize character match items
      if (quizType === 'character_match' && data.questions) {
        setLeftItems([...data.questions])
        setRightItems([...data.questions].sort(() => Math.random() - 0.5))
        setMatches({})
        setSelectedLeft(null)
        setSelectedRight(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = () => {
    if (!quiz) return

    let correctCount = 0
    const totalQuestions = quiz.questions.length

    if (quizType === 'multiple_choice') {
      quiz.questions.forEach((q, idx: number) => {
        const question = q as MultipleChoiceQuestion
        if (answers[idx] === question.correct_answer) correctCount++
      })
    } else if (quizType === 'fill_blank') {
      if (!quiz) return
      quiz.questions.forEach((q, idx: number) => {
        const question = q as FillBlankQuestion
        if (answers[idx]?.toString().trim().toLowerCase() === question.blank_word.toLowerCase()) correctCount++
      })
    } else if (quizType === 'character_match') {
      Object.keys(answers).forEach(key => {
        if (Number(answers[key]) === Number(key)) correctCount++
      })
    }

    setScore(correctCount)
    setShowResults(true)

    const percentage = Math.round((correctCount / totalQuestions) * 100)
    if (percentage >= 80) {
      toast.success(`Excellent! ${percentage}% correct!`)
    } else if (percentage >= 60) {
      toast(`Good job! ${percentage}% correct`)
    } else {
      toast(`Keep practicing! ${percentage}% correct`)
    }
  }

  const renderMultipleChoice = () => (
    <div className="space-y-4 sm:space-y-6">
      {quiz?.questions.map((q, idx: number) => {
        const question = q as MultipleChoiceQuestion
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer === question.correct_answer
        const isWrong = showResults && userAnswer !== undefined && userAnswer !== question.correct_answer

        return (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl border overflow-hidden p-4 sm:p-6 ${
              showResults
                ? isCorrect
                  ? 'border-emerald-400 dark:border-emerald-700'
                  : isWrong
                  ? 'border-red-400 dark:border-red-700'
                  : 'border-gray-100 dark:border-gray-800'
                : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Question {idx + 1}</h3>
              {showResults && (
                isCorrect
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  : isWrong
                  ? <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  : null
              )}
            </div>
            <p className="text-gray-900 dark:text-gray-100 mb-4 text-base sm:text-lg">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option: string, oIdx: number) => {
                const isSelected = userAnswer === oIdx
                const isCorrectOption = showResults && oIdx === question.correct_answer
                const isWrongOption = showResults && isSelected && oIdx !== question.correct_answer

                return (
                  <button
                    key={oIdx}
                    onClick={() => !showResults && setAnswers({ ...answers, [idx]: oIdx })}
                    disabled={showResults}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm sm:text-base ${
                      isCorrectOption
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400'
                        : isWrongOption
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                        : isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-700 dark:text-gray-300'
                    } disabled:cursor-default`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <strong>Answer:</strong> {question.chinese} ({question.pinyin}) - {question.english}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderFillBlank = () => (
    <div className="space-y-4 sm:space-y-6">
      {quiz?.questions.map((q, idx: number) => {
        const question = q as FillBlankQuestion
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer?.toString().trim().toLowerCase() === question.blank_word.toLowerCase()

        return (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl border overflow-hidden p-4 sm:p-6 ${
              showResults
                ? isCorrect
                  ? 'border-emerald-400 dark:border-emerald-700'
                  : 'border-red-400 dark:border-red-700'
                : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Question {idx + 1}</h3>
              {showResults && (
                isCorrect
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">
              <strong>Meaning:</strong> {question.english}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                disabled={showResults}
                placeholder="Type the Chinese character"
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-xl sm:text-2xl font-chinese bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-500"
              />
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <strong>Correct Answer:</strong> {question.blank_word} ({question.pinyin})
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderCharacterMatch = () => {
    const handleLeftClick = (id: number) => {
      if (matches[id]) return // Already matched
      setSelectedLeft(id)
      if (selectedRight !== null) {
        // Make a match
        setMatches({...matches, [id]: selectedRight})
        setAnswers({...answers, [id]: selectedRight})
        setSelectedLeft(null)
        setSelectedRight(null)
      }
    }

    const handleRightClick = (id: number) => {
      if (Object.values(matches).includes(id)) return // Already matched
      setSelectedRight(id)
      if (selectedLeft !== null) {
        // Make a match
        setMatches({...matches, [selectedLeft]: id})
        setAnswers({...answers, [selectedLeft]: id})
        setSelectedLeft(null)
        setSelectedRight(null)
      }
    }

    // Get matched English text for a Chinese word
    const getMatchedEnglish = (leftId: number) => {
      const rightId = matches[leftId]
      if (rightId !== undefined) {
        const matchedItem = rightItems.find(item => item.id === rightId)
        return matchedItem?.english
      }
      return null
    }

    // Check if match is correct by comparing word_id (not id which is shuffled)
    const isMatchCorrect = (leftId: number) => {
      const rightId = matches[leftId]
      if (!rightId) return false

      const leftItem = leftItems.find(item => item.id === leftId)
      const rightItem = rightItems.find(item => item.id === rightId)

      // Match is correct if both items represent the same vocabulary word
      return leftItem?.word_id === rightItem?.word_id
    }

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">Chinese Characters</h3>
            <div className="space-y-2">
              {leftItems.map((q) => {
                const matchedEnglish = getMatchedEnglish(q.id)
                const isCorrect = isMatchCorrect(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => handleLeftClick(q.id)}
                    className={`w-full p-3 sm:p-4 border-2 rounded-xl text-xl sm:text-2xl font-chinese transition-all text-center ${
                      matches[q.id]
                        ? isCorrect && showResults
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400'
                          : showResults
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400'
                        : selectedLeft === q.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400'
                        : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-gray-800 dark:text-gray-200'
                    } disabled:cursor-default`}
                    disabled={!!matches[q.id] || showResults}
                  >
                    <div className="flex flex-col items-center">
                      <span>{q.chinese}</span>
                      {matches[q.id] && (
                        <span className="text-xs sm:text-sm mt-1 text-gray-600 dark:text-gray-400 font-sans">
                          {showResults && (isCorrect ? '✓' : '✗')} → {matchedEnglish} {showResults && !isCorrect && `(Correct: ${q.english})`}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">English Meanings</h3>
            <div className="space-y-2">
              {rightItems.map((q) => {
                const isMatched = Object.values(matches).includes(q.id)
                // Find which Chinese character matched this English
                const matchedChineseId = Object.keys(matches).find(key => matches[Number(key)] === q.id)
                const matchedChinese = matchedChineseId ? leftItems.find(item => item.id === Number(matchedChineseId))?.chinese : null

                return (
                  <button
                    key={q.id}
                    onClick={() => handleRightClick(q.id)}
                    className={`w-full p-3 sm:p-4 border-2 rounded-xl text-sm sm:text-base transition-all text-center ${
                      isMatched
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400'
                        : selectedRight === q.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400'
                        : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-gray-800 dark:text-gray-200'
                    } disabled:cursor-default`}
                    disabled={isMatched || showResults}
                  >
                    <div className="flex flex-col items-center">
                      <span>{q.english}</span>
                      {isMatched && matchedChinese && (
                        <span className="text-xs sm:text-sm mt-1 text-gray-600 dark:text-gray-400 font-chinese">
                          ← {matchedChinese}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        {!showResults && (
          <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            Click a character, then click its matching meaning to pair them
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100">
          <Brain className="w-7 h-7 sm:w-9 sm:h-9 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          HSK Quiz Practice
        </h1>
      </motion.div>

      {!quiz ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">Create Your Quiz</h2>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">HSK Level</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <button
                      key={level}
                      onClick={() => setHskLevel(level)}
                      className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
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

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Quiz Type</label>
                <div className="flex flex-wrap gap-2">
                  {quizTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setQuizType(type.value as QuizType)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        quizType === type.value
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <type.Icon className="w-4 h-4 flex-shrink-0" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Number of Questions</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:outline-none focus:border-indigo-400"
                >
                  {[5, 10, 15, 20].map(num => (
                    <option key={num} value={num}>{num} questions</option>
                  ))}
                </select>
              </div>

              <button
                onClick={startQuiz}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl px-6 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all shadow-md"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Brain className="w-5 h-5" />}
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {/* Quiz info bar */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full px-3 py-1 text-sm font-semibold">
                    HSK {hskLevel}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                    {quizTypes.find(t => t.value === quizType)?.label}
                  </span>
                </div>
                {showResults && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {score}/{quiz.questions.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results motivational card */}
          {showResults && (() => {
            const percentage = Math.round((score / quiz.questions.length) * 100)
            const motivation = getMotivationalMessage(percentage)
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${motivation.color} opacity-10`} />
                  <div className="relative z-10 text-center py-6 px-4 sm:px-8">
                    <div className="flex justify-center mb-3">
                      <motivation.Icon className={`w-12 h-12 sm:w-16 sm:h-16 ${motivation.iconClass}`} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {motivation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                      {motivation.message}
                    </p>
                    <div className="flex justify-center gap-4 sm:gap-8 items-center">
                      <div className="bg-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg text-center min-w-[72px]">
                        <div className="text-2xl sm:text-3xl font-bold">{percentage}%</div>
                        <div className="text-xs mt-0.5 opacity-80">Score</div>
                      </div>
                      <div className="bg-emerald-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg text-center min-w-[72px]">
                        <div className="text-2xl sm:text-3xl font-bold">{score}</div>
                        <div className="text-xs mt-0.5 opacity-80">Correct</div>
                      </div>
                      <div className="bg-red-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg text-center min-w-[72px]">
                        <div className="text-2xl sm:text-3xl font-bold">{quiz.questions.length - score}</div>
                        <div className="text-xs mt-0.5 opacity-80">Missed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {quizType === 'multiple_choice' && renderMultipleChoice()}
          {quizType === 'fill_blank' && renderFillBlank()}
          {quizType === 'character_match' && renderCharacterMatch()}

          <div className="flex gap-4 pb-4">
            {!showResults ? (
              <button
                onClick={submitQuiz}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all shadow-md"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setQuiz(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                New Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
