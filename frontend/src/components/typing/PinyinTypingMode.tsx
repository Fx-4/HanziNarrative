import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { HanziWord, TypingAttempt } from '@/types'
import { typingApi } from '@/services/api'
import { comparePinyin } from '@/utils/pinyinInput'
import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react'
import { createLogger } from '@/utils/debugLogger'

const pinyinTypingModeLogger = createLogger('PinyinTypingMode')

interface Props {
  words: HanziWord[]
  hskLevel: number
  onBack: () => void
}

export default function PinyinTypingMode({ words, onBack }: Props) {
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
      pinyinTypingModeLogger.error('Failed to record attempt:', error)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleSubmit()
    }
  }

  // When feedback is shown the input is disabled, so listen at document level
  useEffect(() => {
    if (!showFeedback) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback])

  if (!currentWord) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center dark:bg-surface-card dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">No words available for this HSK level.</p>
        <button
          onClick={onBack}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors mt-4"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold">Pinyin Typing</span>
        </div>
        <div className="text-lg font-semibold">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 dark:bg-surface-card dark:border-gray-800">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">Type the pinyin spelling for:</p>
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-chinese mb-4 text-gray-900 dark:text-gray-50"
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
                id="pinyin-typing-input"
                name="pinyin-typing"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type pinyin (e.g., ni hao)"
                className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg text-center bg-white text-gray-900 focus:border-primary-500 focus:outline-none transition-colors dark:border-gray-600 dark:bg-surface-card dark:text-gray-50"
                disabled={showFeedback}
                autoComplete="off"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition-colors w-full text-lg"
            >
              Check Answer
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center dark:text-gray-400">
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
                ? 'bg-success-50 border-2 border-success-200'
                : 'bg-error-50 border-2 border-error-200'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
                    <span className="text-2xl font-semibold text-success-900">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
                    <span className="text-2xl font-semibold text-error-900">Incorrect</span>
                  </>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">You typed:</span>{' '}
                  <span className={isCorrect ? 'text-success-700' : 'text-error-700'}>
                    {inputValue}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-lg">
                    <span className="font-semibold">Correct pinyin:</span>{' '}
                    <span className="text-success-700 dark:text-success-300">{currentWord.pinyin}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition-colors w-full mt-4 flex items-center justify-center text-lg"
            >
              {currentIndex < words.length - 1 ? (
                <>
                  Next Word <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'Finish Session'
              )}
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center dark:text-gray-400">
              Press Enter to continue
            </p>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Session Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessionResults.length > 0
              ? `${Math.round((sessionResults.filter(r => r).length / sessionResults.length) * 100)}% accuracy`
              : 'No attempts yet'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / words.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
