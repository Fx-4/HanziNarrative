import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { typingApi } from '@/services/api'
import type { HanziWord, TypingStats, TypingMode } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import PinyinTypingMode from '@/components/typing/PinyinTypingMode'
import IMEPracticeMode from '@/components/typing/IMEPracticeMode'
import SpeedTypingMode from '@/components/typing/SpeedTypingMode'
import TypingModeSelection from './typing/TypingModeSelection'

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hskLevel, user])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await typingApi.getStats(undefined, hskLevel)
      setStats(data)
    } catch (error) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
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
    } catch (error) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
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
            <TypingModeSelection
              hskLevel={hskLevel}
              user={user}
              stats={stats}
              statsLoading={statsLoading}
              onHskLevelChange={setHskLevel}
              onModeSelect={handleModeSelect}
              onNavigate={navigate}
            />
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
