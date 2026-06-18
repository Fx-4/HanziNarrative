import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { HanziWord, TypingAttempt } from '@/types'
import { typingApi } from '@/services/api'
import { calculateWPM } from '@/utils/pinyinInput'
import { toast } from 'react-hot-toast'
import { Clock, Zap, Trophy, TrendingUp } from 'lucide-react'
import { createLogger } from '@/utils/debugLogger'

const speedTypingModeLogger = createLogger('SpeedTypingMode')

interface Props {
  words: HanziWord[]
  hskLevel: number
  onBack: () => void
}

interface WordResult {
  wpm: number
  time: number
  isCorrect: boolean
}

export default function SpeedTypingMode({ words, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [sessionStartTime] = useState<number>(Date.now())
  const [sessionResults, setSessionResults] = useState<WordResult[]>([])
  const [timer, setTimer] = useState(0)
  const [currentWPM, setCurrentWPM] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = words[currentIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((Date.now() - sessionStartTime) / 1000)
    }, 100)
    return () => clearInterval(interval)
  }, [sessionStartTime])

  useEffect(() => {
    inputRef.current?.focus()
    setStartTime(Date.now())
  }, [currentIndex])

  useEffect(() => {
    if (inputValue.length > 0 && !isFinished) {
      const timeTaken = (Date.now() - startTime) / 1000
      const wpm = calculateWPM(inputValue, timeTaken, false)
      setCurrentWPM(wpm)
    } else {
      setCurrentWPM(0)
    }
  }, [inputValue, startTime, isFinished])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return

    const value = e.target.value
    setInputValue(value)

    // Auto-submit when correct
    if (value.trim().toLowerCase() === currentWord.pinyin.trim().toLowerCase()) {
      handleSubmit(value.trim())
    }
  }

  const handleSubmit = async (value: string) => {
    const timeTaken = (Date.now() - startTime) / 1000
    const correct = value.toLowerCase() === currentWord.pinyin.trim().toLowerCase()
    const wpm = calculateWPM(value, timeTaken, false)

    const result: WordResult = {
      wpm,
      time: timeTaken,
      isCorrect: correct
    }

    setSessionResults([...sessionResults, result])

    // Record attempt
    try {
      const attempt: TypingAttempt = {
        word_id: currentWord.id,
        mode: 'speed',
        is_correct: correct,
        time_taken: timeTaken,
        typed_text: value,
        expected_text: currentWord.pinyin,
        wpm: wpm
      }
      await typingApi.recordAttempt(attempt)
    } catch (error) {
      speedTypingModeLogger.error('Failed to record attempt:', error)
    }

    // Move to next
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setInputValue('')
    } else {
      // Session complete
      setIsFinished(true)
      const avgWpm = sessionResults.reduce((acc, r) => acc + r.wpm, wpm) / (sessionResults.length + 1)
      toast.success(`Session complete! Avg WPM: ${Math.round(avgWpm)}`, {
        duration: 5000,
        icon: '🏆'
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionStats = () => {
    if (sessionResults.length === 0) return null

    const avgWpm = sessionResults.reduce((acc, r) => acc + r.wpm, 0) / sessionResults.length
    const bestWpm = Math.max(...sessionResults.map(r => r.wpm))
    const accuracy = (sessionResults.filter(r => r.isCorrect).length / sessionResults.length) * 100

    return { avgWpm, bestWpm, accuracy }
  }

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

  if (isFinished) {
    const stats = getSessionStats()!
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 dark:bg-surface-card dark:border-gray-800">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-4xl font-bold mb-2">Session Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Great job on your typing practice!</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-purple-700 font-medium mb-1">Average WPM</p>
                <p className="text-3xl font-bold text-purple-900">
                  {Math.round(stats.avgWpm)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-orange-700 font-medium mb-1">Best WPM</p>
                <p className="text-3xl font-bold text-orange-900">
                  {Math.round(stats.bestWpm)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success-600" />
                <p className="text-sm text-success-700 font-medium mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-success-900">
                  {Math.round(stats.accuracy)}%
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onBack}
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition-colors text-lg"
              >
                Back to Modes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-600" />
          <span className="text-lg font-semibold">Speed Typing</span>
        </div>
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2 dark:bg-surface-card dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-bold">{formatTime(timer)}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2 dark:bg-surface-card dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-bold">{Math.round(currentWPM)} WPM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 dark:bg-surface-card dark:border-gray-800">
        <div className="text-center mb-8">
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-7xl font-chinese mb-4 text-gray-900 dark:text-gray-50">
              {currentWord.simplified}
            </div>
            <p className="text-2xl text-gray-700 dark:text-gray-300">{currentWord.english}</p>
          </motion.div>
        </div>

        <div className="max-w-md mx-auto">
          <input
            ref={inputRef}
            id="speed-typing-input"
            name="speed-typing"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type as fast as you can..."
            className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg text-center bg-white text-gray-900 focus:border-primary-500 focus:outline-none transition-colors dark:border-gray-600 dark:bg-surface-card dark:text-gray-50"
            autoComplete="off"
          />
          <p className="text-sm text-gray-600 mt-2 text-center dark:text-gray-400">
            Target: <span className="font-semibold text-primary-600">{currentWord.pinyin}</span>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold">
            Progress: {currentIndex + 1} / {words.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Session Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessionResults.length > 0
              ? `Avg: ${Math.round(sessionResults.reduce((acc, r) => acc + r.wpm, 0) / sessionResults.length)} WPM`
              : 'Start typing!'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
