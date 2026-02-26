import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gamificationApi } from '@/services/api'
import {
  Trophy, Medal, TrendingUp, Zap, Target, Award,
  Loader2, RotateCcw, Users,
} from 'lucide-react'
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

const METRICS = [
  { id: 'total_xp'             as MetricType, label: 'Total XP',      Icon: Trophy, bg: 'bg-violet-600',  shadow: 'shadow-violet-500/20'  },
  { id: 'current_streak'       as MetricType, label: 'Streak',        Icon: Zap,    bg: 'bg-orange-500',  shadow: 'shadow-orange-500/20'  },
  { id: 'accuracy_rate'        as MetricType, label: 'Accuracy',      Icon: Target, bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
  { id: 'total_words_reviewed' as MetricType, label: 'Words',         Icon: Award,  bg: 'bg-indigo-600',  shadow: 'shadow-indigo-500/20'  },
]

function getRankBadge(rank: number) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-400/30">
      <Trophy className="w-4 h-4 text-white" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-xl bg-gray-300 flex items-center justify-center shadow-md shadow-gray-300/30">
      <Medal className="w-4 h-4 text-white" />
    </div>
  )
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-xl bg-orange-400 flex items-center justify-center shadow-md shadow-orange-400/30">
      <Medal className="w-4 h-4 text-white" />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
      <span className="text-xs font-extrabold text-gray-500">{rank}</span>
    </div>
  )
}

function getMetricValue(entry: LeaderboardEntry, metric: MetricType): string {
  switch (metric) {
    case 'total_xp':             return entry.total_xp.toLocaleString() + ' XP'
    case 'current_streak':       return `${entry.current_streak}d`
    case 'accuracy_rate':        return `${entry.accuracy_rate}%`
    case 'total_words_reviewed': return entry.total_words_reviewed.toLocaleString()
  }
}

export default function Leaderboard() {
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [data, setData]                     = useState<LeaderboardResponse | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total_xp')

  useEffect(() => { fetchLeaderboard() }, [selectedMetric])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await gamificationApi.getLeaderboard(50, selectedMetric)
      setData(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const activeMetric = METRICS.find(m => m.id === selectedMetric)!

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Leaderboard</h1>
            <p className="text-sm text-gray-500">See how you rank against other learners</p>
          </div>
        </div>
      </motion.div>

      {/* ── Metric Selector ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3"
      >
        {METRICS.map(({ id, label, Icon, bg, shadow }) => {
          const active = selectedMetric === id
          return (
            <button
              key={id}
              onClick={() => setSelectedMetric(id)}
              className={`rounded-2xl p-3 text-center transition-all ${
                active
                  ? `${bg} text-white shadow-lg ${shadow}`
                  : 'bg-white border border-gray-100 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-semibold">{label}</p>
            </button>
          )
        })}
      </motion.div>

      {/* ── Your Rank Banner ────────────────────────────────────────────── */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${activeMetric.bg} rounded-2xl p-5 text-white shadow-lg ${activeMetric.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-xs opacity-75 font-medium">Your Rank</p>
                <p className="text-2xl font-extrabold">
                  #<CountUp to={data.current_user_rank} duration={0.8} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs opacity-75 font-medium">Total Learners</p>
                <p className="text-2xl font-extrabold">
                  <CountUp to={data.total_users} duration={1} />
                </p>
              </div>
              <Users className="w-6 h-6 opacity-80" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Leaderboard List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-400">Loading leaderboard…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : data && data.leaderboard.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Top 3 podium */}
          {data.leaderboard.slice(0, 3).length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-indigo-100 px-6 py-5">
              <div className="flex items-end justify-center gap-3">
                {/* 2nd place */}
                {data.leaderboard[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`flex flex-col items-center gap-2 ${data.leaderboard[1].rank === data.current_user_rank ? 'opacity-100' : 'opacity-90'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center shadow-md overflow-hidden">
                      {data.leaderboard[1].profile_picture
                        ? <img src={data.leaderboard[1].profile_picture} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg font-bold text-gray-600">{data.leaderboard[1].username.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-gray-300 flex items-center justify-center shadow-sm">
                      <Medal className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center max-w-[60px] truncate">
                      {data.leaderboard[1].full_name || data.leaderboard[1].username}
                    </p>
                    <p className="text-xs font-bold text-gray-500">{getMetricValue(data.leaderboard[1], selectedMetric)}</p>
                  </motion.div>
                )}

                {/* 1st place */}
                {data.leaderboard[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-lg ring-2 ring-yellow-300 overflow-hidden">
                      {data.leaderboard[0].profile_picture
                        ? <img src={data.leaderboard[0].profile_picture} alt="" className="w-full h-full object-cover" />
                        : <span className="text-2xl font-bold text-yellow-600">{data.leaderboard[0].username.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 text-center max-w-[72px] truncate">
                      {data.leaderboard[0].full_name || data.leaderboard[0].username}
                    </p>
                    <p className="text-xs font-bold text-indigo-600">{getMetricValue(data.leaderboard[0], selectedMetric)}</p>
                  </motion.div>
                )}

                {/* 3rd place */}
                {data.leaderboard[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`flex flex-col items-center gap-2 ${data.leaderboard[2].rank === data.current_user_rank ? 'opacity-100' : 'opacity-90'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-md overflow-hidden">
                      {data.leaderboard[2].profile_picture
                        ? <img src={data.leaderboard[2].profile_picture} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg font-bold text-orange-600">{data.leaderboard[2].username.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-orange-400 flex items-center justify-center shadow-sm">
                      <Medal className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center max-w-[60px] truncate">
                      {data.leaderboard[2].full_name || data.leaderboard[2].username}
                    </p>
                    <p className="text-xs font-bold text-gray-500">{getMetricValue(data.leaderboard[2], selectedMetric)}</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Full list (rank 4+) */}
          <div className="divide-y divide-gray-50">
            {data.leaderboard.slice(3).map((entry, i) => {
              const isMe = entry.rank === data.current_user_rank
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                    isMe ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank badge */}
                  {getRankBadge(entry.rank)}

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {entry.profile_picture
                      ? <img src={entry.profile_picture} alt={entry.username} className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-indigo-600">{entry.username.charAt(0).toUpperCase()}</span>
                    }
                  </div>

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {entry.full_name || entry.username}
                      {isMe && <span className="ml-2 text-xs text-indigo-500 font-semibold">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400">Level {entry.level}</p>
                  </div>

                  {/* Metric value */}
                  <p className={`text-sm font-extrabold ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                    {getMetricValue(entry, selectedMetric)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-gray-400">No data available yet.</p>
        </div>
      )}

    </div>
  )
}
