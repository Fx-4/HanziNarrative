import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Medal, TrendingUp, Zap, Target, Award,
  Loader2, RotateCcw, Users, Calendar, BookOpen, Clock,
} from 'lucide-react'
import CountUp from '@/components/animations/CountUp'
import { API_URL } from '@/lib/env'

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
  words_this_week: number | null
}

interface LeaderboardResponse {
  metric: string
  period: string
  week_start?: string
  leaderboard: LeaderboardEntry[]
  current_user_rank: number
  total_users: number
}

type MetricType = 'total_xp' | 'current_streak' | 'accuracy_rate' | 'total_words_reviewed'
type PeriodType = 'all_time' | 'weekly'

const METRICS = [
  { id: 'total_xp'             as MetricType, label: 'XP',       Icon: Trophy, color: 'from-violet-500 to-purple-600',  ring: 'ring-violet-400' },
  { id: 'current_streak'       as MetricType, label: 'Streak',   Icon: Zap,    color: 'from-orange-400 to-rose-500',    ring: 'ring-orange-400' },
  { id: 'accuracy_rate'        as MetricType, label: 'Accuracy', Icon: Target, color: 'from-success-400 to-teal-500',   ring: 'ring-success-400' },
  { id: 'total_words_reviewed' as MetricType, label: 'Words',    Icon: Award,  color: 'from-primary-500 to-blue-600',    ring: 'ring-primary-400' },
]

const PERIODS: { id: PeriodType; label: string; Icon: React.ElementType }[] = [
  { id: 'all_time', label: 'All Time', Icon: Trophy },
  { id: 'weekly',   label: 'This Week', Icon: Calendar },
]

function getRankBadge(rank: number) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-md shadow-yellow-400/30">
      <Trophy className="w-4 h-4 text-white" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md">
      <Medal className="w-4 h-4 text-white" />
    </div>
  )
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-300 to-amber-500 flex items-center justify-center shadow-md shadow-orange-400/20">
      <Medal className="w-4 h-4 text-white" />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400">{rank}</span>
    </div>
  )
}

function getMetricValue(entry: LeaderboardEntry, metric: MetricType | 'words_this_week'): string {
  switch (metric) {
    case 'total_xp':             return entry.total_xp.toLocaleString() + ' XP'
    case 'current_streak':       return `${entry.current_streak}d`
    case 'accuracy_rate':        return `${entry.accuracy_rate}%`
    case 'total_words_reviewed': return entry.total_words_reviewed.toLocaleString()
    case 'words_this_week':      return `${(entry.words_this_week ?? 0).toLocaleString()} words`
  }
}

function Avatar({ entry, size = 'md' }: { entry: LeaderboardEntry; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }
  return (
    <div className={`${sizes[size]} rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden shrink-0 shadow-sm`}>
      {entry.profile_picture
        ? <img src={entry.profile_picture} alt={entry.username} className="w-full h-full object-cover" />
        : <span className="font-bold text-primary-600 dark:text-primary-400">{entry.username.charAt(0).toUpperCase()}</span>
      }
    </div>
  )
}

function PodiumCard({
  entry, rank, metric, isMe, delay,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  metric: MetricType | 'words_this_week'
  isMe: boolean
  delay: number
}) {
  const configs = {
    1: { avatarSize: 'lg' as const, ringColor: 'ring-yellow-300', bgGrad: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10', badgeGrad: 'from-yellow-300 to-amber-400', badgeIcon: Trophy },
    2: { avatarSize: 'md' as const, ringColor: 'ring-gray-300', bgGrad: 'from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/20', badgeGrad: 'from-gray-300 to-slate-400', badgeIcon: Medal },
    3: { avatarSize: 'md' as const, ringColor: 'ring-orange-300', bgGrad: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10', badgeGrad: 'from-orange-300 to-amber-500', badgeIcon: Medal },
  }
  const c = configs[rank]
  const BadgeIcon = c.badgeIcon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex flex-col items-center gap-2 ${rank === 1 ? 'scale-105' : ''}`}
    >
      <div className={`${rank === 1 ? 'w-16 h-16' : 'w-12 h-12'} rounded-2xl overflow-hidden ring-2 ${isMe ? 'ring-primary-400' : c.ringColor} shadow-lg bg-white dark:bg-gray-800 flex items-center justify-center`}>
        {entry.profile_picture
          ? <img src={entry.profile_picture} alt={entry.username} className="w-full h-full object-cover" />
          : <span className={`font-bold ${rank === 1 ? 'text-2xl' : 'text-lg'} text-primary-600 dark:text-primary-400`}>{entry.username.charAt(0).toUpperCase()}</span>
        }
      </div>
      <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${c.badgeGrad} flex items-center justify-center shadow-md`}>
        <BadgeIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <p className={`${rank === 1 ? 'text-sm font-extrabold' : 'text-xs font-semibold'} text-gray-800 dark:text-gray-200 text-center max-w-[72px] truncate`}>
        {entry.full_name || entry.username}
        {isMe && <span className="block text-[10px] text-primary-500">You</span>}
      </p>
      <p className={`text-xs font-bold ${rank === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {getMetricValue(entry, metric)}
      </p>
    </motion.div>
  )
}

export default function Leaderboard() {
  const [loading, setLoading]               = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading leaderboard...')
  const [error, setError]                   = useState<string | null>(null)
  const [data, setData]                     = useState<LeaderboardResponse | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total_xp')
  const [period, setPeriod]                 = useState<PeriodType>('all_time')

  const loadLeaderboardRealtime = async (signal?: AbortSignal) => {
    setData(null)
    setLoading(true)
    setError(null)
    setLoadingMessage('Connecting to leaderboard service...')

    try {
      const apiUrl = API_URL
      const token = localStorage.getItem('access_token')
      const params = new URLSearchParams({
        limit: '50',
        metric: selectedMetric,
        period,
      })

      const res = await fetch(`${apiUrl}/gamification/leaderboard-stream?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.detail || `Server error ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response body')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let gotDone = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6))

          if (event.type === 'progress') {
            setLoadingMessage(event.message || 'Loading leaderboard...')
          } else if (event.type === 'done') {
            gotDone = true
            setData(event.data)
            setLoading(false)
            setLoadingMessage('')
          } else if (event.type === 'error') {
            throw new Error(event.message || 'Failed to load leaderboard')
          }
        }
      }

      if (!gotDone) {
        throw new Error('Leaderboard stream closed before completion')
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load leaderboard')
      setLoading(false)
      setLoadingMessage('')
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadLeaderboardRealtime(controller.signal)
    return () => { controller.abort() }
  }, [selectedMetric, period])

  const fetchLeaderboard = () => {
    loadLeaderboardRealtime()
  }

  const activeMetricCfg = METRICS.find(m => m.id === selectedMetric)!
  const displayMetric: MetricType | 'words_this_week' = period === 'weekly' ? 'words_this_week' : selectedMetric

  // Week range label
  const weekLabel = (() => {
    if (!data?.week_start) return 'This Week'
    const start = new Date(data.week_start)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  })()

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-purple-600" />
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Leaderboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Compete with other learners</p>
          </div>
        </div>
      </motion.div>

      {/* ── Period Tabs ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 flex gap-1.5 shadow-sm"
      >
        {PERIODS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              period === id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'weekly' && period === 'weekly' && data && (
              <span className="text-xs opacity-70 hidden sm:inline">· {weekLabel}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ── Metric Selector (all_time only) ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {period === 'all_time' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-4 gap-2.5 overflow-hidden"
          >
            {METRICS.map(({ id, label, Icon, color, ring }) => {
              const active = selectedMetric === id
              return (
                <button
                  key={id}
                  onClick={() => setSelectedMetric(id)}
                  className={`rounded-2xl p-3 text-center transition-all ${
                    active
                      ? `bg-gradient-to-br ${color} text-white shadow-lg ring-2 ${ring} ring-offset-1`
                      : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-200 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{label}</p>
                </button>
              )
            })}
          </motion.div>
        )}

        {period === 'weekly' && (
          <motion.div
            key="weekly-info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 bg-primary-50 dark:bg-primary-950/30 rounded-2xl px-4 py-3 border border-primary-100 dark:border-primary-900/50 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">Words Reviewed This Week</p>
              <p className="text-xs text-primary-500 dark:text-primary-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Resets every Monday
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Your Rank Banner ────────────────────────────────────────────── */}
      {data && !loading && (
        <motion.div
          key={`rank-${period}-${selectedMetric}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${activeMetricCfg.color} rounded-2xl p-5 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <div>
                <p className="text-xs opacity-75 font-medium">Your Rank</p>
                <p className="text-2xl font-extrabold">
                  #<CountUp to={data.current_user_rank} duration={0.8} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs opacity-75 font-medium">
                  {period === 'weekly' ? 'Active Learners' : 'Total Learners'}
                </p>
                <p className="text-2xl font-extrabold">
                  <CountUp to={data.total_users} duration={1} />
                </p>
              </div>
              <Users className="w-5 h-5 opacity-80" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Leaderboard List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-gray-400">{loadingMessage || 'Loading leaderboard…'}</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
          <p className="text-sm text-error-500 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : data && data.leaderboard.length > 0 ? (
        <motion.div
          key={`${period}-${selectedMetric}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          {/* Podium (top 3) */}
          <div className="bg-gradient-to-br from-primary-50 via-violet-50 to-purple-50 dark:from-primary-950/20 dark:via-violet-950/20 dark:to-purple-950/20 border-b border-primary-100 dark:border-primary-900/30 px-6 py-6">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              {data.leaderboard[1] && (
                <PodiumCard entry={data.leaderboard[1]} rank={2} metric={displayMetric}
                  isMe={data.leaderboard[1].rank === data.current_user_rank} delay={0.3} />
              )}
              {/* 1st */}
              {data.leaderboard[0] && (
                <PodiumCard entry={data.leaderboard[0]} rank={1} metric={displayMetric}
                  isMe={data.leaderboard[0].rank === data.current_user_rank} delay={0.2} />
              )}
              {/* 3rd */}
              {data.leaderboard[2] && (
                <PodiumCard entry={data.leaderboard[2]} rank={3} metric={displayMetric}
                  isMe={data.leaderboard[2].rank === data.current_user_rank} delay={0.4} />
              )}
            </div>
          </div>

          {/* Rank 4+ list */}
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.leaderboard.slice(3).map((entry, i) => {
              const isMe = entry.rank === data.current_user_rank
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.025 }}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                    isMe ? 'bg-primary-50 dark:bg-primary-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {getRankBadge(entry.rank)}
                  <Avatar entry={entry} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {entry.full_name || entry.username}
                      {isMe && <span className="ml-2 text-xs text-primary-500 font-semibold">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lv {entry.level}</p>
                  </div>
                  <p className={`text-sm font-extrabold ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {getMetricValue(entry, displayMetric)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          {period === 'weekly' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-primary-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No activity yet this week</p>
              <p className="text-xs text-gray-400">Be the first to practice and claim #1!</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No data available yet.</p>
          )}
        </div>
      )}

    </div>
  )
}


