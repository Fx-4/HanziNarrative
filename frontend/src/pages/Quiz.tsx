import { useState } from 'react'
import { motion } from 'framer-motion'
import { quizApi } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
    <div className="space-y-6">
      {quiz?.questions.map((q, idx: number) => {
        const question = q as MultipleChoiceQuestion
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer === question.correct_answer
        const isWrong = showResults && userAnswer !== undefined && userAnswer !== question.correct_answer

        return (
          <Card key={idx} className={showResults ? (isCorrect ? 'border-green-500' : isWrong ? 'border-red-500' : '') : ''}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Question {idx + 1}</h3>
              {showResults && (isCorrect ? <CheckCircle className="text-green-500" /> : isWrong ? <XCircle className="text-red-500" /> : null)}
            </div>
            <p className="text-gray-900 dark:text-gray-100 mb-4 text-lg">{question.question}</p>
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
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isCorrectOption ? 'border-green-500 bg-green-50 dark:bg-green-900/30' :
                      isWrongOption ? 'border-red-500 bg-red-50 dark:bg-red-900/30' :
                      isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' :
                      'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-gray-100"><strong>Answer:</strong> {question.chinese} ({question.pinyin}) - {question.english}</p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )

  const renderFillBlank = () => (
    <div className="space-y-6">
      {quiz?.questions.map((q, idx: number) => {
        const question = q as FillBlankQuestion
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer?.toString().trim().toLowerCase() === question.blank_word.toLowerCase()

        return (
          <Card key={idx} className={showResults ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Question {idx + 1}</h3>
              {showResults && (isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />)}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Meaning:</strong> {question.english}</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                disabled={showResults}
                placeholder="Type the Chinese character"
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-2xl font-chinese bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-gray-100"><strong>Correct Answer:</strong> {question.blank_word} ({question.pinyin})</p>
              </div>
            )}
          </Card>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Chinese Characters</h3>
            <div className="space-y-2">
              {leftItems.map((q) => {
                const matchedEnglish = getMatchedEnglish(q.id)
                const isCorrect = isMatchCorrect(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => handleLeftClick(q.id)}
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg text-xl sm:text-2xl font-chinese transition-all ${
                      matches[q.id]
                        ? isCorrect && showResults
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : showResults
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : selectedLeft === q.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600'
                    }`}
                    disabled={!!matches[q.id] || showResults}
                  >
                    <div className="flex flex-col items-center">
                      <span>{q.chinese}</span>
                      {matches[q.id] && (
                        <span className="text-xs sm:text-sm mt-1 text-gray-600 dark:text-gray-400">
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
            <h3 className="font-semibold mb-4 text-sm sm:text-base">English Meanings</h3>
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
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg text-sm sm:text-base transition-all ${
                      isMatched
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : selectedRight === q.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600'
                    }`}
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
          <div className="mt-4 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            Click a character, then click its matching meaning to pair them
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          HSK Quiz Practice
        </h1>
      </motion.div>

      {!quiz ? (
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create Your Quiz</h2>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">HSK Level</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <Button
                    key={level}
                    size="sm"
                    variant={hskLevel === level ? 'primary' : 'secondary'}
                    onClick={() => setHskLevel(level)}
                  >
                    HSK {level}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quiz Type</label>
              <div className="flex flex-wrap gap-2">
                {quizTypes.map(type => (
                  <Button
                    key={type.value}
                    size="sm"
                    variant={quizType === type.value ? 'primary' : 'secondary'}
                    onClick={() => setQuizType(type.value as QuizType)}
                    className="text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <type.Icon className="w-4 h-4 flex-shrink-0" /> {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {[5, 10, 15, 20].map(num => (
                  <option key={num} value={num}>{num} questions</option>
                ))}
              </select>
            </div>

            <Button onClick={startQuiz} disabled={loading} size="lg" className="w-full">
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Brain className="w-5 h-5 mr-2" />}
              Start Quiz
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-primary-50 dark:bg-primary-900/20">
            <div className="flex justify-between items-center">
              <div>
                <Badge>HSK {hskLevel}</Badge>
                <span className="mx-2">•</span>
                <span className="font-semibold">{quizTypes.find(t => t.value === quizType)?.label}</span>
              </div>
              {showResults && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-xl font-bold">{score}/{quiz.questions.length}</span>
                </div>
              )}
            </div>
          </Card>

          {showResults && (() => {
            const percentage = Math.round((score / quiz.questions.length) * 100)
            const motivation = getMotivationalMessage(percentage)
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden relative border-2 border-primary-200 dark:border-primary-700">
                  <div className={`absolute inset-0 bg-gradient-to-br ${motivation.color} opacity-10`} />
                  <div className="relative z-10 text-center py-6">
                    <div className="flex justify-center mb-3">
                      <motivation.Icon className={`w-16 h-16 ${motivation.iconClass}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {motivation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {motivation.message}
                    </p>
                    <div className="flex justify-center gap-8 items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{percentage}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success-600 dark:text-success-400">{score}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-error-600 dark:text-error-400">{quiz.questions.length - score}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Missed</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })()}

          {quizType === 'multiple_choice' && renderMultipleChoice()}
          {quizType === 'fill_blank' && renderFillBlank()}
          {quizType === 'character_match' && renderCharacterMatch()}

          <div className="flex gap-4">
            {!showResults ? (
              <Button onClick={submitQuiz} size="lg" className="flex-1">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => setQuiz(null)} size="lg" className="flex-1">
                <RotateCcw className="w-5 h-5 mr-2" />
                New Quiz
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
