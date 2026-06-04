import { motion } from 'framer-motion'
import type { TypingStats, TypingMode } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Keyboard,
  Zap,
  Target,
  BarChart3,
  Award,
  TrendingUp,
  BookOpen,
  LogIn,
  AlertCircle
} from 'lucide-react'
import BlurText from '@/components/animations/BlurText'
import TiltCard from '@/components/animations/TiltCard'
import SpotlightCard from '@/components/animations/SpotlightCard'
import CountUp from '@/components/animations/CountUp'

interface TypingModeSelectionProps {
  hskLevel: number
  user: { id: number; username: string } | null
  stats: TypingStats | null
  statsLoading: boolean
  onHskLevelChange: (level: number) => void
  onModeSelect: (mode: TypingMode) => void
  onNavigate: (path: string) => void
}

export default function TypingModeSelection({
  hskLevel,
  user,
  stats,
  statsLoading,
  onHskLevelChange,
  onModeSelect,
  onNavigate
}: TypingModeSelectionProps) {
  const renderStatsCard = () => {
    if (!user) return null

    if (statsLoading) {
      return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-4 sm:p-6">
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
        className="mb-8"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Your Progress (HSK {hskLevel})</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-success-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-success-200" />
                  <p className="text-xs text-success-100 font-medium">Mastered</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  <CountUp to={stats.mastered_words} duration={1.2} />
                </p>
              </div>

              <div className="bg-primary-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary-200" />
                  <p className="text-xs text-primary-100 font-medium">Accuracy</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  <CountUp to={stats.average_accuracy} duration={1.2} decimals={0} suffix="%" />
                </p>
              </div>

              <div className="bg-violet-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-violet-200" />
                  <p className="text-xs text-violet-100 font-medium">Avg WPM</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  <CountUp to={stats.average_wpm} duration={1.2} decimals={0} />
                </p>
              </div>

              <div className="bg-orange-500 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-200" />
                  <p className="text-xs text-orange-100 font-medium">Best WPM</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  <CountUp to={stats.best_wpm} duration={1.2} decimals={0} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Keyboard className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          <BlurText
            as="h1"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900"
            wordDelay={0.08}
          >
            Typing Practice
          </BlurText>
        </div>
        <p className="text-base sm:text-xl text-gray-600">
          Master Chinese typing with pinyin input
        </p>
      </motion.div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-full shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
                  Login to Track Your Progress
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  Track your typing speed, accuracy, and progress!
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate('/login')}
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('/register')}
                    className="inline-flex items-center border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Select HSK Level</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => onHskLevelChange(level)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  hskLevel === level
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {renderStatsCard()}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onModeSelect('pinyin')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(59,130,246,0.15)">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full text-center group p-6 sm:p-8 hover:shadow-2xl transition-shadow">
                <div className="mb-5 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Keyboard className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                  Pinyin Typing
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  See Chinese character, type correct pinyin spelling. Perfect for learning romanization.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  Learn spelling
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onModeSelect('ime')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(139,92,246,0.15)">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full text-center group p-6 sm:p-8 hover:shadow-2xl transition-shadow">
                <div className="mb-5 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                  IME Practice
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Type pinyin and select correct character from candidates. Simulates real Chinese input.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-700">
                  Real-world practice
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onModeSelect('speed')}
          className="cursor-pointer sm:col-span-2 md:col-span-1"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(245,158,11,0.15)">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full text-center group p-6 sm:p-8 hover:shadow-2xl transition-shadow">
                <div className="mb-5 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                  Speed Typing
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Test your typing speed! Type as fast as you can while maintaining accuracy.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                  Build speed
                </span>
              </div>
            </SpotlightCard>
          </TiltCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 sm:mt-8"
      >
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl shadow-xl border border-primary-100 overflow-hidden p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Typing Tips</h4>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li>- Pinyin Mode: Type plain pinyin (e.g., ni hao, zhong guo)</li>
                <li>- IME Mode: Select characters from candidates like real Chinese typing</li>
                <li>- Focus on accuracy first, speed will come naturally</li>
                <li>- Practice daily for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

