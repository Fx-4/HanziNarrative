import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { userProgressApi, gamificationApi, onboardingApi, authApi } from '@/services/api'
import { UserProgress, GamificationStats, OnboardingStatus } from '@/types'
import {
  Trophy, Flame, Target, Award, LogOut, Download, Sparkles,
  Camera, Timer, BookOpen, TrendingUp, Zap, Star, CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from '@/components/animations/CountUp'

// ─── Achievement Card ───────────────────────────────────────────────────────

interface AchievementCardProps {
  achievement: { id: string; name: string; description: string; xp: number }
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const [badgeImage, setBadgeImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeStyle, setActiveStyle] = useState<'modern' | 'traditional' | 'minimalist' | 'vibrant'>('modern')
  const [error, setError] = useState<string | null>(null)

  const STYLES = ['modern', 'traditional', 'minimalist', 'vibrant'] as const

  const generateBadge = async (s: typeof activeStyle) => {
    setLoading(true)
    setError(null)
    setActiveStyle(s)
    try {
      const result = await gamificationApi.generateBadge(achievement.id, s)
      setBadgeImage(result.badge_image)
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { detail?: string } } }
      const msg = e.response?.status === 429
        ? 'Rate limit reached. Try again later.'
        : e.response?.data?.detail || 'Failed to generate badge.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const downloadBadge = () => {
    if (!badgeImage) return
    const link = document.createElement('a')
    link.href = badgeImage
    link.download = `${achievement.id}_badge.svg`
    link.click()
  }

  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Badge / Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
          {badgeImage
            ? <img src={badgeImage} alt={achievement.name} className="w-full h-full object-contain rounded-xl" />
            : <Trophy className="w-6 h-6 text-indigo-500" />
          }
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+{achievement.xp} XP</span>
      </div>

      {/* Info */}
      <p className="font-semibold text-gray-900 text-sm mb-0.5 leading-tight">{achievement.name}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed flex-1">{achievement.description}</p>

      {/* Error */}
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {/* Actions */}
      {!badgeImage ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Generate badge
          </p>
          <div className="grid grid-cols-2 gap-1">
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => generateBadge(s)}
                disabled={loading}
                className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors disabled:opacity-50 capitalize"
              >
                {loading && activeStyle === s
                  ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  : s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={downloadBadge}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-3 h-3" /> Download
          </button>
          <button
            onClick={() => setBadgeImage(null)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Profile ────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [gamification, setGamification] = useState<GamificationStats | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [progressData, gamificationData, onboardingData] = await Promise.all([
        userProgressApi.getProgress(),
        gamificationApi.getStats(),
        onboardingApi.getStatus(),
      ])
      setProgress(progressData)
      setGamification(gamificationData)
      setOnboarding(onboardingData)
    } catch (err) {
      console.error('Failed to load profile data:', err)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return }
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }

    setUploadingPicture(true)
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      const updatedUser = await authApi.updateProfile({ profile_picture: base64String })
      useAuthStore.setState({ user: updatedUser })
      await loadData()
    } catch {
      alert('Failed to upload profile picture. Please try again.')
    } finally {
      setUploadingPicture(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    )
  }

  const xpPct = gamification
    ? Math.min((gamification.current_xp_in_level / gamification.xp_to_next_level) * 100, 100)
    : 0

  const wordsLearned = progress.length
  const totalReviews = progress.reduce((acc, p) => acc + p.review_count, 0)
  const avgFamiliarity = wordsLearned > 0
    ? Math.round(progress.reduce((acc, p) => acc + p.familiarity_level, 0) / wordsLearned)
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar */}
            <motion.div
              className="relative group"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <div className="w-20 h-20 rounded-2xl ring-4 ring-white bg-indigo-100 flex items-center justify-center overflow-hidden shadow-lg">
                {user.profile_picture
                  ? <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-indigo-600">{user.username.charAt(0).toUpperCase()}</span>
                }
              </div>
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change profile picture"
              >
                {uploadingPicture
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </button>
              <input ref={fileInputRef} id="avatar-upload" name="avatar-upload" type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" aria-label="Upload profile picture" />
            </motion.div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* User info */}
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{user.full_name || user.username}</h1>
            {user.full_name && <p className="text-sm text-gray-500">@{user.username}</p>}
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats skeleton ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Level / XP card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-28" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-8 w-16 ml-auto" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>

            {/* 4 stat badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['bg-orange-400', 'bg-indigo-600', 'bg-emerald-500', 'bg-violet-600'].map((bg, i) => (
                <div key={i} className={`${bg} rounded-2xl p-4 opacity-30 animate-pulse space-y-2`}>
                  <Skeleton className="w-5 h-5 rounded bg-white/40" />
                  <Skeleton className="h-7 w-12 bg-white/40" />
                  <Skeleton className="h-3 w-16 bg-white/40" />
                </div>
              ))}
            </div>

            {/* HSK Journey */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="space-y-2 text-center p-4 rounded-2xl bg-gray-50 animate-pulse">
                    <Skeleton className="h-8 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error state ─────────────────────────────────────────────────── */}
      {!loading && loadError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-12 gap-4 bg-white rounded-3xl border border-red-100 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Could not load stats</p>
            <p className="text-sm text-gray-400 mt-1">Check your connection and try again.</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {!loading && !loadError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-6"
        >

          {/* ── Level / XP card ─────────────────────────────────────────── */}
          {gamification && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                {/* Level */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Player Level</p>
                    <p className="text-2xl font-extrabold text-gray-900">
                      Level <CountUp to={gamification.level} duration={0.8} />
                    </p>
                  </div>
                </div>
                {/* Total XP */}
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-indigo-600">
                    <CountUp to={gamification.total_xp} duration={1.2} />
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Total XP</p>
                </div>
              </div>

              {/* XP bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{gamification.current_xp_in_level} XP</span>
                  <span>{gamification.xp_to_next_level} XP to Level {gamification.level + 1}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-right text-gray-400">{Math.round(xpPct)}% complete</p>
              </div>
            </div>
          )}

          {/* ── 4 Stat Cards ────────────────────────────────────────────── */}
          {gamification && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  Icon: Flame, label: 'Day Streak', value: gamification.current_streak,
                  sub: gamification.longest_streak > 0 ? `Best: ${gamification.longest_streak}` : undefined,
                  bg: 'bg-orange-500', shadow: 'shadow-orange-500/20',
                },
                {
                  Icon: BookOpen, label: 'Words Reviewed', value: gamification.total_words_reviewed,
                  bg: 'bg-indigo-600', shadow: 'shadow-indigo-500/20',
                },
                {
                  Icon: Target, label: 'Accuracy', value: Math.round(gamification.accuracy_rate),
                  suffix: '%', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20',
                },
                {
                  Icon: TrendingUp, label: 'Stories Read', value: gamification.total_stories_read,
                  bg: 'bg-violet-600', shadow: 'shadow-violet-500/20',
                },
              ].map(({ Icon, label, value, sub, suffix, bg, shadow }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className={`${bg} rounded-2xl p-4 text-white shadow-lg ${shadow}`}
                >
                  <Icon className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-2xl font-extrabold leading-none">
                    <CountUp to={value} duration={1} suffix={suffix} />
                  </p>
                  <p className="text-xs mt-1 opacity-75">{label}</p>
                  {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
                </motion.div>
              ))}
            </div>
          )}

          {/* ── HSK Journey ─────────────────────────────────────────────── */}
          {onboarding && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <h2 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-500" /> HSK Journey
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Current HSK */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">Current Level</p>
                  <p className="text-4xl font-extrabold text-indigo-700">
                    HSK <CountUp to={onboarding.determined_hsk_level || 1} duration={0.8} />
                  </p>
                </div>

                {/* Goals */}
                {onboarding.goals && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Daily Goals</p>
                    {onboarding.goals.daily_time_minutes && (
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <Timer className="w-4 h-4 text-indigo-400 shrink-0" />
                        {onboarding.goals.daily_time_minutes} min practice
                      </p>
                    )}
                    {onboarding.goals.daily_words && (
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                        {onboarding.goals.daily_words} new words
                      </p>
                    )}
                    {onboarding.goals.target_hsk_level && (
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                        Target: HSK {onboarding.goals.target_hsk_level}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Learning Progress ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
          >
            <h2 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" /> Learning Progress
            </h2>
            {wordsLearned === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Start reading stories to track your progress!</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Words Learned', value: wordsLearned, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Total Reviews', value: totalReviews, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Avg. Familiarity', value: avgFamiliarity, suffix: '%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(({ label, value, suffix, color, bg }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className={`${bg} rounded-2xl p-4 text-center`}
                  >
                    <p className={`text-3xl font-extrabold ${color}`}>
                      <CountUp to={value} duration={1.2} suffix={suffix} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Achievements ─────────────────────────────────────────────── */}
          {gamification && gamification.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Achievements
                  <span className="text-sm font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {gamification.achievements.length}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Generate custom badge art for each achievement (10/day, 3/hour)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {gamification.achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      )}
    </div>
  )
}
