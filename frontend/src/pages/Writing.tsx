import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { writingApi, vocabularyApi } from '@/services/api'
import { HanziWord, WritingStats, WritingProgress, AttemptResult } from '@/types'
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
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  LogIn,
  AlertCircle,
  Search,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import {
  WritingCanvas,
  CharacterGrid,
  WritingFeedback,
  StrokeOrderAnimation
} from '@/components/writing'
import BlurText from '@/components/animations/BlurText'
import TiltCard from '@/components/animations/TiltCard'
import SpotlightCard from '@/components/animations/SpotlightCard'
import CountUp from '@/components/animations/CountUp'

type WritingMode = 'practice' | 'timed' | 'mastery' | null

// ─── Stroke Order Lookup ─────────────────────────────────────────────────────
function StrokeOrderLookup() {
  const [inputValue, setInputValue] = useState('')
  const [lookupChar, setLookupChar] = useState<string | null>(null)
  const [wordInfo, setWordInfo] = useState<HanziWord | null>(null)
  const [infoLoading, setInfoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isChinese = (char: string) => /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(char)

  const fetchWordInfo = async (char: string) => {
    setInfoLoading(true)
    setWordInfo(null)
    try {
      const results = await vocabularyApi.searchWords(char)
      const exact = results.find(w => w.simplified === char) || results[0] || null
      setWordInfo(exact)
    } catch {
      setWordInfo(null)
    } finally {
      setInfoLoading(false)
    }
  }

  const handleSearch = () => {
    const chars = [...inputValue].filter(isChinese)
    if (chars.length === 0) {
      setError('Masukkan minimal 1 karakter hanzi')
      return
    }
    setError(null)
    setLookupChar(chars[0])
    fetchWordInfo(chars[0])
  }

  const handleCharSelect = (char: string) => {
    setLookupChar(char)
    setError(null)
    fetchWordInfo(char)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setInputValue('')
    setLookupChar(null)
    setWordInfo(null)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="mt-6 sm:mt-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-500" />
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cari Cara Menulis Hanzi
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Ketik karakter hanzi, lalu lihat animasi urutan goresannya
          </p>

          {/* Input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setError(null) }}
                onKeyDown={handleKeyDown}
                placeholder="Ketik hanzi, misal: 你好学"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xl font-chinese text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3 font-semibold cursor-pointer flex items-center gap-2 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              Cari
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {/* Character selector when input has multiple chars */}
          {inputValue && [...inputValue].filter(isChinese).length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Pilih karakter:</span>
              {[...inputValue].filter(isChinese).map((char, i) => (
                <button
                  key={i}
                  onClick={() => handleCharSelect(char)}
                  className={`text-xl font-chinese rounded-xl px-3 py-1.5 border cursor-pointer transition-colors ${
                    lookupChar === char
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          {/* Stroke order display */}
          <AnimatePresence mode="wait">
            {lookupChar && (
              <motion.div
                key={lookupChar}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 grid sm:grid-cols-2 gap-6 items-start"
              >
                {/* Left: character info */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-8xl font-chinese text-gray-800 dark:text-gray-200 leading-none">{lookupChar}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">U+{lookupChar.charCodeAt(0).toString(16).toUpperCase()}</span>

                  {/* Word info panel */}
                  {infoLoading ? (
                    <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                  ) : wordInfo ? (
                    <div className="w-full rounded-2xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-teal-700 dark:text-teal-400 font-chinese">{wordInfo.pinyin}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                          HSK {wordInfo.hsk_level}
                        </span>
                        {wordInfo.strokes && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {wordInfo.strokes} goresan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{wordInfo.english}</p>
                      {wordInfo.radical && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Radikal: <span className="font-chinese">{wordInfo.radical}</span></p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Info tidak ditemukan di database</p>
                  )}
                </div>

                {/* Right: stroke animation */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">Animasi cara menulis:</p>
                  <StrokeOrderAnimation
                    character={lookupChar}
                    size={220}
                    autoPlay={true}
                    loop={true}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function Writing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [mode, setMode] = useState<WritingMode>(null)
  const [hskLevel, setHskLevel] = useState(1)
  const [characters, setCharacters] = useState<HanziWord[]>([])
  const [stats, setStats] = useState<WritingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [progressData, setProgressData] = useState<WritingProgress[]>([])

  // Practice session state
  const [currentCharacter, setCurrentCharacter] = useState<HanziWord | null>(null)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState<AttemptResult[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAttemptResult, setLastAttemptResult] = useState<AttemptResult | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timed mode state
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    loadStats()
    loadProgress()
  }, [hskLevel])

  // Timer effect for timed mode
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined

    if (mode === 'timed' && timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            handleTimedModeComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [mode, timerActive, timeRemaining])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await writingApi.getStats(hskLevel)
      setStats(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        setStats({
          total_characters_practiced: 0,
          total_attempts: 0,
          average_accuracy: 0,
          mastered_characters: 0,
          characters_in_progress: 0,
          new_characters: 0
        })
      } else {
        console.error('Failed to load stats:', error)
      }
    } finally {
      setStatsLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const data = await writingApi.getProgress(hskLevel)
      setProgressData(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        setProgressData([])
      } else {
        console.error('Failed to load progress:', error)
      }
    }
  }

  const loadCharacters = async () => {
    setLoading(true)
    try {
      const limit = mode === 'timed' ? 10 : 20
      const data = await writingApi.getCharacters(hskLevel, limit)
      setCharacters(data)

      if (data.length > 0) {
        setCurrentCharacter(data[0])
        setCurrentCharacterIndex(0)
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to practice writing')
        setMode(null)
      } else {
        console.error('Failed to load characters:', error)
        toast.error('Failed to load characters')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelect = async (selectedMode: WritingMode) => {
    setMode(selectedMode)
    setSessionResults([])

    if (selectedMode === 'timed') {
      setTimeRemaining(300)
      setTimerActive(true)
    }

    await loadCharacters()
  }

  const handleCharacterComplete = async (result: AttemptResult) => {
    if (!currentCharacter) return

    setLastAttemptResult(result)
    setShowFeedback(true)
    setSessionResults(prev => [...prev, result])

    try {
      const accuracy = Math.max(0, Math.min(100, result.accuracy || 0))
      const timeTaken = Math.max(0, result.timeTaken || 0)

      if (!currentCharacter.id || typeof currentCharacter.id !== 'number') {
        console.error('Invalid word_id:', currentCharacter.id)
        return
      }

      await writingApi.recordAttempt({
        word_id: currentCharacter.id,
        accuracy_score: accuracy,
        time_taken: timeTaken,
        stroke_accuracy: result.strokeData?.strokeAccuracy || []
      })

      await loadStats()
      await loadProgress()
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast('Progress not saved - please log in to track your progress', {
          icon: '⚠️',
          duration: 3000
        })
      } else {
        console.error('Failed to record attempt:', error)
        console.error('Error response:', error.response?.data)
        console.error('Attempt data:', {
          word_id: currentCharacter.id,
          accuracy: result.accuracy,
          timeTaken: result.timeTaken
        })
        toast.error('Failed to save progress')
      }
    }
  }

  // Countdown effect — starts when feedback screen appears, auto-advances after 5s
  useEffect(() => {
    if (!showFeedback) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      setCountdown(null)
      return
    }

    setCountdown(5)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showFeedback])

  // Auto-advance when countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      handleNextCharacter()
    }
  }, [countdown])

  const handleNextCharacter = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    setShowFeedback(false)
    setLastAttemptResult(null)
    setCountdown(null)

    if (currentCharacterIndex < characters.length - 1) {
      const nextIndex = currentCharacterIndex + 1
      setCurrentCharacterIndex(nextIndex)
      setCurrentCharacter(characters[nextIndex])
    } else {
      handleSessionComplete()
    }
  }

  const handlePreviousCharacter = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    setShowFeedback(false)
    setLastAttemptResult(null)
    setCountdown(null)

    if (currentCharacterIndex > 0) {
      const prevIndex = currentCharacterIndex - 1
      setCurrentCharacterIndex(prevIndex)
      setCurrentCharacter(characters[prevIndex])
    }
  }

  const handleSessionComplete = () => {
    const avgAccuracy = sessionResults.reduce((acc, r) => acc + r.accuracy, 0) / sessionResults.length

    toast.success(`Session complete! Average accuracy: ${Math.round(avgAccuracy)}%`)
    setMode(null)
    setCurrentCharacter(null)
    setSessionResults([])
    setTimerActive(false)
  }

  const handleTimedModeComplete = () => {
    toast.success(`Time's up! You completed ${sessionResults.length} characters!`)
    handleSessionComplete()
  }

  const handleCharacterSelect = (character: HanziWord) => {
    setCurrentCharacter(character)
    setShowFeedback(false)
    setLastAttemptResult(null)
  }

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
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-t-3xl" />
        <div className="bg-white dark:bg-gray-900 rounded-b-3xl shadow-xl border border-gray-100 dark:border-gray-800 border-t-0 overflow-hidden p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Your Progress (HSK {hskLevel})</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-indigo-200" />
                <p className="text-xs text-indigo-200 font-medium">Mastered</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                <CountUp to={stats.mastered_characters} duration={1.2} />
              </p>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-200" />
                <p className="text-xs text-indigo-200 font-medium">Learning</p>
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

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Pencil className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400" />
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
                    onClick={() => navigate('/login')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-2.5 font-semibold cursor-pointer flex items-center gap-2 text-sm sm:text-base transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl px-5 py-2.5 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
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
                onClick={() => setHskLevel(level)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  hskLevel === level
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
          onClick={() => handleModeSelect('practice')}
          className="cursor-pointer"
        >
          <TiltCard maxTilt={8} scale={1.03}>
            <SpotlightCard spotlightColor="rgba(59,130,246,0.15)">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full text-center p-4 sm:p-6 group">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6" />
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
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
          onClick={() => handleModeSelect('timed')}
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
          onClick={() => handleModeSelect('mastery')}
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
        <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-950/30 to-blue-50 dark:to-blue-950/30 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex-shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Writing Tips</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Follow the stroke order animation carefully</li>
                <li>• Practice each character multiple times for better retention</li>
                <li>• Focus on accuracy first, speed will come naturally</li>
                <li>• Take breaks between practice sessions</li>
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

    if (!currentCharacter) {
      return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="mb-6">
            <button
              onClick={() => setMode(null)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium cursor-pointer flex items-center gap-1 transition-colors"
            >
              ← Back to Modes
            </button>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No characters available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please try selecting a different HSK level or mode
            </p>
          </div>
        </div>
      )
    }

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header with progress and timer */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setMode(null)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium cursor-pointer flex items-center gap-1 transition-colors"
            >
              ← Back to Modes
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {mode === 'timed' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                    <span className={`text-base sm:text-lg font-bold ${timeRemaining < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden px-3 py-2 sm:px-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                    {currentCharacterIndex + 1} / {characters.length}
                  </span>
                </div>
              </div>

              {sessionResults.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 dark:text-amber-400" />
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Avg: {Math.round(sessionResults.reduce((acc, r) => acc + r.accuracy, 0) / sessionResults.length)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentCharacterIndex + 1) / characters.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Character Grid — compact top panel on mobile/tablet, sidebar on desktop */}
        {mode === 'practice' && (
          <div className="mb-4 lg:hidden">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">Select Character</h3>
                <span className="text-xs text-gray-400">{currentCharacterIndex + 1}/{characters.length}</span>
              </div>
              <div className="p-2.5 max-h-60 overflow-y-auto">
                <CharacterGrid
                  characters={characters}
                  progress={progressData}
                  selectedCharacter={currentCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  mode={mode}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Column: Character Grid (for practice mode only on desktop) */}
          {mode === 'practice' && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-4 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Characters</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{characters.length}</span>
                </div>
                <div className="p-2.5 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
                  <CharacterGrid
                    characters={characters}
                    progress={progressData}
                    selectedCharacter={currentCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    mode={mode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Column: Writing Canvas */}
          <div className={mode === 'practice' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCharacter.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {!showFeedback ? (
                  /* Writing Canvas + Stroke Order Panel side by side */
                  <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="md:col-span-2">
                      <WritingCanvas
                        character={currentCharacter}
                        onComplete={handleCharacterComplete}
                        mode={mode}
                        showStrokeOrder={mode === 'practice'}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-4 h-full flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                          Stroke Order Guide
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                          <StrokeOrderAnimation
                            character={currentCharacter.simplified}
                            size={180}
                            autoPlay={true}
                            loop={true}
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                          Ikuti urutan goresan ini
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {lastAttemptResult && currentCharacter && (
                      <>
                        <WritingFeedback
                          accuracy={lastAttemptResult.accuracy}
                          timeTaken={lastAttemptResult.timeTaken}
                          mistakes={lastAttemptResult.strokeData?.totalMistakes || 0}
                          totalStrokes={lastAttemptResult.strokeData?.strokeCount || 0}
                          previousAccuracy={
                            progressData.find(p => p.word_id === currentCharacter.id)?.accuracy_score
                          }
                          isNewRecord={
                            lastAttemptResult.accuracy >
                            (progressData.find(p => p.word_id === currentCharacter.id)?.accuracy_score || 0)
                          }
                        />

                        {/* Stroke Order Reference + Countdown */}
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Stroke Order Reference</h3>
                            <div className="flex justify-center">
                              <StrokeOrderAnimation
                                character={currentCharacter.simplified}
                                size={200}
                                autoPlay={true}
                                loop={true}
                              />
                            </div>
                          </div>

                          {/* Countdown + Navigation */}
                          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-4 sm:p-6 flex flex-col items-center justify-center gap-5">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lanjut otomatis dalam</p>
                            {/* Countdown circle */}
                            <div className="relative w-20 h-20">
                              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="6" className="dark:stroke-gray-700" />
                                <circle
                                  cx="40" cy="40" r="34"
                                  fill="none"
                                  stroke="#4F46E5"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 34}`}
                                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - (countdown ?? 5) / 5)}`}
                                  className="transition-all duration-1000 ease-linear"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {countdown ?? 5}
                              </span>
                            </div>

                            {/* Nav buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                              {currentCharacterIndex > 0 && (
                                <button
                                  onClick={handlePreviousCharacter}
                                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl px-4 py-3 font-semibold cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  Back
                                </button>
                              )}
                              <button
                                onClick={handleNextCharacter}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-4 py-3 font-semibold cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
                              >
                                {currentCharacterIndex < characters.length - 1 ? (
                                  <>
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Selesai
                                    <CheckCircle className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {!mode && renderModeSelection()}
      {mode && renderPracticeMode()}
    </div>
  )
}
