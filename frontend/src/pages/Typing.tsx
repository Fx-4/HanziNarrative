import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { typingApi } from '@/services/api'
import type { HanziWord, TypingStats, TypingMode } from '@/types'
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
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import PinyinTypingMode from '@/components/typing/PinyinTypingMode'
import IMEPracticeMode from '@/components/typing/IMEPracticeMode'
import SpeedTypingMode from '@/components/typing/SpeedTypingMode'
import BlurText from '@/components/animations/BlurText'
import TiltCard from '@/components/animations/TiltCard'
import SpotlightCard from '@/components/animations/SpotlightCard'
import CountUp from '@/components/animations/CountUp'

export default function Typing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [mode, setMode] = useState<TypingMode>(null)
  const [hskLevel, setHskLevel] = useState(1)
  const [words, setWords] = useState<HanziWord[]>([])
  const [stats, setStats] = useState<TypingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [hskLevel, user])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await typingApi.getStats(undefined, hskLevel)
      setStats(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        setStats({
          total_words_practiced: 0,
          total_attempts: 0,
          average_accuracy: 0,
          average_wpm: 0,
          best_wpm: 0,
          mastered_words: 0,
          words_in_progress: 0,
          new_words: 0
        })
      } else {
        console.error('Failed to load stats:', error)
      }
    } finally {
      setStatsLoading(false)
    }
  }

  const handleModeSelect = async (selectedMode: TypingMode) => {
    if (!user) {
      toast.error('Please log in to practice typing')
      return
    }

    setMode(selectedMode)
    setLoading(true)
    try {
      const limit = selectedMode === 'speed' ? 10 : 20
      const data = await typingApi.getWords(hskLevel, selectedMode!, limit)
      setWords(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to practice typing')
        setMode(null)
      } else {
        console.error('Failed to load words:', error)
        toast.error('Failed to load words')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackToModes = () => {
    setMode(null)
    if (user) {
      loadStats()
    }
  }

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
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Your Progress (HSK {hskLevel})</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-emerald-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-emerald-200" />
                  <p className="text-xs text-emerald-100 font-medium">Mastered</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  <CountUp to={stats.mastered_words} duration={1.2} />
                </p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-200" />
                  <p className="text-xs text-indigo-100 font-medium">Accuracy</p>
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

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Keyboard className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
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
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
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
                onClick={() => setHskLevel(level)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  hskLevel === level
                    ? 'bg-indigo-600 text-white shadow-md'
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
          onClick={() => handleModeSelect('pinyin')}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
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
          onClick={() => handleModeSelect('ime')}
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
          onClick={() => handleModeSelect('speed')}
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
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl shadow-xl border border-indigo-100 overflow-hidden p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
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

  const renderPracticeMode = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={handleBackToModes}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium cursor-pointer rounded-2xl px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modes
          </button>
        </div>

        {mode === 'pinyin' && (
          <PinyinTypingMode
            words={words}
            hskLevel={hskLevel}
            onBack={handleBackToModes}
          />
        )}
        {mode === 'ime' && (
          <IMEPracticeMode
            words={words}
            hskLevel={hskLevel}
            onBack={handleBackToModes}
          />
        )}
        {mode === 'speed' && (
          <SpeedTypingMode
            words={words}
            hskLevel={hskLevel}
            onBack={handleBackToModes}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 bg-gray-50">
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderModeSelection()}
          </motion.div>
        )}
        {mode && (
          <motion.div
            key="practice-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderPracticeMode()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
