import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dailyChallengeApi } from '@/services/api'
import { Calendar, CheckCircle, Flame, ArrowRight, BookOpen } from 'lucide-react'

interface ChallengeData {
  story: {
    id: number
    title: string
    title_english: string
    hsk_level: number
  }
  completed: boolean
  date: string
}

interface ChallengeStats {
  total_completions: number
  challenge_streak: number
  total_xp_earned: number
}

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [stats, setStats] = useState<ChallengeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          dailyChallengeApi.getToday(),
          dailyChallengeApi.getStats(),
        ])
        setChallenge(c)
        setStats(s)
      } catch {
        // silently fail — card just won't render
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !challenge) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-sm dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Daily Challenge</h3>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        {challenge.completed && (
          <CheckCircle className="w-5 h-5 text-success-500 ml-auto" />
        )}
      </div>

      {/* Story Info */}
      <div className="bg-white/70 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
          <span className="text-xs font-semibold text-accent-700 dark:text-accent-300">HSK {challenge.story.hsk_level}</span>
        </div>
        <p className="font-bold text-gray-900 text-sm">{challenge.story.title}</p>
        <p className="text-xs text-gray-500">{challenge.story.title_english}</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            {stats.challenge_streak} day streak
          </span>
          <span>{stats.total_completions} completed</span>
        </div>
      )}

      {/* CTA */}
      {challenge.completed ? (
        <div className="text-center py-1.5 bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300 rounded-lg text-xs font-semibold">
          Completed today! +30 XP earned
        </div>
      ) : (
        <Link
          to={`/story-challenge?daily=${challenge.story.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          Start Challenge <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </motion.div>
  )
}
