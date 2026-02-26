import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { HanziWord, TypingAttempt } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { typingApi } from '@/services/api'
import { calculateWPM } from '@/utils/pinyinInput'
import { toast } from 'react-hot-toast'
import { Clock, Zap, Trophy, TrendingUp } from 'lucide-react'

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

export default function SpeedTypingMode({ words, hskLevel: _hskLevel, onBack }: Props) {
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
      console.error('Failed to record attempt:', error)
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
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No words available for this HSK level.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </Card>
    )
  }

  if (isFinished) {
    const stats = getSessionStats()!
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-4xl font-bold mb-2 dark:text-gray-100">Session Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Great job on your typing practice!</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Average WPM</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {Math.round(stats.avgWpm)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">Best WPM</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.round(stats.bestWpm)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {Math.round(stats.accuracy)}%
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={onBack} size="lg" variant="primary">
                Back to Modes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-lg font-semibold dark:text-gray-100">Speed Typing</span>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-lg font-bold dark:text-gray-100">{formatTime(timer)}</span>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-lg font-bold dark:text-gray-100">{Math.round(currentWPM)} WPM</span>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center mb-8">
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-7xl font-chinese mb-4 text-gray-900 dark:text-gray-100">
              {currentWord.simplified}
            </div>
            <p className="text-2xl text-gray-700 dark:text-gray-300">{currentWord.english}</p>
          </motion.div>
        </div>

        <div className="max-w-md mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type as fast as you can..."
            className="w-full px-6 py-4 text-2xl border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors"
            autoComplete="off"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Target: <span className="font-semibold text-primary-600 dark:text-primary-400">{currentWord.pinyin}</span>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold dark:text-gray-100">
            Progress: {currentIndex + 1} / {words.length}
          </p>
        </div>
      </Card>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium dark:text-gray-300">Session Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessionResults.length > 0
              ? `Avg: ${Math.round(sessionResults.reduce((acc, r) => acc + r.wpm, 0) / sessionResults.length)} WPM`
              : 'Start typing!'}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
