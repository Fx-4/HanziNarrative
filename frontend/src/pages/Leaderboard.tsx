import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { gamificationApi } from '@/services/api'
import { Trophy, Medal, TrendingUp, Zap, Target, Award } from 'lucide-react'
import BlurText from '@/components/animations/BlurText'
import SpotlightCard from '@/components/animations/SpotlightCard'
import CountUp from '@/components/animations/CountUp'

interface LeaderboardEntry {
  rank: number
  user_id: number
  username: string
  full_name: string | null
  profile_picture: string | null
  level: number
  total_xp: number
  current_streak: number
  accuracy_rate: number
  total_words_reviewed: number
  total_stories_read: number
}

interface LeaderboardResponse {
  metric: string
  leaderboard: LeaderboardEntry[]
  current_user_rank: number
  total_users: number
}

type MetricType = 'total_xp' | 'current_streak' | 'accuracy_rate' | 'total_words_reviewed'

const metrics = [
  { id: 'total_xp' as MetricType, label: 'Total XP', icon: Trophy, color: 'purple' },
  { id: 'current_streak' as MetricType, label: 'Current Streak', icon: Zap, color: 'orange' },
  { id: 'accuracy_rate' as MetricType, label: 'Accuracy', icon: Target, color: 'green' },
  { id: 'total_words_reviewed' as MetricType, label: 'Words Reviewed', icon: Award, color: 'blue' },
]

export default function Leaderboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total_xp')

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedMetric])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await gamificationApi.getLeaderboard(50, selectedMetric)
      setData(response)
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error)
      setError(error.response?.data?.detail || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />
    return <span className="text-gray-600 dark:text-gray-400 font-semibold">{rank}</span>
  }

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (selectedMetric) {
      case 'total_xp':
        return entry.total_xp.toLocaleString()
      case 'current_streak':
        return `${entry.current_streak} days`
      case 'accuracy_rate':
        return `${entry.accuracy_rate}%`
      case 'total_words_reviewed':
        return entry.total_words_reviewed.toLocaleString()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <BlurText
            as="h1"
            className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 justify-center"
            wordDelay={0.1}
          >
            Leaderboard
          </BlurText>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank against other learners
          </p>
        </div>

        {/* Metric Selector */}
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {metrics.map((metric) => {
              const Icon = metric.icon
              const isSelected = selectedMetric === metric.id
              return (
                <motion.button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium text-center">{metric.label}</span>
                </motion.button>
              )
            })}
          </div>
        </Card>

        {/* Your Rank Card */}
        {data && (
          <SpotlightCard spotlightColor="rgba(79,70,229,0.12)">
            <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950 dark:to-blue-950 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      #<CountUp to={data.current_user_rank} duration={0.8} />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Learners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    <CountUp to={data.total_users} duration={1} />
                  </p>
                </div>
              </div>
            </Card>
          </SpotlightCard>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600"
            >
              Try Again
            </button>
          </Card>
        ) : data && data.leaderboard.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.leaderboard.map((entry, index) => {
                const isCurrentUser = entry.rank === data.current_user_rank
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center justify-between ${
                      isCurrentUser
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        {entry.profile_picture ? (
                          <img
                            src={entry.profile_picture}
                            alt={entry.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {entry.full_name || entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Level {entry.level}
                          </p>
                        </div>
                      </div>

                      {/* Metric Value */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {getMetricValue(entry)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No data available</p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
