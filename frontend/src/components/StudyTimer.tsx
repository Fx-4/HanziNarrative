import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Clock, PictureInPicture2 } from 'lucide-react'
import {
  useStudyTimerStore,
  POMODORO_TIME, SHORT_BREAK, LONG_BREAK,
  formatClock, formatStudyTime, sessionLabel, sessionGradient,
} from '@/store/studyTimerStore'

/**
 * Dashboard study-timer widget. State lives in the global studyTimerStore so the
 * timer keeps running across route changes and stays in sync with the floating
 * pill (see FloatingStudyTimer).
 */
export default function StudyTimer() {
  const { sessionType, remaining, isRunning, sessionsCompleted, totalStudyTimeToday, showFloating, toggle, reset, setShowFloating } =
    useStudyTimerStore()

  const total = sessionType === 'focus' ? POMODORO_TIME : sessionType === 'short-break' ? SHORT_BREAK : LONG_BREAK
  const progressPercentage = ((total - remaining) / total) * 100
  const gradient = sessionGradient(sessionType)
  const ringColor =
    sessionType === 'focus' ? 'text-primary-600 dark:text-primary-400'
      : sessionType === 'short-break' ? 'text-success-500 dark:text-success-400'
        : 'text-blue-500 dark:text-blue-400'

  return (
    <div className="bg-white dark:bg-surface-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 sm:p-4 relative overflow-hidden transition-colors">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-50">Study Timer</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFloating(!showFloating)}
              className={`p-1 rounded-lg transition-colors ${showFloating ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={showFloating ? 'Hide floating timer' : 'Show floating timer on all pages'}
              aria-label="Toggle floating timer"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{sessionsCompleted} sessions</span>
          </div>
        </div>

        {/* Session Type */}
        <div className="text-center mb-2 sm:mb-3">
          <span className={`inline-block px-3 py-0.5 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-r ${gradient}`}>
            {sessionLabel(sessionType)}
          </span>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-50 mb-2 sm:mb-4">
            {formatClock(remaining)}
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="6" fill="none" />
              <motion.circle
                cx="96" cy="96" r="88"
                className={`stroke-current ${ringColor}`}
                strokeWidth="6" fill="none" strokeLinecap="round"
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * progressPercentage / 100) }}
                style={{ strokeDasharray: 553 }}
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
            onClick={toggle}
            className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-white bg-gradient-to-r ${gradient} shadow-lg`}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Pause</span></>
            ) : (
              <><Play className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Start</span></>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>

        {/* Total Study Time Today */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total today:</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{formatStudyTime(totalStudyTimeToday)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
