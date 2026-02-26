import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { typingApi } from '@/services/api'
import type { HanziWord, TypingStats, TypingMode } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        </Card>
      )
    }

    if (!stats) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold dark:text-gray-100">Your Progress (HSK {hskLevel})</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-green-700 dark:text-green-400" />
                <p className="text-xs text-green-800 dark:text-green-300 font-medium">Mastered</p>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                <CountUp to={stats.mastered_words} duration={1.2} />
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Accuracy</p>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                <CountUp to={stats.average_accuracy} duration={1.2} decimals={0} suffix="%" />
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">Avg WPM</p>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                <CountUp to={stats.average_wpm} duration={1.2} decimals={0} />
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">Best WPM</p>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                <CountUp to={stats.best_wpm} duration={1.2} decimals={0} />
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Keyboard className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          <BlurText
            as="h1"
            className="text-5xl font-bold text-gray-900 dark:text-gray-100"
            wordDelay={0.08}
          >
            Typing Practice
          </BlurText>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Master Chinese typing with pinyin input
        </p>
      </motion.div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
                  Login to Track Your Progress
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Track your typing speed, accuracy, and progress!
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate('/login')} size="md" variant="primary">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')} size="md" variant="outline">
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Select HSK Level</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={hskLevel === level ? 'primary' : 'secondary'}
                onClick={() => setHskLevel(level)}
              >
                HSK {level}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {renderStatsCard()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleModeSelect('pinyin')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(59,130,246,0.15)">
              <Card hover className="h-full text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Keyboard className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-gray-100">
                  Pinyin Typing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  See Chinese character, type correct pinyin spelling. Perfect for learning romanization.
                </p>
                <Badge variant="default">Learn spelling</Badge>
              </Card>
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
              <Card hover className="h-full text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-gray-100">
                  IME Practice
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Type pinyin and select correct character from candidates. Simulates real Chinese input.
                </p>
                <Badge variant="default">Real-world practice</Badge>
              </Card>
            </SpotlightCard>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleModeSelect('speed')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(245,158,11,0.15)">
              <Card hover className="h-full text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-gray-100">
                  Speed Typing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Test your typing speed! Type as fast as you can while maintaining accuracy.
                </p>
                <Badge variant="default">Build speed</Badge>
              </Card>
            </SpotlightCard>
          </TiltCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold mb-2 dark:text-gray-100">Typing Tips</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Pinyin Mode: Type plain pinyin (e.g., ni hao, zhong guo)</li>
                <li>• IME Mode: Select characters from candidates like real Chinese typing</li>
                <li>• Focus on accuracy first, speed will come naturally</li>
                <li>• Practice daily for best results</li>
              </ul>
            </div>
          </div>
        </Card>
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
          <Button
            variant="ghost"
            onClick={handleBackToModes}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modes
          </Button>
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
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-gray-900">
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
