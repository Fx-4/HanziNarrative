import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MascotCharacter from './MascotCharacter'
import { onboardingApi } from '@/services/api'
import type { QuestionData, AssessmentAnswer } from '@/types'
import { Loader2, Award } from 'lucide-react'

interface AdaptiveAssessmentProps {
  onComplete: (determinedLevel: number, xpEarned: number) => void
}

const AdaptiveAssessment = ({ onComplete }: AdaptiveAssessmentProps) => {
  const [loading, setLoading] = useState(true)
  const [questionsPool, setQuestionsPool] = useState<QuestionData[]>([])
  const [currentLevel, setCurrentLevel] = useState(2) // Start at HSK 2
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Load questions pool
  useEffect(() => {
    loadQuestions()
  }, [])

  // Generate next question when needed
  useEffect(() => {
    if (questionsPool.length > 0 && !currentQuestion) {
      generateNextQuestion()
    }
  }, [questionsPool, currentQuestion, currentLevel])

  const loadQuestions = async () => {
    try {
      const data = await onboardingApi.getAssessmentQuestions()
      setQuestionsPool(data.questions_pool)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load questions:', error)
      setLoading(false)
    }
  }

  const generateNextQuestion = () => {
    // Get questions from current level that haven't been used
    const usedWordIds = new Set(answers.map(a => a.word_id))
    const availableQuestions = questionsPool.filter(
      q => q.hsk_level === currentLevel && !usedWordIds.has(q.word_id)
    )

    if (availableQuestions.length === 0) {
      // No more questions at this level, submit
      submitAssessment()
      return
    }

    // Pick random question
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]

    // Generate wrong options from same level
    const wrongOptions = questionsPool
      .filter(q => q.hsk_level === currentLevel && q.word_id !== randomQuestion.word_id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(q => q.english)

    // Shuffle options
    const allOptions = [randomQuestion.english, ...wrongOptions].sort(() => 0.5 - Math.random())
    const correctIndex = allOptions.indexOf(randomQuestion.english)

    setCurrentQuestion({
      ...randomQuestion,
      options: allOptions,
      correctIndex
    })
    setQuestionStartTime(Date.now())
  }

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback) return

    setSelectedAnswer(optionIndex)
    setShowFeedback(true)

    const isCorrect = optionIndex === currentQuestion.correctIndex
    const timeTaken = (Date.now() - questionStartTime) / 1000

    // Award XP for correct answer
    if (isCorrect) {
      setTotalXP(prev => prev + 5)
    }

    // Record answer
    const answer: AssessmentAnswer = {
      question_id: questionIndex,
      word_id: currentQuestion.word_id,
      hsk_level: currentQuestion.hsk_level,
      user_answer: currentQuestion.options[optionIndex],
      correct_answer: currentQuestion.options[currentQuestion.correctIndex],
      is_correct: isCorrect,
      time_taken: timeTaken
    }

    setAnswers(prev => [...prev, answer])

    // Adaptive logic: adjust level every 3 questions
    if ((questionIndex + 1) % 3 === 0 && questionIndex > 0) {
      const recentAnswers = [...answers, answer].slice(-3)
      const correctCount = recentAnswers.filter(a => a.is_correct).length

      if (correctCount >= 2) {
        // 2/3 or 3/3 correct → level up
        setCurrentLevel(prev => Math.min(6, prev + 1))
      } else if (correctCount <= 1) {
        // 0/3 or 1/3 correct → level down
        setCurrentLevel(prev => Math.max(1, prev - 1))
      }
    }

    // Move to next question or finish
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      setQuestionIndex(prev => prev + 1)
      setCurrentQuestion(null)

      // Stop condition: 30 questions or stable level (increased from 20)
      if (questionIndex >= 29 || hasStableLevel([...answers, answer])) {
        submitAssessment([...answers, answer])
      }
    }, 1500)
  }

  const hasStableLevel = (allAnswers: AssessmentAnswer[]) => {
    // Check if user has answered 6+ at same level with 70%+ accuracy (increased from 4)
    const levelGroups: Record<number, AssessmentAnswer[]> = {}
    allAnswers.forEach(a => {
      if (!levelGroups[a.hsk_level]) levelGroups[a.hsk_level] = []
      levelGroups[a.hsk_level].push(a)
    })

    for (const level in levelGroups) {
      const levelAnswers = levelGroups[level]
      // Require at least 6 questions at same level for stability
      if (levelAnswers.length >= 6) {
        const correct = levelAnswers.filter(a => a.is_correct).length
        const accuracy = correct / levelAnswers.length
        if (accuracy >= 0.7) return true
      }
    }
    return false
  }

  const submitAssessment = async (finalAnswers = answers) => {
    try {
      const totalTime = (Date.now() - startTime) / 1000
      const result = await onboardingApi.submitAssessment({
        answers: finalAnswers,
        total_time: totalTime
      })

      onComplete(result.determined_level, result.xp_earned)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  const progress = ((questionIndex + 1) / 30) * 100

  return (
    <div className="flex flex-col items-center px-4 max-w-3xl mx-auto">
      {/* Header with XP Counter */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-gray-600">
          Question {questionIndex + 1} / ~30
        </div>
        <motion.div
          key={totalXP}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-full shadow-lg"
        >
          <Award className="w-4 h-4" />
          <span className="font-bold">{totalXP} XP</span>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Mascot with encouragement */}
      <AnimatePresence mode="wait">
        {showFeedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <MascotCharacter
              mood={selectedAnswer === currentQuestion.correctIndex ? "excited" : "encouraging"}
              message={
                selectedAnswer === currentQuestion.correctIndex
                  ? "Perfect! +5 XP 🎉"
                  : "Good try! Keep going! 💪"
              }
              size="sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-600 mb-2">HSK {currentQuestion.hsk_level}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQuestion.chinese}
          </h3>
          <p className="text-lg text-gray-600">{currentQuestion.pinyin}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctIndex
            const showResult = showFeedback

            let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all font-medium "

            if (showResult) {
              if (isCorrect) {
                buttonClass += "bg-primary-50 border-primary-500 text-primary-900"
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-red-50 border-red-500 text-red-900"
              } else {
                buttonClass += "bg-gray-50 border-gray-200 text-gray-600"
              }
            } else {
              buttonClass += isSelected
                ? "bg-primary-50 border-primary-500 text-primary-900"
                : "bg-white border-gray-200 text-gray-900 hover:border-primary-300 hover:bg-primary-50"
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={buttonClass}
                whileHover={!showFeedback ? { scale: 1.02 } : {}}
                whileTap={!showFeedback ? { scale: 0.98 } : {}}
              >
                <span className="text-lg">{option}</span>
                {showResult && isCorrect && (
                  <span className="ml-2 text-primary-600">✓</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="ml-2 text-red-600">✗</span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default AdaptiveAssessment
