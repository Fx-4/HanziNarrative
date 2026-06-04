import { motion } from 'framer-motion'
import { WritingStats } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Pencil,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  LogIn,
  AlertCircle
} from 'lucide-react'
import BlurText from '@/components/animations/BlurText'
import TiltCard from '@/components/animations/TiltCard'
import SpotlightCard from '@/components/animations/SpotlightCard'
import CountUp from '@/components/animations/CountUp'
import StrokeOrderLookup from './StrokeOrderLookup'

interface WritingModeSelectionProps {
  hskLevel: number
  user: { id: number; username: string } | null
  stats: WritingStats | null
  statsLoading: boolean
  onHskLevelChange: (level: number) => void
  onModeSelect: (mode: 'practice' | 'timed' | 'mastery') => void
  onNavigate: (path: string) => void
}

export default function WritingModeSelection({
  hskLevel,
  user,
  stats,
  statsLoading,
  onHskLevelChange,
  onModeSelect,
  onNavigate
}: WritingModeSelectionProps) {
  const renderStatsCard = () => {
    if (statsLoading) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      )
    }

    if (!stats) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 rounded-t-3xl" />
        <div className="bg-white dark:bg-gray-900 rounded-b-3xl shadow-xl border border-gray-100 dark:border-gray-800 border-t-0 overflow-hidden p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Your Progress (HSK {hskLevel})</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-primary-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary-200" />
                <p className="text-xs text-primary-200 font-medium">Mastered</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.mastered_characters} duration={1.2} />
              </p>
            </div>

            <div className="bg-primary-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-200" />
                <p className="text-xs text-primary-200 font-medium">Learning</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.characters_in_progress} duration={1.2} />
              </p>
            </div>

            <div className="bg-violet-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-violet-200" />
                <p className="text-xs text-violet-200 font-medium">New</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.new_characters} duration={1.2} />
              </p>
            </div>

            <div className="bg-orange-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="w-4 h-4 text-orange-200" />
                <p className="text-xs text-orange-200 font-medium">Total Practiced</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.total_characters_practiced} duration={1.2} />
              </p>
            </div>

            <div className="bg-pink-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-pink-200" />
                <p className="text-xs text-pink-200 font-medium">Attempts</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.total_attempts} duration={1.2} />
              </p>
            </div>

            <div className="bg-amber-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-200" />
                <p className="text-xs text-amber-200 font-medium">Accuracy</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.average_accuracy} duration={1.2} decimals={0} suffix="%" />
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Pencil className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
          <BlurText
            as="h1"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100"
            wordDelay={0.08}
          >
            Writing Practice
          </BlurText>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
          Master Chinese characters through practice
        </p>
      </motion.div>

      {/* Login Banner for unauthenticated users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-50 dark:from-orange-950/30 to-yellow-50 dark:to-yellow-950/30 rounded-3xl shadow-xl border border-orange-200 dark:border-orange-800 overflow-hidden p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Login to Track Your Progress
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
                  You can practice writing without logging in, but your progress won't be saved.
                  Login or register to track your learning journey, save your scores, and see detailed statistics!
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate('/login')}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-5 py-2.5 font-semibold cursor-pointer flex items-center gap-2 text-sm sm:text-base transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('/register')}
                    className="border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-2xl px-5 py-2.5 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* HSK Level Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Select HSK Level</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => onHskLevelChange(level)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  hskLevel === level
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Display */}
      {renderStatsCard()}

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onModeSelect('practice')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(59,130,246,0.15)">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full text-center p-4 sm:p-6 group">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6" />
                <div className="mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Pencil className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Free Practice
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Practice writing characters at your own pace. Learn stroke order and improve muscle memory.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400">
                  Recommended for beginners
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onModeSelect('timed')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(245,158,11,0.15)">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full text-center p-4 sm:p-6 group">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6" />
                <div className="mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Timed Challenge
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Race against the clock! Complete as many characters as you can within the time limit.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400">
                  Build speed &amp; confidence
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onModeSelect('mastery')}
          className="cursor-pointer sm:col-span-2 lg:col-span-1"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(139,92,246,0.15)">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full text-center p-4 sm:p-6 group">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6" />
                <div className="mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Mastery Mode
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Focus on characters you haven't mastered yet. Adaptive difficulty based on your performance.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400">
                  Advanced practice
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>
      </div>

      {/* Stroke Order Lookup Tool */}
      <StrokeOrderLookup />

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8"
      >
        <div className="bg-gradient-to-r from-primary-50 dark:from-primary-950/30 to-blue-50 dark:to-blue-950/30 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex-shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Writing Tips</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>â€¢ Follow the stroke order animation carefully</li>
                <li>â€¢ Practice each character multiple times for better retention</li>
                <li>â€¢ Focus on accuracy first, speed will come naturally</li>
                <li>â€¢ Take breaks between practice sessions</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

