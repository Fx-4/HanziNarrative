import { useState } from 'react'
import { motion } from 'framer-motion'
import { quizApi } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Brain, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react'
import { toast } from 'react-hot-toast'

type QuizType = 'multiple_choice' | 'fill_blank' | 'character_match'

export default function Quiz() {
  const [hskLevel, setHskLevel] = useState(1)
  const [quizType, setQuizType] = useState<QuizType>('multiple_choice')
  const [numQuestions, setNumQuestions] = useState(10)
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const quizTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '✓' },
    { value: 'fill_blank', label: 'Fill in Blank', icon: '✍️' },
    { value: 'character_match', label: 'Character Match', icon: '🔄' }
  ]

  const startQuiz = async () => {
    setLoading(true)
    try {
      const data = await quizApi.generate(hskLevel, quizType, numQuestions)
      setQuiz(data)
      setAnswers({})
      setShowResults(false)
      setScore(0)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = () => {
    let correctCount = 0
    const totalQuestions = quiz.questions.length

    if (quizType === 'multiple_choice') {
      quiz.questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correct_answer) correctCount++
      })
    } else if (quizType === 'fill_blank') {
      quiz.questions.forEach((q: any, idx: number) => {
        if (answers[idx]?.trim().toLowerCase() === q.blank_word.toLowerCase()) correctCount++
      })
    } else if (quizType === 'character_match') {
      Object.keys(answers).forEach(key => {
        if (answers[key] === key) correctCount++
      })
    }

    setScore(correctCount)
    setShowResults(true)

    const percentage = Math.round((correctCount / totalQuestions) * 100)
    if (percentage >= 80) {
      toast.success(`Excellent! ${percentage}% correct!`)
    } else if (percentage >= 60) {
      toast(`Good job! ${percentage}% correct`, { icon: '👍' })
    } else {
      toast(`Keep practicing! ${percentage}% correct`, { icon: '📚' })
    }
  }

  const renderMultipleChoice = () => (
    <div className="space-y-6">
      {quiz.questions.map((q: any, idx: number) => {
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer === q.correct_answer
        const isWrong = showResults && userAnswer !== undefined && userAnswer !== q.correct_answer

        return (
          <Card key={idx} className={showResults ? (isCorrect ? 'border-green-500' : isWrong ? 'border-red-500' : '') : ''}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Question {idx + 1}</h3>
              {showResults && (isCorrect ? <CheckCircle className="text-green-500" /> : isWrong ? <XCircle className="text-red-500" /> : null)}
            </div>
            <p className="text-gray-900 mb-4 text-lg">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((option: string, oIdx: number) => (
                <button
                  key={oIdx}
                  onClick={() => !showResults && setAnswers({ ...answers, [idx]: oIdx })}
                  disabled={showResults}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    showResults && oIdx === q.correct_answer ? 'border-green-500 bg-green-50' :
                    showResults && userAnswer === oIdx && userAnswer !== q.correct_answer ? 'border-red-500 bg-red-50' :
                    userAnswer === oIdx ? 'border-primary-500 bg-primary-50' :
                    'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm"><strong>Answer:</strong> {q.chinese} ({q.pinyin}) - {q.english}</p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )

  const renderFillBlank = () => (
    <div className="space-y-6">
      {quiz.questions.map((q: any, idx: number) => {
        const userAnswer = answers[idx]
        const isCorrect = showResults && userAnswer?.trim().toLowerCase() === q.blank_word.toLowerCase()

        return (
          <Card key={idx} className={showResults ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Question {idx + 1}</h3>
              {showResults && (isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />)}
            </div>
            <p className="text-gray-700 mb-2"><strong>Meaning:</strong> {q.english}</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                disabled={showResults}
                placeholder="Type the Chinese character"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-2xl font-chinese"
              />
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm"><strong>Correct Answer:</strong> {q.blank_word} ({q.pinyin})</p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )

  const renderCharacterMatch = () => {
    const [leftItems] = useState(() => [...quiz.questions])
    const [rightItems] = useState(() => [...quiz.questions].sort(() => Math.random() - 0.5))

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Chinese Characters</h3>
          <div className="space-y-2">
            {leftItems.map((q: any) => (
              <button
                key={q.id}
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl font-chinese hover:border-primary-500 transition-all"
              >
                {q.chinese}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4">English Meanings</h3>
          <div className="space-y-2">
            {rightItems.map((q: any) => (
              <button
                key={q.id}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-all"
              >
                {q.english}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 text-center text-gray-600 text-sm">
          Drag and drop feature coming soon! For now, study the pairs above.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Brain className="w-10 h-10 text-primary-600" />
          HSK Quiz Practice
        </h1>
      </motion.div>

      {!quiz ? (
        <Card>
          <h2 className="text-2xl font-bold mb-6">Create Your Quiz</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">HSK Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <Button
                    key={level}
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
              <div className="flex gap-2">
                {quizTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={quizType === type.value ? 'primary' : 'secondary'}
                    onClick={() => setQuizType(type.value as QuizType)}
                  >
                    {type.icon} {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
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
          <Card className="bg-primary-50">
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
