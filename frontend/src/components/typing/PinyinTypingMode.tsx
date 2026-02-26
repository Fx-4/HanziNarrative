import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { HanziWord, TypingAttempt } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { typingApi } from '@/services/api'
import { comparePinyin } from '@/utils/pinyinInput'
import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react'

interface Props {
  words: HanziWord[]
  hskLevel: number
  onBack: () => void
}

export default function PinyinTypingMode({ words, hskLevel: _hskLevel, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionResults, setSessionResults] = useState<boolean[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = words[currentIndex]

  useEffect(() => {
    inputRef.current?.focus()
    setStartTime(Date.now())
  }, [currentIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = async () => {
    const timeTaken = (Date.now() - startTime) / 1000
    const finalInput = inputValue.trim()
    const expected = currentWord.pinyin.trim()

    const { isCorrect: correct } = comparePinyin(finalInput, expected)
    setIsCorrect(correct)
    setShowFeedback(true)
    setSessionResults([...sessionResults, correct])

    // Record attempt
    try {
      const attempt: TypingAttempt = {
        word_id: currentWord.id,
        mode: 'pinyin',
        is_correct: correct,
        time_taken: timeTaken,
        typed_text: finalInput,
        expected_text: expected
      }
      await typingApi.recordAttempt(attempt)
    } catch (error) {
      console.error('Failed to record attempt:', error)
    }

    if (correct) {
      toast.success('Correct!', { icon: '✅' })
    } else {
      toast.error('Incorrect', { icon: '❌' })
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setInputValue('')
      setShowFeedback(false)
    } else {
      // Session complete
      const accuracy = (sessionResults.filter(r => r).length / sessionResults.length) * 100
      toast.success(`Session complete! Accuracy: ${Math.round(accuracy)}%`, {
        duration: 4000,
        icon: '🎉'
      })
      onBack()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleSubmit()
    } else if (e.key === 'Enter' && showFeedback) {
      handleNext()
    }
  }

  if (!currentWord) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No words available for this HSK level.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold dark:text-gray-100">Pinyin Typing</span>
        </div>
        <div className="text-lg font-semibold dark:text-gray-100">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Type the pinyin spelling for:</p>
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-chinese mb-4 text-gray-900 dark:text-gray-100"
          >
            {currentWord.simplified}
          </motion.div>
          <p className="text-xl text-gray-700 dark:text-gray-300">{currentWord.english}</p>
        </div>

        {!showFeedback ? (
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type pinyin (e.g., ni hao)"
                className="w-full px-6 py-4 text-2xl border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors"
                disabled={showFeedback}
                autoComplete="off"
              />
            </div>
            <Button onClick={handleSubmit} size="lg" className="w-full">
              Check Answer
            </Button>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              Press Enter to submit
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className={`p-6 rounded-lg ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-2xl font-semibold text-green-900 dark:text-green-100">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <span className="text-2xl font-semibold text-red-900 dark:text-red-100">Incorrect</span>
                  </>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg">
                  <span className="font-semibold dark:text-gray-200">You typed:</span>{' '}
                  <span className={isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                    {inputValue}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-lg">
                    <span className="font-semibold dark:text-gray-200">Correct pinyin:</span>{' '}
                    <span className="text-green-700 dark:text-green-300">{currentWord.pinyin}</span>
                  </p>
                )}
              </div>
            </div>
            <Button onClick={handleNext} size="lg" className="w-full mt-4">
              {currentIndex < words.length - 1 ? (
                <>
                  Next Word <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'Finish Session'
              )}
            </Button>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              Press Enter to continue
            </p>
          </motion.div>
        )}
      </Card>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium dark:text-gray-300">Session Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessionResults.length > 0
              ? `${Math.round((sessionResults.filter(r => r).length / sessionResults.length) * 100)}% accuracy`
              : 'No attempts yet'}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / words.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
