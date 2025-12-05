import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { writingApi } from '@/services/api'
import { HanziWord, WritingStats, WritingProgress, AttemptResult } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
  CheckCircle,
  LogIn,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import {
  WritingCanvas,
  CharacterGrid,
  WritingFeedback,
  StrokeOrderAnimation
} from '@/components/writing'

type WritingMode = 'practice' | 'timed' | 'mastery' | null

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
        // User not logged in - show default empty stats
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
        // User not logged in - no progress data
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

    // Record attempt to backend (if logged in)
    try {
      // Validate data before sending
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

      // Reload stats and progress
      await loadStats()
      await loadProgress()
    } catch (error: any) {
      if (error.response?.status === 401) {
        // User not logged in - still show feedback but don't save
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

  const handleNextCharacter = () => {
    setShowFeedback(false)
    setLastAttemptResult(null)

    if (currentCharacterIndex < characters.length - 1) {
      const nextIndex = currentCharacterIndex + 1
      setCurrentCharacterIndex(nextIndex)
      setCurrentCharacter(characters[nextIndex])
    } else {
      handleSessionComplete()
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
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Your Progress (HSK {hskLevel})</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Mastered</p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {stats.mastered_characters}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Learning</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {stats.characters_in_progress}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-purple-700 font-medium">New</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {stats.new_characters}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-orange-700 font-medium">Total Practiced</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {stats.total_characters_practiced}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-pink-600" />
                <p className="text-xs text-pink-700 font-medium">Attempts</p>
              </div>
              <p className="text-2xl font-bold text-pink-900">
                {stats.total_attempts}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-700 font-medium">Accuracy</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {Math.round(stats.average_accuracy)}%
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Pencil className="w-10 h-10 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Writing Practice
          </h1>
        </div>
        <p className="text-xl text-gray-600">
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
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Login to Track Your Progress
                </h3>
                <p className="text-gray-700 mb-4">
                  You can practice writing without logging in, but your progress won't be saved.
                  Login or register to track your learning journey, save your scores, and see detailed statistics!
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate('/login')}
                    size="md"
                    variant="primary"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    size="md"
                    variant="outline"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* HSK Level Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <h3 className="text-lg font-semibold mb-4">Select HSK Level</h3>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <Button
                key={level}
                variant={hskLevel === level ? 'primary' : 'secondary'}
                onClick={() => setHskLevel(level)}
              >
                HSK {level}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Display */}
      {renderStatsCard()}

      {/* Mode Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleModeSelect('practice')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pencil className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Free Practice
            </h3>
            <p className="text-gray-600 mb-4">
              Practice writing characters at your own pace. Learn stroke order and improve muscle memory.
            </p>
            <Badge variant="default">Recommended for beginners</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleModeSelect('timed')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Timed Challenge
            </h3>
            <p className="text-gray-600 mb-4">
              Race against the clock! Complete as many characters as you can within the time limit.
            </p>
            <Badge variant="default">Build speed & confidence</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleModeSelect('mastery')}
          className="cursor-pointer"
        >
          <Card hover className="h-full text-center group">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Mastery Mode
            </h3>
            <p className="text-gray-600 mb-4">
              Focus on characters you haven't mastered yet. Adaptive difficulty based on your performance.
            </p>
            <Badge variant="default">Advanced practice</Badge>
          </Card>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Writing Tips</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Follow the stroke order animation carefully</li>
                <li>• Practice each character multiple times for better retention</li>
                <li>• Focus on accuracy first, speed will come naturally</li>
                <li>• Take breaks between practice sessions</li>
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

    if (!currentCharacter) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setMode(null)}>
              ← Back to Modes
            </Button>
          </div>
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No characters available</h2>
            <p className="text-gray-600 mb-4">
              Please try selecting a different HSK level or mode
            </p>
          </Card>
        </div>
      )
    }

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
      <div className="max-w-7xl mx-auto">
        {/* Header with progress and timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setMode(null)}>
              ← Back to Modes
            </Button>

            <div className="flex items-center gap-6">
              {mode === 'timed' && (
                <Card className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className={`text-lg font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </Card>
              )}

              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <span className="text-lg font-bold text-gray-900">
                    {currentCharacterIndex + 1} / {characters.length}
                  </span>
                </div>
              </Card>

              {sessionResults.length > 0 && (
                <Card className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-lg font-bold text-gray-900">
                      Avg: {Math.round(sessionResults.reduce((acc, r) => acc + r.accuracy, 0) / sessionResults.length)}%
                    </span>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentCharacterIndex + 1) / characters.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Character Grid - Always show at top on mobile, sidebar on desktop for practice mode */}
        {mode === 'practice' && (
          <div className="mb-6 lg:hidden">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Select Character</h3>
              <div className="max-h-96 overflow-y-auto">
                <CharacterGrid
                  characters={characters}
                  progress={progressData}
                  selectedCharacter={currentCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  mode={mode}
                />
              </div>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column: Character Grid (for practice mode only on desktop) */}
          {mode === 'practice' && (
            <div className="hidden lg:block lg:col-span-1">
              <Card className="p-3 sticky top-4">
                <h3 className="text-sm font-semibold mb-3">Characters</h3>
                <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <CharacterGrid
                    characters={characters}
                    progress={progressData}
                    selectedCharacter={currentCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    mode={mode}
                  />
                </div>
              </Card>
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
                  <WritingCanvas
                    character={currentCharacter}
                    onComplete={handleCharacterComplete}
                    mode={mode}
                    showStrokeOrder={mode === 'practice'}
                  />
                ) : (
                  <div className="space-y-6">
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

                        {/* Stroke Order Reference */}
                        <Card className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Stroke Order Reference</h3>
                          <div className="flex justify-center">
                            <StrokeOrderAnimation
                              character={currentCharacter.simplified}
                              size={250}
                              autoPlay={false}
                            />
                          </div>
                        </Card>

                        {/* Next Button */}
                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={handleNextCharacter}
                            size="lg"
                            variant="primary"
                          >
                            {currentCharacterIndex < characters.length - 1 ? (
                              <>
                                Next Character
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </>
                            ) : (
                              <>
                                Complete Session
                                <CheckCircle className="w-5 h-5 ml-2" />
                              </>
                            )}
                          </Button>
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
    <div className="min-h-screen py-8 px-4">
      {!mode && renderModeSelection()}
      {mode && renderPracticeMode()}
    </div>
  )
}
