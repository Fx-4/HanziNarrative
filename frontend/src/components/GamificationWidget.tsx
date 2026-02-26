import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './ui/Card'
import { Trophy, Zap, Flame, Star, Award } from 'lucide-react'
import { gamificationApi } from '@/services/api'

interface GamificationStats {
  total_xp: number
  level: number
  xp_to_next_level: number
  current_streak: number
  longest_streak: number
  total_words_reviewed: number
  accuracy_rate: number
  achievements: Array<{ id: string; name: string; description: string }>
}

export default function GamificationWidget() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAchievements, setShowAchievements] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      const data = await gamificationApi.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load gamification stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) return null

  const xpProgress = ((stats.total_xp % 100) / 100) * 100

  return (
    <>
      {/* XP and Level Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 sm:mb-4"
      >
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">Level {stats.level}</div>
                <div className="text-xs sm:text-sm opacity-90">{stats.total_xp} XP</div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
                <span className="text-lg sm:text-xl font-bold">{stats.current_streak}</span>
              </div>
              <div className="text-[10px] sm:text-xs opacity-90">day streak</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 opacity-90">
              <span>Next level</span>
              <span>{stats.xp_to_next_level} XP needed</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 items-start">
        <Card className="p-3 sm:p-4 text-center flex flex-col items-center justify-center aspect-square">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mb-1 sm:mb-2 flex-shrink-0" />
          <div className="text-sm sm:text-xl font-bold">{stats.total_words_reviewed}</div>
          <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Words</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center flex flex-col items-center justify-center aspect-square">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-1 sm:mb-2 flex-shrink-0" />
          <div className="text-sm sm:text-xl font-bold">{stats.accuracy_rate.toFixed(0)}%</div>
          <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Accuracy</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center justify-center aspect-square" onClick={() => setShowAchievements(!showAchievements)}>
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-1 sm:mb-2 flex-shrink-0" />
          <div className="text-sm sm:text-xl font-bold">{stats.achievements.length}</div>
          <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Badges</div>
        </Card>
      </div>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Your Achievements
              </h3>
              {stats.achievements.length === 0 ? (
                <p className="text-gray-600">No achievements yet. Keep learning!</p>
              ) : (
                <div className="space-y-3">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border-2 border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-purple-900">{achievement.name}</div>
                          <div className="text-sm text-gray-700">{achievement.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
