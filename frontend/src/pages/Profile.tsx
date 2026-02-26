import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { userProgressApi, gamificationApi, onboardingApi, authApi } from '@/services/api'
import { UserProgress, GamificationStats, OnboardingStatus } from '@/types'
import { Trophy, Flame, Star, BookOpen, Target, Award, LogOut, Download, Sparkles, Camera, Timer } from 'lucide-react'
import { motion } from 'framer-motion'
import { FadeInOnMount } from '@/components/animations/FadeIn'
import { StaggerOnMount } from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import CountUp from '@/components/animations/CountUp'
import SpotlightCard from '@/components/animations/SpotlightCard'
import ScrollReveal from '@/components/animations/ScrollReveal'

// Achievement Card Component with Badge Generator
interface AchievementCardProps {
  achievement: {
    id: string
    name: string
    description: string
    xp: number
  }
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const [badgeImage, setBadgeImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [style, setStyle] = useState<'modern' | 'traditional' | 'minimalist' | 'vibrant'>('modern')

  const generateBadge = async (selectedStyle: typeof style) => {
    setLoading(true)
    try {
      const result = await gamificationApi.generateBadge(achievement.id, selectedStyle)
      setBadgeImage(result.badge_image)
      setStyle(selectedStyle)
    } catch (error: any) {
      console.error('Failed to generate badge:', error)
      const errorMsg = error.response?.data?.detail || 'Failed to generate badge. Please try again.'

      // Show more user-friendly message for rate limits
      if (error.response?.status === 429) {
        alert('Rate limit reached!\n\n' + errorMsg)
      } else {
        alert(errorMsg)
      }
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
    <div className="group relative p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg text-center hover:shadow-lg transition-all">
      {/* Badge Display or Emoji */}
      {badgeImage ? (
        <div className="relative mb-2">
          <img 
            src={badgeImage} 
            alt={achievement.name}
            className="w-full h-32 object-contain mx-auto"
          />
          <button
            onClick={downloadBadge}
            className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Download badge"
          >
            <Download className="w-4 h-4 text-primary-600" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
      )}

      {/* Achievement Info */}
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{achievement.name}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
      <p className="text-xs text-primary-600 font-medium mt-1">+{achievement.xp} XP</p>

      {/* Generate Badge Button */}
      <div className="mt-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!badgeImage && (
          <div className="flex gap-1">
            {(['modern', 'traditional', 'minimalist', 'vibrant'] as const).map((s) => (
              <button
                key={s}
                onClick={() => generateBadge(s)}
                disabled={loading}
                className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 rounded border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-800 disabled:opacity-50 capitalize"
                title={`Generate ${s} badge`}
              >
                {loading && style === s ? '...' : s.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
        {badgeImage && (
          <button
            onClick={() => setBadgeImage(null)}
            className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [gamification, setGamification] = useState<GamificationStats | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [progressData, gamificationData, onboardingData] = await Promise.all([
        userProgressApi.getProgress(),
        gamificationApi.getStats(),
        onboardingApi.getStatus()
      ])
      setProgress(progressData)
      setGamification(gamificationData)
      setOnboarding(onboardingData)
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadingPicture(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const updatedUser = await authApi.updateProfile({
          profile_picture: base64String
        })

        // Update user in auth store
        useAuthStore.setState({ user: updatedUser })

        // Refresh page data
        await loadData()
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      alert('Failed to upload profile picture. Please try again.')
    } finally {
      setUploadingPicture(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile</p>
      </div>
    )
  }

  const xpProgress = gamification 
    ? (gamification.current_xp_in_level / gamification.xp_to_next_level) * 100 
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Avatar and Basic Info */}
      <FadeInOnMount direction="up" distance={20} className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar with Upload */}
            <motion.div
              className="relative group"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-primary-200 dark:ring-primary-800">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">{user.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
                  className="text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full cursor-pointer"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
            </motion.div>

            {/* User Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.full_name || user.username}</h1>
              {user.full_name && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>}
              <p className="text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full sm:w-auto justify-center cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>
      </FadeInOnMount>

      {loading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-500 rounded-full mx-auto"
          />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your stats...</p>
        </div>
      ) : (
        <>
          {/* Level & XP Progress */}
          {gamification && (
            <ScrollReveal className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-full"
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Trophy className="w-6 h-6 text-primary-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">Level <CountUp to={gamification.level} duration={0.8} /></h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {gamification.current_xp_in_level} / {gamification.xp_to_next_level} XP
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">
                    <CountUp to={gamification.total_xp} duration={1.2} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                </div>
              </div>

              <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-right">
                {Math.round(xpProgress)}% to Level {gamification.level + 1}
              </p>
            </ScrollReveal>
          )}

          {/* Gamification Stats Grid */}
          {gamification && (
            <StaggerOnMount className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" staggerDelay={0.1}>
              <StaggerItem>
                <SpotlightCard className="card text-center" spotlightColor="rgba(245,158,11,0.12)">
                  <div className="flex justify-center mb-2">
                    <motion.div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full" whileHover={{ scale: 1.1 }}>
                      <Flame className="w-6 h-6 text-orange-600" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <CountUp to={gamification.current_streak} duration={1} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                  {gamification.longest_streak > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Best: {gamification.longest_streak}</p>
                  )}
                </SpotlightCard>
              </StaggerItem>

              <StaggerItem>
                <SpotlightCard className="card text-center" spotlightColor="rgba(79,70,229,0.12)">
                  <div className="flex justify-center mb-2">
                    <motion.div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full" whileHover={{ scale: 1.1 }}>
                      <BookOpen className="w-6 h-6 text-primary-600" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <CountUp to={gamification.total_words_reviewed} duration={1.2} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Words Reviewed</p>
                </SpotlightCard>
              </StaggerItem>

              <StaggerItem>
                <SpotlightCard className="card text-center" spotlightColor="rgba(16,185,129,0.12)">
                  <div className="flex justify-center mb-2">
                    <motion.div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full" whileHover={{ scale: 1.1 }}>
                      <Target className="w-6 h-6 text-green-600" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <CountUp to={Math.round(gamification.accuracy_rate)} duration={1.2} suffix="%" />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                </SpotlightCard>
              </StaggerItem>

              <StaggerItem>
                <SpotlightCard className="card text-center" spotlightColor="rgba(59,130,246,0.12)">
                  <div className="flex justify-center mb-2">
                    <motion.div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full" whileHover={{ scale: 1.1 }}>
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <CountUp to={gamification.total_stories_read} duration={1} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stories Read</p>
                </SpotlightCard>
              </StaggerItem>
            </StaggerOnMount>
          )}

          {/* HSK Level & Goals */}
          {onboarding && (
            <ScrollReveal className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Your HSK Journey</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Current Level</h3>
                  </div>
                  <p className="text-3xl font-bold text-primary-600">
                    HSK <CountUp to={onboarding.determined_hsk_level || 1} duration={0.8} />
                  </p>
                </div>
                {onboarding.goals && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Daily Goals</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {onboarding.goals.daily_time_minutes && (
                        <p className="flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                          {onboarding.goals.daily_time_minutes} minutes practice
                        </p>
                      )}
                      {onboarding.goals.daily_words && (
                        <p className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                          {onboarding.goals.daily_words} new words
                        </p>
                      )}
                      {onboarding.goals.target_hsk_level && (
                        <p className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                          Target: HSK {onboarding.goals.target_hsk_level}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Achievements */}
          {gamification && gamification.achievements.length > 0 && (
            <ScrollReveal className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary-600" />
                  Achievements ({gamification.achievements.length})
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Hover to generate badge</span>
                </div>
              </div>
              <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                <p className="text-xs sm:text-sm text-primary-800 dark:text-primary-200">
                  <strong>New!</strong> Generate personalized badge images for your achievements.
                  <span className="hidden sm:inline"> Hover over any achievement and choose a style.</span>
                  <span className="text-xs text-primary-600 dark:text-primary-400 block sm:inline sm:ml-1">(Limit: 10/day, 3/hour)</span>
                </p>
              </div>
              <StaggerOnMount className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
                {gamification.achievements.map((achievement) => (
                  <StaggerItem key={achievement.id}>
                    <AchievementCard achievement={achievement} />
                  </StaggerItem>
                ))}
              </StaggerOnMount>
            </ScrollReveal>
          )}

          {/* Learning Progress */}
          <ScrollReveal className="card">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Learning Progress</h2>
            {progress.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Start reading stories to track your progress!</p>
            ) : (
              <StaggerOnMount className="grid grid-cols-1 sm:grid-cols-3 gap-4" staggerDelay={0.12}>
                <StaggerItem>
                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600">
                      <CountUp to={progress.length} duration={1} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Words Learned</div>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                      <CountUp to={progress.reduce((acc, p) => acc + p.review_count, 0)} duration={1.2} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 bg-primary-200 dark:bg-primary-800/30 rounded-lg">
                    <div className="text-3xl font-bold text-primary-800 dark:text-primary-200">
                      <CountUp
                        to={Math.round(progress.reduce((acc, p) => acc + p.familiarity_level, 0) / progress.length)}
                        duration={1.2}
                        suffix="%"
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Familiarity</div>
                  </div>
                </StaggerItem>
              </StaggerOnMount>
            )}
          </ScrollReveal>
        </>
      )}
    </div>
  )
}
