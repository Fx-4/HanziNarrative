import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { dailyChallengeApi } from '@/services/api'
import {
  Calendar, Flame, CheckCircle, BookOpen, Volume2,
  Loader2, ChevronRight, Star, Zap, RefreshCw, // Loader2 still used in audio button
} from 'lucide-react'
import toast from 'react-hot-toast'
import { playTTS } from '@/utils/ttsHelper'
import { Skeleton } from '@/components/ui/Skeleton'

interface ChallengeData {
  story: {
    id: number
    title: string
    title_english: string
    hsk_level: number
    content?: string
    content_pinyin?: string
    english_translation?: string
  }
  completed: boolean
  date: string
}

interface ChallengeStats {
  total_completions: number
  challenge_streak: number
  total_xp_earned: number
}

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [stats, setStats]         = useState<ChallengeStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showPinyin, setShowPinyin] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const [c, s] = await Promise.all([
        dailyChallengeApi.getToday(),
        dailyChallengeApi.getStats(),
      ])
      setChallenge(c)
      setStats(s)
      setCompleted(c.completed)
    } catch (err) {
      console.warn('[DailyChallenge] Could not load challenge data (server might be waking up)');
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!challenge || completed || completing) return
    setCompleting(true)
    try {
      await dailyChallengeApi.complete()
      setCompleted(true)
      const s = await dailyChallengeApi.getStats()
      setStats(s)
      toast.success('+30 XP! Daily challenge selesai 🎉', { duration: 4000 })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      toast.error(e.response?.data?.detail ?? 'Gagal menyelesaikan challenge')
    } finally {
      setCompleting(false)
    }
  }

  const handlePlayAudio = async () => {
    if (!challenge?.story.content || isPlayingAudio) return
    setIsPlayingAudio(true)
    try {
      const firstSentence = challenge.story.content.split(/[。！？]/)[0]
      await playTTS({ text: firstSentence })
    } catch {
      toast.error('Audio tidak tersedia')
    } finally {
      setIsPlayingAudio(false)
    }
  }

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-5 pt-2">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-7 w-56" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>

        {/* Story card */}
        <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl">
          {/* Gradient header placeholder */}
          <div className="bg-gray-200 dark:bg-gray-700 px-6 py-4 space-y-2 animate-pulse">
            <Skeleton className="h-5 w-14 rounded-full bg-gray-300 dark:bg-gray-600" />
            <Skeleton className="h-7 w-40 bg-gray-300 dark:bg-gray-600" />
            <Skeleton className="h-4 w-32 bg-gray-300 dark:bg-gray-600" />
          </div>
          {/* Content lines */}
          <div className="px-6 py-5 space-y-3 bg-white dark:bg-gray-900">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-36 mt-2" />
          </div>
        </div>

        {/* CTA button */}
        <Skeleton className="h-14 w-full rounded-2xl" />

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-800/50 space-y-2 animate-pulse">
              <Skeleton className="h-5 w-5 mx-auto rounded-full" />
              <Skeleton className="h-6 w-10 mx-auto" />
              <Skeleton className="h-3 w-14 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error || !challenge) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">Gagal memuat daily challenge.</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-950/30"
        >
          <RefreshCw className="w-4 h-4" /> Coba lagi
        </button>
      </div>
    )
  }

  const { story, date } = challenge
  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const displayContent = (showPinyin && story.content_pinyin)
    ? story.content_pinyin
    : (story.content ?? '')

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 space-y-5">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest dark:text-amber-400">Daily Challenge</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">{dateLabel}</h1>
          </div>

          {stats && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm font-bold">
                <Flame className="w-4 h-4" />
                {stats.challenge_streak}d streak
              </div>
              <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-bold">
                <Star className="w-3.5 h-3.5" />
                {stats.total_xp_earned} XP
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Completion banner ── */}
      <AnimatePresence>
        {completed && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800/60 rounded-2xl px-4 py-3"
          >
            <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-success-800 dark:text-success-300 text-sm">
                Challenge selesai hari ini!
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                Kembali besok untuk story baru. Konsistensi adalah kunci.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Story card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-950 bg-white/30 px-2.5 py-0.5 rounded-full">
              HSK {story.hsk_level}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 transition-colors disabled:opacity-60"
                title="Dengarkan audio"
              >
                {isPlayingAudio
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Volume2 className="w-4 h-4 text-white" />
                }
              </button>
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  showPinyin
                    ? 'bg-white text-amber-700 dark:text-amber-300'
                    : 'bg-white/25 text-white hover:bg-white/40'
                }`}
              >
                {showPinyin ? 'Pinyin ✓' : 'Pinyin'}
              </button>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white font-chinese leading-snug">{story.title}</h2>
          <p className="text-sm text-amber-100 mt-0.5">{story.title_english}</p>
        </div>

        {/* Story content */}
        <div className="px-6 py-5 space-y-4">
          <p className="font-chinese text-[1.1rem] leading-loose text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {displayContent}
          </p>

          {story.english_translation && (
            <details className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <summary className="text-xs text-primary-500 cursor-pointer hover:text-primary-700 font-semibold select-none dark:hover:text-primary-300">
                Tampilkan terjemahan
              </summary>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                {story.english_translation}
              </p>
            </details>
          )}

          <Link
            to={`/stories/${story.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-700 dark:text-primary-400 font-semibold transition-colors dark:hover:text-primary-300"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Buka di Story Reader
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* ── CTA button ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {completed ? (
          <div className="flex items-center justify-center gap-2 py-4 bg-success-600 dark:bg-success-700 rounded-2xl text-white font-bold shadow-lg shadow-success-500/20">
            <CheckCircle className="w-5 h-5" />
            Selesai Hari Ini · +30 XP
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {completing
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan…</>
              : <><Zap className="w-5 h-5" /> Tandai Selesai · +30 XP</>
            }
          </button>
        )}
      </motion.div>

      {/* ── Stats cards ── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Day Streak',  value: stats.challenge_streak,  Icon: Flame,        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
            { label: 'Completed',   value: stats.total_completions,  Icon: CheckCircle,  color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/30' },
            { label: 'Total XP',    value: stats.total_xp_earned,    Icon: Star,         color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/30' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}


