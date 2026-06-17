import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Target, Clock, BookOpen, TrendingUp, CheckCircle } from 'lucide-react'
import { onboardingApi, gamificationApi } from '@/services/api'
import { createLogger } from '@/utils/debugLogger'

const dailyGoalsTrackerLogger = createLogger('DailyGoalsTracker')

interface Goals {
  daily_time_minutes?: number
  daily_words?: number
  target_hsk_level?: number
}

interface DailyProgress {
  wordsReviewed: number
  timeStudied: number
  storiesRead: number
}

export default function DailyGoalsTracker() {
  const [goals, setGoals] = useState<Goals | null>(null)
  const [progress, setProgress] = useState<DailyProgress>({ wordsReviewed: 0, timeStudied: 0, storiesRead: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoalsAndProgress()
  }, [])

  const loadGoalsAndProgress = async () => {
    try {
      // Load user goals
      const onboardingData = await onboardingApi.getStatus()
      if (onboardingData.goals) {
        setGoals(onboardingData.goals)
      }

      // Load today's progress from gamification
      const gamificationData = await gamificationApi.getStats()

      // For now, we'll use total stats (in real app, would filter by today)
      // This is a simplified version - you could add daily tracking later
      setProgress({
        wordsReviewed: gamificationData.total_words_reviewed || 0,
        timeStudied: 0, // Would need session tracking
        storiesRead: gamificationData.total_stories_read || 0,
      })
    } catch (error) {
      dailyGoalsTrackerLogger.warn('Could not load goals or progress (server might be waking up)')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
        <div className="h-40 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (!goals || (!goals.daily_words && !goals.daily_time_minutes)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary-500 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Daily Goals
            </h3>
          </div>
          <div className="text-center py-6 sm:py-8">
            <Target className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
              Set your daily learning goals to track progress
            </p>
            <Link
              to="/profile"
              className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
            >
              Set Goals
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  const calculatePercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100))
  }

  const isGoalMet = (current: number, target: number) => {
    return current >= target
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary-500 p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Daily Goals
          </h3>
        </div>

        {/* Goals Progress */}
        <div className="space-y-3">
          {/* Words Goal */}
          {goals.daily_words && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Review Words
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-primary-600">
                    {Math.min(progress.wordsReviewed, goals.daily_words)}/{goals.daily_words}
                  </span>
                  {isGoalMet(progress.wordsReviewed, goals.daily_words) && (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculatePercentage(progress.wordsReviewed, goals.daily_words)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    isGoalMet(progress.wordsReviewed, goals.daily_words)
                      ? 'bg-success-500'
                      : 'bg-primary-600'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Time Goal */}
          {goals.daily_time_minutes && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Study Time
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-primary-600">
                    {Math.min(progress.timeStudied, goals.daily_time_minutes)}/{goals.daily_time_minutes} min
                  </span>
                  {isGoalMet(progress.timeStudied, goals.daily_time_minutes) && (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculatePercentage(progress.timeStudied, goals.daily_time_minutes)}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className={`h-2 rounded-full ${
                    isGoalMet(progress.timeStudied, goals.daily_time_minutes)
                      ? 'bg-success-500'
                      : 'bg-orange-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Target HSK Level */}
          {goals.target_hsk_level && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Target Level
                  </span>
                </div>
                <span className="text-sm font-bold text-primary-600">
                  HSK {goals.target_hsk_level}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        {goals.daily_words && isGoalMet(progress.wordsReviewed, goals.daily_words) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800/40"
          >
            <p className="text-sm text-success-800 dark:text-success-200 font-medium text-center">
              Great job! You've reached your daily goal!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
