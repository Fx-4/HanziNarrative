import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { learningApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { hasPlayedIntro, markIntroPlayed } from '@/utils/uiPrefs'
import { useThemeStore } from '@/store/themeStore'
import { useTranslation } from 'react-i18next'
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
  const isDarkMode = useThemeStore(s => s.isDarkMode)
  const { t } = useTranslation()
  const intro = !hasPlayedIntro('dashboard')
  useEffect(() => { markIntroPlayed('dashboard') }, [])

  // Theme-aware chart styling so axes/grid/tooltips stay legible in dark mode
  const chartTheme = useMemo(() => ({
    grid: isDarkMode ? '#334155' : '#e5e7eb',
    axis: isDarkMode ? '#94a3b8' : '#6b7280',
    tooltip: {
      borderRadius: 12,
      border: isDarkMode ? '1px solid #334155' : 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
      color: isDarkMode ? '#e5e7eb' : '#111827',
    } as React.CSSProperties,
    dotStroke: isDarkMode ? '#1e293b' : '#fff',
  }), [isDarkMode])

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
    { name: t('dashboard.charts.mastered'), value: overallStats.mastered_words },
    { name: t('dashboard.charts.learning'), value: Math.max(0, overallStats.total_words_learning - overallStats.mastered_words) },
    { name: t('dashboard.charts.due'), value: overallStats.due_for_review },
  ].filter(d => d.value > 0) : [], [overallStats, t])

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
        setError(t('dashboard.loginError'))
      } else {
        // If we already have cached data, don't show error — just keep stale
        if (!overallStats) {
          setError(axiosError.response?.data?.detail || axiosError.message || t('dashboard.failedDefault'))
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
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.loginRequired')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('dashboard.loginPrompt')}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-colors text-sm"
          >
            {t('dashboard.loginNow')}
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
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.failedTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" /> {t('dashboard.tryAgain')}
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
        initial={intro ? { opacity: 0, y: 16 } : false}
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
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.subtitle')}</p>
            </div>
          </div>
          {stale && (
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{t('dashboard.cached')}</span>
          )}
        </div>
      </motion.div>

      {/* ── Widgets 2×2 ─────────────────────────────────────────────────── */}
      <motion.div
        initial={intro ? { opacity: 0, y: 12 } : false}
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
          { Icon: BookOpen, label: t('dashboard.stats.totalWords'), value: overallStats.total_words_learning, bg: 'bg-primary-600',  shadow: 'shadow-primary-500/20' },
          { Icon: Award,    label: t('dashboard.stats.mastered'),   value: overallStats.mastered_words,       bg: 'bg-success-600', shadow: 'shadow-success-500/20' },
          { Icon: Calendar, label: t('dashboard.stats.dueToday'),   value: overallStats.due_for_review,       bg: 'bg-orange-500',  shadow: 'shadow-orange-500/20', to: '/review' },
          { Icon: Target,   label: t('dashboard.stats.accuracy'),   value: overallStats.accuracy, suffix: '%', decimals: 1, bg: 'bg-violet-600', shadow: 'shadow-violet-500/20' },
        ].map(({ Icon, label, value, suffix, decimals, bg, shadow, to }, i) => {
          const card = (
            <motion.div
              initial={intro ? { opacity: 0, y: 12 } : false}
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
        <motion.div initial={intro ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionCard title={t('dashboard.charts.progressByHsk')} icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hskProgressData} barSize={16}>
                <defs>
                  <linearGradient id="barLearning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="barMastered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTheme.axis }} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: isDarkMode ? 'rgba(148,163,184,0.08)' : 'rgba(0,0,0,0.04)' }} contentStyle={chartTheme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.axis }} />
                <Bar dataKey="learning" fill="url(#barLearning)" name={t('dashboard.charts.learning')} radius={[6, 6, 0, 0]} />
                <Bar dataKey="mastered" fill="url(#barMastered)" name={t('dashboard.charts.mastered')} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </motion.div>

        <motion.div initial={intro ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionCard title={t('dashboard.charts.masteryDist')} icon={Target}>
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={masteryDistribution} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45} 
                    outerRadius={65} 
                    paddingAngle={6} 
                    cornerRadius={6}
                    dataKey="value" 
                    labelLine={false}
                    minAngle={15}
                    stroke="none"
                    label={({ name, value, percent }) => (value > 0 && percent !== undefined && percent > 0.05) ? `${name}` : ''}
                  >
                    {masteryDistribution.map((_entry, i) => (
                      <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={chartTheme.tooltip}
                    itemStyle={{ fontSize: '12px', fontWeight: 600, color: chartTheme.tooltip.color }}
                    formatter={(value: number) => [value, t('dashboard.charts.words')]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, color: chartTheme.axis }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central mastery percentage display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                  {masteryRate.toFixed(0)}%
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Mastery</p>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── Accuracy Line Chart ──────────────────────────────────────────── */}
      <motion.div initial={intro ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionCard title={t('dashboard.charts.accuracyByHsk')} icon={Award}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hskProgressData}>
              <defs>
                <linearGradient id="lineAccuracy" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTheme.axis }} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val: number) => [`${val.toFixed(1)}%`, t('dashboard.stats.accuracy')]}
                contentStyle={chartTheme.tooltip} />
              <Line type="monotone" dataKey="accuracy" stroke="url(#lineAccuracy)" strokeWidth={3} name={t('dashboard.charts.accuracyName')}
                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: chartTheme.dotStroke }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </motion.div>

      {/* ── Overall Statistics ───────────────────────────────────────────── */}
      <motion.div initial={intro ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <SectionCard title={t('dashboard.overall.title')} icon={BookOpen}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('dashboard.overall.totalReviews'), value: overallStats.total_reviews, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/30' },
              { label: t('dashboard.overall.avgMastery'), value: overallStats.average_mastery, decimals: 1, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/30' },
              { label: t('dashboard.overall.masteryRate'), value: masteryRate, decimals: 1, suffix: '%', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
              { label: t('dashboard.overall.activeLevels'), value: activeLevels, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
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
