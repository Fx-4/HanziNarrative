import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Clock, X, ChevronDown } from 'lucide-react'
import {
  useStudyTimerStore,
  formatClock, formatStudyTime, sessionLabel, sessionGradient,
} from '@/store/studyTimerStore'

/**
 * Always-available floating study timer. Lives in the app shell (Layout) so the
 * user can see and control their study time from any page — not just the Stats
 * tab. Collapses to a small bubble; expands to a control panel. Can be hidden
 * entirely (re-enable from the Stats page Study Timer widget).
 */
export default function FloatingStudyTimer() {
  const { sessionType, remaining, isRunning, totalStudyTimeToday, showFloating, toggle, reset, setShowFloating } =
    useStudyTimerStore()
  const [expanded, setExpanded] = useState(false)

  if (!showFloating) return null

  const gradient = sessionGradient(sessionType)

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {expanded ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="w-60 rounded-2xl bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-700 shadow-card-lg overflow-hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-3 py-2 bg-gradient-to-r ${gradient}`}>
              <div className="flex items-center gap-1.5 text-white">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">{sessionLabel(sessionType)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Minimize timer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setShowFloating(false); setExpanded(false) }}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Hide floating timer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-50 tabular-nums leading-none mb-3">
                {formatClock(remaining)}
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggle}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${gradient} shadow-md`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pause' : 'Start'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </motion.button>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Today</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{formatStudyTime(totalStudyTimeToday)}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            onClick={() => setExpanded(true)}
            className={`flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-white shadow-card-lg bg-gradient-to-r ${gradient}`}
            aria-label="Open study timer"
          >
            <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <Clock className="w-3.5 h-3.5" />
              {isRunning && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-300 ring-2 ring-white/40 animate-pulse" />
              )}
            </span>
            <span className="text-sm font-semibold tabular-nums">{formatClock(remaining)}</span>
          </motion.button>
        )}
    </div>
  )
}
