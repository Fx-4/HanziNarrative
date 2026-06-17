import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { writingApi } from '@/services/api'
import { HanziWord, WritingStats, WritingProgress, AttemptResult } from '@/types'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import WritingModeSelection from './writing/WritingModeSelection'
import WritingSession from './writing/WritingSession'
import { createLogger } from '@/utils/debugLogger'

const writingLogger = createLogger('Writing')

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
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const seenCharacterIds = useRef<Set<number>>(new Set())

  // Timed mode state
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    loadStats()
    loadProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, timerActive, timeRemaining])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await writingApi.getStats(hskLevel)
      setStats(data)
    } catch (error) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
        setStats({
          total_characters_practiced: 0,
          total_attempts: 0,
          average_accuracy: 0,
          mastered_characters: 0,
          characters_in_progress: 0,
          new_characters: 0
        })
      } else {
        writingLogger.error('Failed to load stats:', error)
      }
    } finally {
      setStatsLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const data = await writingApi.getProgress(hskLevel)
      setProgressData(data)
    } catch (error) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
        setProgressData([])
      } else {
        writingLogger.error('Failed to load progress:', error)
      }
    }
  }

  const updateRecentHistory = (id: number) => {
    const RECENT_KEY = 'recentWritingIds'
    const MAX_RECENT = 20
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      const recent: number[] = stored ? JSON.parse(stored) : []
      // Remove existing entry if present, then add to end (most recent)
      const updated = [...recent.filter(x => x !== id), id]
      // Keep only last MAX_RECENT entries
      const trimmed = updated.slice(-MAX_RECENT)
      localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed))
    } catch {
      // ignore localStorage errors
    }
  }

  const loadCharacters = async () => {
    setLoading(true)
    try {
      const limit = mode === 'timed' ? 10 : 20
      const data = await writingApi.getCharacters(hskLevel, limit)

      // Filter out characters already seen in this session
      const unseen = data.filter(c => !seenCharacterIds.current.has(c.id as number))
      const toUse = unseen.length > 0 ? unseen : data

      // Sort: characters NOT in recent localStorage history come first
      const RECENT_KEY = 'recentWritingIds'
      let recentIds: number[] = []
      try {
        const stored = localStorage.getItem(RECENT_KEY)
        recentIds = stored ? JSON.parse(stored) : []
      } catch {
        // ignore
      }
      const recentSet = new Set(recentIds)
      const sorted = [...toUse].sort((a, b) => {
        const aRecent = recentSet.has(a.id as number) ? 1 : 0
        const bRecent = recentSet.has(b.id as number) ? 1 : 0
        return aRecent - bRecent
      })

      setCharacters(sorted)

      if (sorted.length > 0) {
        setCurrentCharacter(sorted[0])
        setCurrentCharacterIndex(0)
      }
    } catch (error) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
        toast.error('Please log in to practice writing')
        setMode(null)
      } else {
        writingLogger.error('Failed to load characters:', error)
        toast.error('Failed to load characters')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelect = async (selectedMode: 'practice' | 'timed' | 'mastery') => {
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
        writingLogger.error('Invalid word_id:', currentCharacter.id)
        return
      }

      await writingApi.recordAttempt({
        word_id: currentCharacter.id,
        accuracy_score: accuracy,
        time_taken: timeTaken,
        stroke_accuracy: (result.strokeData?.strokeAccuracy as number[] | undefined) || []
      })

      await loadStats()
      await loadProgress()
    } catch (error) {
      const err = error as { response?: { status?: number; data?: unknown } }
      if (err.response?.status === 401) {
        toast('Progress not saved - please log in to track your progress', {
          icon: '⚠️',
          duration: 3000
        })
      } else {
        writingLogger.error('Failed to record attempt:', error)
        writingLogger.error('Error response:', err.response?.data)
        writingLogger.error('Attempt data:', {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  const handleNextCharacter = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    setShowFeedback(false)
    setLastAttemptResult(null)
    setCountdown(null)

    // Mark current character as seen and update recent history
    if (currentCharacter?.id != null) {
      seenCharacterIds.current.add(currentCharacter.id as number)
      updateRecentHistory(currentCharacter.id as number)
    }

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

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {!mode && (
        <WritingModeSelection
          hskLevel={hskLevel}
          user={user}
          stats={stats}
          statsLoading={statsLoading}
          onHskLevelChange={setHskLevel}
          onModeSelect={handleModeSelect}
          onNavigate={navigate}
        />
      )}
      {mode && (
        <WritingSession
          mode={mode}
          characters={characters}
          currentCharacter={currentCharacter}
          currentCharacterIndex={currentCharacterIndex}
          sessionResults={sessionResults}
          showFeedback={showFeedback}
          lastAttemptResult={lastAttemptResult}
          countdown={countdown}
          timeRemaining={timeRemaining}
          progressData={progressData}
          loading={loading}
          onBack={() => setMode(null)}
          onCharacterComplete={handleCharacterComplete}
          onNextCharacter={handleNextCharacter}
          onPreviousCharacter={handlePreviousCharacter}
          onCharacterSelect={handleCharacterSelect}
        />
      )}
    </div>
  )
}
