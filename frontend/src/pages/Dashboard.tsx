import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
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
  LogIn, AlertTriangle, RotateCcw,
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

// Align with design system tokens: primary-600, success-600, accent-500, error-600, then decorative violet/pink
const CHART_COLORS = ['#4f46e5', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899']
const CACHE_KEY = 'dashboard_stats_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ── Cache helpers ──────────────────────────────────────────────────────────
function readCache(): { overallStats: Stats; hskLevelStats: HSKLevelData[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function writeCache(overallStats: Stats, hskLevelStats: HSKLevelData[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: { overallStats, hskLevelStats }, ts: Date.now() }))
  } catch { /* localStorage full — ignore */ }
}

// ── Skeleton blocks ──────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
      {/* Header */}
      <Skeleton className="h-20 rounded-3xl" />
      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-3xl" />)}
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-48 rounded-3xl" />
    </div>
  )
}

// ── Reusable section card ──────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore()

  // Initialise from cache so first paint is instant on repeat visits
  const cached = useMemo(() => readCache(), [])
  const [overallStats, setOverallStats] = useState<Stats | null>(cached?.overallStats ?? null)
  const [hskLevelStats, setHSKLevelStats] = useState<HSKLevelData[]>(cached?.hskLevelStats ?? [])
  const [loading, setLoading] = useState(!cached)        // no skeleton if cache hit
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(!!cached)           // true = showing cached data
  const fetchingRef = useRef(false)

  // ── Chart data — MUST be before any early returns (Rules of Hooks) ──────
  const hskProgressData = useMemo(() => hskLevelStats.map(item => ({
    name: `HSK ${item.level}`,
    learning: item.stats.total_words_learning,
    mastered: item.stats.mastered_words,
    accuracy: item.stats.accuracy,
  })), [hskLevelStats])

  const masteryDistribution = useMemo(() => overallStats ? [
    { name: 'Mastered', value: overallStats.mastered_words },
    { name: 'Learning', value: Math.max(0, overallStats.total_words_learning - overallStats.mastered_words) },
    { name: 'Due for Review', value: overallStats.due_for_review },
  ].filter(d => d.value > 0) : [], [overallStats])

  const masteryRate = useMemo(() => overallStats && overallStats.total_words_learning > 0
    ? (overallStats.mastered_words / overallStats.total_words_learning) * 100
    : 0, [overallStats])

  const activeLevels = useMemo(
    () => hskLevelStats.filter(s => s.stats.total_words_learning > 0).length,
    [hskLevelStats]
  )

  const fetchDashboardData = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setError(null)
    if (!stale) setLoading(true)   // only show skeleton on true first load

    try {
      // Single request instead of 7 separate ones
      const data = await learningApi.getAllStats()
      const overall = data.overall
      const levels: HSKLevelData[] = [1,2,3,4,5,6].map(lvl => ({
        level: lvl,
        stats: data.levels[lvl] ?? { total_words_learning:0, mastered_words:0, due_for_review:0, average_mastery:0, total_reviews:0, accuracy:0 },
      }))
      setOverallStats(overall)
      setHSKLevelStats(levels)
      setStale(false)
      writeCache(overall, levels)
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        setError('Please login to view your dashboard')
      } else {
        // If we already have cached data, don't show error — just keep stale
        if (!overallStats) {
          setError(axiosError.response?.data?.detail || axiosError.message || 'Failed to load dashboard data')
        }
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData()
    else setLoading(false)
    // fetchDashboardData is intentionally stable — only re-run when auth changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // ── Not authenticated ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Login Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please login to view your learning dashboard</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-colors text-sm"
          >
            Login Now
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Skeleton (first-ever load, no cache) ─────────────────────────────────
  if (loading) return <DashboardSkeleton />

  // ── Error (no cached data to fall back on) ───────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-error-50 dark:bg-error-950/30 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-error-500 dark:text-error-400" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Failed to Load</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  if (!overallStats) return null

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
              <span className="text-white text-xl font-bold font-chinese">学</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Learning Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and achievements</p>
            </div>
          </div>
          {stale && (
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Cached · refreshing…</span>
          )}
        </div>
      </motion.div>

      {/* ── Widgets 2×2 ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
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
          { Icon: BookOpen, label: 'Total Words',  value: overallStats.total_words_learning, bg: 'bg-primary-600',  shadow: 'shadow-primary-500/20' },
          { Icon: Award,    label: 'Mastered',     value: overallStats.mastered_words,       bg: 'bg-success-600', shadow: 'shadow-success-500/20' },
          { Icon: Calendar, label: 'Due Today',    value: overallStats.due_for_review,       bg: 'bg-orange-500',  shadow: 'shadow-orange-500/20', to: '/review' },
          { Icon: Target,   label: 'Accuracy',     value: overallStats.accuracy, suffix: '%', decimals: 1, bg: 'bg-violet-600', shadow: 'shadow-violet-500/20' },
        ].map(({ Icon, label, value, suffix, decimals, bg, shadow, to }, i) => {
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`${bg} rounded-2xl p-4 text-white shadow-lg ${shadow}${to ? ' hover:opacity-90 transition-opacity' : ''}`}
            >
              <Icon className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-extrabold leading-none">
                <CountUp to={value} duration={1.2} suffix={suffix} decimals={decimals} />
              </p>
              <p className="text-xs mt-1 opacity-75">{label}</p>
            </motion.div>
          )
          if (to) return <Link key={label} to={to} className="block">{card}</Link>
          return <Fragment key={label}>{card}</Fragment>
        })}
      </div>

      {/* ── Charts: Progress by HSK + Mastery Pie ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionCard title="Progress by HSK Level" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hskProgressData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} />
                <Legend />
                <Bar dataKey="learning" fill="#4f46e5" name="Learning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mastered" fill="#10b981" name="Mastered" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionCard title="Mastery Distribution" icon={Target}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={masteryDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {masteryDistribution.map((_entry, i) => (
                    <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── Accuracy Line Chart ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionCard title="Accuracy by HSK Level" icon={Award}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hskProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip formatter={(val: number) => [`${val.toFixed(1)}%`, 'Accuracy']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2.5} name="Accuracy %"
                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </motion.div>

      {/* ── Overall Statistics ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <SectionCard title="Overall Statistics" icon={BookOpen}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Reviews', value: overallStats.total_reviews, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Avg Mastery', value: overallStats.average_mastery, decimals: 1, color: 'text-success-600', bg: 'bg-success-50' },
              { label: 'Mastery Rate', value: masteryRate, decimals: 1, suffix: '%', color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Active Levels', value: activeLevels, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, decimals, suffix, color, bg }) => (
              <div key={label} className={`${bg} dark:bg-surface-card rounded-2xl p-4 text-center`}>
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
