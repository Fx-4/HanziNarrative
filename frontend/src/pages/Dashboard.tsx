import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { learningApi } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
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
  BarChart3
} from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [overallStats, setOverallStats] = useState<Stats | null>(null)
  const [hskLevelStats, setHSKLevelStats] = useState<HSKLevelData[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!overallStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data available</p>
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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Learning Dashboard
            </h1>
            <p className="text-gray-600">
              Track your progress and achievements
            </p>
          </div>
          <BarChart3 className="w-12 h-12 text-primary-600" />
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Words</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {overallStats.total_words_learning}
                  </p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Mastered</p>
                  <p className="text-3xl font-bold text-green-900">
                    {overallStats.mastered_words}
                  </p>
                </div>
                <Award className="w-10 h-10 text-green-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Due Today</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {overallStats.due_for_review}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-orange-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Accuracy</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {overallStats.accuracy.toFixed(1)}%
                  </p>
                </div>
                <Target className="w-10 h-10 text-purple-600" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 1: HSK Level Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Progress by HSK Level
              </h2>
              <ResponsiveContainer width="100%" height={300}>
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
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                Mastery Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
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
                    {masteryDistribution.map((entry, index) => (
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
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              Accuracy by HSK Level
            </h2>
            <ResponsiveContainer width="100%" height={300}>
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
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {overallStats.total_reviews}
                </p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {overallStats.average_mastery.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Mastery</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {((overallStats.mastered_words / overallStats.total_words_learning) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Mastery Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {hskLevelStats.filter(s => s.stats.total_words_learning > 0).length}
                </p>
                <p className="text-sm text-gray-600">Active Levels</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
