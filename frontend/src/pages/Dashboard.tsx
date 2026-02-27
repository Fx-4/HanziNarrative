import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import GamificationWidget from '@/components/GamificationWidget'
import WordOfTheDay from '@/components/WordOfTheDay'
import DailyGoalsTracker from '@/components/DailyGoalsTracker'
import StudyTimer from '@/components/StudyTimer'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, BookOpen, Target, Award, Calendar,
  LogIn, AlertTriangle, Loader2, RotateCcw,
} from 'lucide-react'
import CountUp from '@/components/animations/CountUp'

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

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// ── Reusable section card ──────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overallStats, setOverallStats] = useState<Stats | null>(null)
  const [hskLevelStats, setHSKLevelStats] = useState<HSKLevelData[]>([])

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData()
    else setLoading(false)
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const overall = await learningApi.getStats()
      setOverallStats(overall.stats)

      const levelData: HSKLevelData[] = []
      for (let level = 1; level <= 6; level++) {
        const data = await learningApi.getStats(level)
        levelData.push({ level, stats: data.stats })
      }
      setHSKLevelStats(levelData)
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        setError('Please login to view your dashboard')
      } else {
        setError(axiosError.response?.data?.detail || axiosError.message || 'Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Not authenticated ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Login Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please login to view your learning dashboard</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-colors text-sm"
          >
            Login Now
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading your dashboard…</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Failed to Load</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  if (!overallStats) return null

  // ── Chart data ───────────────────────────────────────────────────────────
  const hskProgressData = hskLevelStats.map(item => ({
    name: `HSK ${item.level}`,
    learning: item.stats.total_words_learning,
    mastered: item.stats.mastered_words,
    accuracy: item.stats.accuracy,
  }))

  const masteryDistribution = [
    { name: 'Mastered', value: overallStats.mastered_words },
    { name: 'Learning', value: overallStats.total_words_learning - overallStats.mastered_words },
    { name: 'Due for Review', value: overallStats.due_for_review },
  ]

  const masteryRate = overallStats.total_words_learning > 0
    ? (overallStats.mastered_words / overallStats.total_words_learning) * 100
    : 0

  const activeLevels = hskLevelStats.filter(s => s.stats.total_words_learning > 0).length

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <span className="text-white text-xl font-bold font-chinese">学</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Learning Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and achievements</p>
          </div>
        </div>
      </motion.div>

      {/* ── Widgets 2×2 ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <GamificationWidget />
        <StudyTimer />
        <WordOfTheDay />
        <DailyGoalsTracker />
      </motion.div>

      {/* ── 4 Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { Icon: BookOpen, label: 'Total Words',  value: overallStats.total_words_learning, bg: 'bg-indigo-600',  shadow: 'shadow-indigo-500/20' },
          { Icon: Award,    label: 'Mastered',     value: overallStats.mastered_words,       bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { Icon: Calendar, label: 'Due Today',    value: overallStats.due_for_review,       bg: 'bg-orange-500',  shadow: 'shadow-orange-500/20' },
          { Icon: Target,   label: 'Accuracy',     value: overallStats.accuracy, suffix: '%', decimals: 1, bg: 'bg-violet-600', shadow: 'shadow-violet-500/20' },
        ].map(({ Icon, label, value, suffix, decimals, bg, shadow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className={`${bg} rounded-2xl p-4 text-white shadow-lg ${shadow}`}
          >
            <Icon className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-extrabold leading-none">
              <CountUp to={value} duration={1.2} suffix={suffix} decimals={decimals} />
            </p>
            <p className="text-xs mt-1 opacity-75">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts: Progress by HSK + Mastery Pie ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionCard title="Progress by HSK Level" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hskProgressData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="learning" fill="#4f46e5" name="Learning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mastered" fill="#10b981" name="Mastered" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionCard title="Mastery Distribution" icon={Target}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={masteryDistribution}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {masteryDistribution.map((_entry, i) => (
                    <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── Accuracy Line Chart ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <SectionCard title="Accuracy by HSK Level" icon={Award}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hskProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                formatter={(val: number) => [`${val.toFixed(1)}%`, 'Accuracy']}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff'
                }}
              />
              <Line
                type="monotone" dataKey="accuracy" stroke="#8b5cf6"
                strokeWidth={2.5} name="Accuracy %"
                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </motion.div>

      {/* ── Overall Statistics ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <SectionCard title="Overall Statistics" icon={BookOpen}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Reviews', value: overallStats.total_reviews, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Avg Mastery', value: overallStats.average_mastery, decimals: 1, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Mastery Rate', value: masteryRate, decimals: 1, suffix: '%', color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Active Levels', value: activeLevels, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, decimals, suffix, color, bg }) => (
              <div key={label} className={`${bg} dark:bg-gray-800 rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-extrabold ${color} dark:text-gray-100`}>
                  <CountUp to={value} duration={1.2} decimals={decimals} suffix={suffix} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

    </div>
  )
}
