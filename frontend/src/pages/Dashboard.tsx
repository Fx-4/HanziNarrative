import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import GamificationWidget from '@/components/GamificationWidget'
import WordOfTheDay from '@/components/WordOfTheDay'
import DailyGoalsTracker from '@/components/DailyGoalsTracker'
import StudyTimer from '@/components/StudyTimer'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Calendar,
  BarChart3,
  LogIn,
  AlertTriangle
} from 'lucide-react'
import CountUp from '@/components/animations/CountUp'
import SpotlightCard from '@/components/animations/SpotlightCard'
import BlurText from '@/components/animations/BlurText'

interface Stats {
  total_words_learning: number
  mastered_words: number
  due_for_review: number
  average_mastery: number
  total_reviews: number
  accuracy: number
}

interface HSKLevelData {
  level: number
  stats: Stats
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overallStats, setOverallStats] = useState<Stats | null>(null)
  const [hskLevelStats, setHSKLevelStats] = useState<HSKLevelData[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch overall stats
      const overall = await learningApi.getStats()
      setOverallStats(overall.stats)

      // Fetch stats for each HSK level (1-6)
      const levelData: HSKLevelData[] = []
      for (let level = 1; level <= 6; level++) {
        const data = await learningApi.getStats(level)
        levelData.push({ level, stats: data.stats })
      }
      setHSKLevelStats(levelData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Only set error if not auth-related - user will see login prompt
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        setError('Please login to view your dashboard')
      } else {
        setError(axiosError.response?.data?.detail || axiosError.message || 'Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <LogIn className="w-16 h-16 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please login to view your learning dashboard</p>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Login Now
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button variant="primary" onClick={fetchDashboardData}>
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!overallStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  // Prepare chart data
  const hskProgressData = hskLevelStats.map(item => ({
    name: `HSK ${item.level}`,
    level: item.level,
    learning: item.stats.total_words_learning,
    mastered: item.stats.mastered_words,
    accuracy: item.stats.accuracy
  }))

  const masteryDistribution = [
    { name: 'Mastered', value: overallStats.mastered_words },
    { name: 'Learning', value: overallStats.total_words_learning - overallStats.mastered_words },
    { name: 'Due for Review', value: overallStats.due_for_review }
  ]

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <BlurText
              as="h1"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1"
              wordDelay={0.08}
            >
              Learning Dashboard
            </BlurText>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Track your progress and achievements
            </p>
          </div>
          <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Top Row: Widgets in 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <GamificationWidget />
          <StudyTimer />
          <WordOfTheDay />
          <DailyGoalsTracker />
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <SpotlightCard spotlightColor="rgba(59,130,246,0.15)">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Words</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                      <CountUp to={overallStats.total_words_learning} duration={1.2} delay={0.2} />
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                </div>
              </Card>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SpotlightCard spotlightColor="rgba(16,185,129,0.15)">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Mastered</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">
                      <CountUp to={overallStats.mastered_words} duration={1.2} delay={0.3} />
                    </p>
                  </div>
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
                </div>
              </Card>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SpotlightCard spotlightColor="rgba(245,158,11,0.15)">
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">Due Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">
                      <CountUp to={overallStats.due_for_review} duration={1.2} delay={0.4} />
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 dark:text-orange-400" />
                </div>
              </Card>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SpotlightCard spotlightColor="rgba(139,92,246,0.15)">
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">Accuracy</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                      <CountUp to={overallStats.accuracy} duration={1.3} delay={0.5} decimals={1} suffix="%" />
                    </p>
                  </div>
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
                </div>
              </Card>
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Charts Row 1: HSK Level Progress */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                Progress by HSK Level
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hskProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="learning" fill="#3b82f6" name="Learning" />
                  <Bar dataKey="mastered" fill="#10b981" name="Mastered" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                Mastery Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={masteryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {masteryDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2: Accuracy by HSK Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
              Accuracy by HSK Level
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hskProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Accuracy %"
                  dot={{ fill: '#8b5cf6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                  <CountUp to={overallStats.total_reviews} duration={1.4} />
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  <CountUp to={overallStats.average_mastery} duration={1.4} decimals={1} />
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Mastery</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <CountUp
                    to={(overallStats.mastered_words / overallStats.total_words_learning) * 100}
                    duration={1.4}
                    decimals={1}
                    suffix="%"
                  />
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mastery Rate</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  <CountUp to={hskLevelStats.filter(s => s.stats.total_words_learning > 0).length} duration={1} />
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Levels</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
