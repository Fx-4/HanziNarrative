import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

const POMODORO_TIME = 25 * 60 // 25 minutes in seconds
const SHORT_BREAK = 5 * 60 // 5 minutes
const LONG_BREAK = 15 * 60 // 15 minutes

type SessionType = 'focus' | 'short-break' | 'long-break'

export default function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<SessionType>('focus')
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [totalStudyTime, setTotalStudyTime] = useState(0) // in seconds

  useEffect(() => {
    // Load total study time from localStorage
    const stored = localStorage.getItem('total_study_time_today')
    if (stored) {
      setTotalStudyTime(parseInt(stored))
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }

          // Track study time only during focus sessions
          if (sessionType === 'focus') {
            const newTotal = totalStudyTime + 1
            setTotalStudyTime(newTotal)
            localStorage.setItem('total_study_time_today', newTotal.toString())
          }

          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, sessionType])

  const handleSessionComplete = () => {
    setIsRunning(false)

    if (sessionType === 'focus') {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)

      // After 4 focus sessions, take a long break
      if (newCount % 4 === 0) {
        setSessionType('long-break')
        setTimeLeft(LONG_BREAK)
      } else {
        setSessionType('short-break')
        setTimeLeft(SHORT_BREAK)
      }

      // Play completion sound (optional)
      playNotificationSound()
    } else {
      setSessionType('focus')
      setTimeLeft(POMODORO_TIME)
    }
  }

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.error('Could not play sound:', e)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(
      sessionType === 'focus' ? POMODORO_TIME :
      sessionType === 'short-break' ? SHORT_BREAK :
      LONG_BREAK
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const progressPercentage = () => {
    const total = sessionType === 'focus' ? POMODORO_TIME :
                  sessionType === 'short-break' ? SHORT_BREAK :
                  LONG_BREAK
    return ((total - timeLeft) / total) * 100
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus':
        return 'from-indigo-500 to-violet-600'
      case 'short-break':
        return 'from-emerald-500 to-green-600'
      case 'long-break':
        return 'from-blue-500 to-cyan-600'
    }
  }

  const getSessionText = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Time'
      case 'short-break':
        return 'Short Break'
      case 'long-break':
        return 'Long Break'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getSessionColor()} opacity-5`} />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Study Timer
            </h3>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500">
            {sessionsCompleted} sessions
          </div>
        </div>

        {/* Session Type */}
        <div className="text-center mb-2 sm:mb-3">
          <span className={`inline-block px-3 py-0.5 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-r ${getSessionColor()}`}>
            {getSessionText()}
          </span>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2 sm:mb-4">
            {formatTime(timeLeft)}
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-gray-200"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                className={`stroke-current ${sessionType === 'focus' ? 'text-indigo-600' : sessionType === 'short-break' ? 'text-emerald-500' : 'text-blue-500'}`}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * progressPercentage() / 100) }}
                style={{
                  strokeDasharray: 553
                }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-white bg-gradient-to-r ${getSessionColor()} shadow-lg`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="p-2 sm:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>
        </div>

        {/* Total Study Time Today */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Total today:</span>
            <span className="font-bold text-indigo-600">
              {formatStudyTime(totalStudyTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
