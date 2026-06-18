import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord, WritingProgress, AttemptResult } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Clock,
  Target,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import {
  WritingCanvas,
  CharacterGrid,
  WritingFeedback
} from '@/components/writing'

interface WritingSessionProps {
  mode: 'practice' | 'timed' | 'mastery'
  characters: HanziWord[]
  currentCharacter: HanziWord | null
  currentCharacterIndex: number
  sessionResults: AttemptResult[]
  showFeedback: boolean
  lastAttemptResult: AttemptResult | null
  countdown: number | null
  timeRemaining: number
  progressData: WritingProgress[]
  loading: boolean
  onBack: () => void
  onCharacterComplete: (result: AttemptResult) => void
  onNextCharacter: () => void
  onPreviousCharacter: () => void
  onCharacterSelect: (character: HanziWord) => void
}

export default function WritingSession({
  mode,
  characters,
  currentCharacter,
  currentCharacterIndex,
  sessionResults,
  showFeedback,
  lastAttemptResult,
  countdown,
  timeRemaining,
  progressData,
  loading,
  onBack,
  onCharacterComplete,
  onNextCharacter,
  onPreviousCharacter,
  onCharacterSelect
}: WritingSessionProps) {
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
            onClick={onBack}
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
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium cursor-pointer flex items-center gap-1 transition-colors"
          >
            ← Back to Modes
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {mode === 'timed' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden px-3 py-2 sm:px-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                  <span className={`text-base sm:text-lg font-bold ${timeRemaining < 60 ? 'text-error-600 dark:text-error-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden px-3 py-2 sm:px-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
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
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentCharacterIndex + 1) / characters.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Character Grid — compact top panel on mobile/tablet, sidebar on desktop */}
      {mode === 'practice' && (
        <div className="mb-4 lg:hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden dark:bg-surface-card dark:border-gray-700">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Select Character</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">{currentCharacterIndex + 1}/{characters.length}</span>
            </div>
            <div className="p-2.5 max-h-60 overflow-y-auto">
              <CharacterGrid
                characters={characters}
                progress={progressData}
                selectedCharacter={currentCharacter}
                onCharacterSelect={onCharacterSelect}
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
                <span className="text-xs text-gray-500 dark:text-gray-400">{characters.length}</span>
              </div>
              <div className="p-2.5 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
                <CharacterGrid
                  characters={characters}
                  progress={progressData}
                  selectedCharacter={currentCharacter}
                  onCharacterSelect={onCharacterSelect}
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
                <div>
                  {/* Navigation bar above canvas */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={onPreviousCharacter}
                      disabled={currentCharacterIndex === 0}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {currentCharacterIndex + 1} / {characters.length}
                    </span>

                    <button
                      onClick={onNextCharacter}
                      disabled={currentCharacterIndex === characters.length - 1 && characters.length === 0}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <WritingCanvas
                    character={currentCharacter}
                    onComplete={onCharacterComplete}
                    mode={mode}
                  />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {lastAttemptResult && currentCharacter && (
                    <>
                      <WritingFeedback
                        accuracy={lastAttemptResult.accuracy}
                        timeTaken={lastAttemptResult.timeTaken}
                        mistakes={(lastAttemptResult.strokeData?.totalMistakes as number | undefined) || 0}
                        totalStrokes={(lastAttemptResult.strokeData?.strokeCount as number | undefined) || 0}
                        previousAccuracy={
                          progressData.find(p => p.word_id === currentCharacter.id)?.accuracy_score
                        }
                        isNewRecord={
                          lastAttemptResult.accuracy >
                          (progressData.find(p => p.word_id === currentCharacter.id)?.accuracy_score || 0)
                        }
                      />

                      {/* Countdown + Navigation */}
                      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-4 sm:p-6">
                        <div className="flex flex-col items-center gap-4 sm:gap-5">
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lanjut otomatis</p>
                            {/* Countdown circle */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mt-1">
                              <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="6" className="dark:stroke-gray-700" />
                                <circle
                                  cx="40" cy="40" r="34"
                                  fill="none"
                                  stroke="#4F46E5"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={213.6283}
                                  strokeDashoffset={213.6283 * (1 - (countdown ?? 5) / 5)}
                                  className="transition-all duration-1000 ease-linear"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {countdown ?? 5}
                              </span>
                            </div>
                          </div>

                          {/* Nav buttons */}
                          <div className="flex gap-2 sm:gap-3 w-full">
                            <button
                              onClick={onPreviousCharacter}
                              disabled={currentCharacterIndex === 0}
                              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl px-3 sm:px-4 py-3 font-semibold cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                            </button>
                            <button
                              onClick={onNextCharacter}
                              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-3 sm:px-4 py-3 font-semibold cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
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

