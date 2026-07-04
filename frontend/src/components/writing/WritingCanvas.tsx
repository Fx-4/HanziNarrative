import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { HanziWord, AttemptResult } from '@/types'

interface HanziStrokeData {
  strokeNum?: number
  strokesRemaining?: number
  totalMistakes?: number
}
interface HanziSummaryData {
  totalMistakes?: number
  [key: string]: unknown
}
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Play,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react'
import { createLogger } from '@/utils/debugLogger'

const writingCanvasLogger = createLogger('WritingCanvas')

interface WritingCanvasProps {
  character: HanziWord
  showStrokeOrder?: boolean
  onComplete?: (result: AttemptResult) => void
  mode?: 'practice' | 'timed' | 'mastery' | null
}

export default function WritingCanvas({
  character,
  onComplete,
  mode = 'practice'
}: WritingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null)
  const [canvasSize, setCanvasSize] = useState(260)
  // Write-from-memory: canvas outline starts HIDDEN too — the outline is the
  // answer's shape, so showing it on open defeats the memory practice.
  // User reveals it with the Show Hints toggle (or per-stroke flash after 2 misses).
  const [showHints, setShowHints] = useState(false)
  // The answer character stays hidden until the user asks (free toggle)
  const [hanziRevealed, setHanziRevealed] = useState(false)
  const [strokesCompleted, setStrokesCompleted] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const mistakesRef = useRef(0)
  const totalStrokesRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Measure container and update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setCanvasSize(Math.min(300, Math.max(200, w - 32)))
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const handleCompleteRef = useRef<(summaryData: HanziSummaryData) => void>(() => { })
  handleCompleteRef.current = (summaryData: HanziSummaryData) => {
    const prev = startTimeRef.current
    if (!prev) return
    const timeTaken = (Date.now() - prev) / 1000
    // HanziWriter onComplete provides { character, totalMistakes }
    const totalMistakesCount = summaryData.totalMistakes ?? mistakesRef.current
    const strokes = totalStrokesRef.current || 1
    const accuracyScore = Math.max(0, Math.round(
      ((strokes - totalMistakesCount) / strokes) * 100
    ))
    setAccuracy(accuracyScore)
    setIsComplete(true)
    if (onComplete) {
      onComplete({
        accuracy: accuracyScore,
        timeTaken,
        strokeData: {
          ...summaryData,
          strokeCount: strokes,
          totalMistakes: totalMistakesCount
        }
      })
    }
  }

  // Shared quiz callbacks — used by initial mount, Reset, and Stroke Guide restart
  // so the three paths can never drift apart again
  const quizCallbacks = {
    onMistake: (strokeData: HanziStrokeData) => {
      mistakesRef.current = strokeData.totalMistakes ?? (mistakesRef.current + 1)
      setMistakes(mistakesRef.current)
      if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
        const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
        totalStrokesRef.current = total
        setTotalStrokes(total)
      }
    },
    onCorrectStroke: (strokeData: HanziStrokeData) => {
      if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
        const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
        totalStrokesRef.current = total
        setTotalStrokes(total)
      }
      setStrokesCompleted(prev => {
        const newCount = prev + 1
        if (newCount === 1) startTimeRef.current = Date.now()
        return newCount
      })
    },
    onComplete: (summaryData: HanziSummaryData) => handleCompleteRef.current(summaryData)
  }

  // Quiz always restarts from stroke 0, so the visible progress must restart too —
  // otherwise the counter/bar keep their old value and overflow past 100%
  const resetProgress = () => {
    mistakesRef.current = 0
    startTimeRef.current = null
    setStrokesCompleted(0)
    setMistakes(0)
    setIsComplete(false)
    setAccuracy(0)
  }

  useEffect(() => {
    if (!canvasRef.current || canvasSize === 0) return

    // Clean up previous writer BEFORE creating new one
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz()
      } catch { /* no-op */ }
      writerRef.current = null
    }

    canvasRef.current.innerHTML = ''
    setLoadError(false)
    setIsAnimating(false)
    setStrokesCompleted(0)
    setMistakes(0)
    setTotalStrokes(0)
    setIsComplete(false)
    setAccuracy(0)
    setHanziRevealed(false)
    startTimeRef.current = null
    mistakesRef.current = 0
    totalStrokesRef.current = 0

    // HanziWriter only supports single characters — use first char for multi-char words
    const char = character.simplified.charAt(0)

    try {
      const writer = HanziWriter.create(canvasRef.current, char, {
        width: canvasSize,
        height: canvasSize,
        padding: Math.round(canvasSize * 0.07),
        strokeColor: '#4F46E5',
        radicalColor: '#7C3AED',
        outlineColor: '#E5E7EB',
        showCharacter: false,
        showOutline: showHints,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        highlightCompleteColor: '#10B981',
        drawingColor: '#1F2937',
        drawingWidth: 4,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        onLoadCharDataSuccess: (data: { strokes?: unknown[] }) => {
          // Know the stroke count up front — "0 / 6" from the start, and the
          // stroke guide can tell which strokes remain before the first mistake
          const n = data?.strokes?.length ?? 0
          if (n > 0) {
            totalStrokesRef.current = n
            setTotalStrokes(n)
          }
        },
        onLoadCharDataError: (err: unknown) => {
          writingCanvasLogger.warn(`HanziWriter: failed to load "${char}"`, err)
          setLoadError(true)
        }
      })

      writerRef.current = writer

      writer.quiz(quizCallbacks)
    } catch (error) {
      writingCanvasLogger.error(`Error creating HanziWriter for ${character.simplified}:`, error)
    }

    return () => {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz()
        } catch { /* no-op */ }
        writerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.simplified, canvasSize])

  useEffect(() => {
    if (writerRef.current) {
      if (showHints) {
        writerRef.current.showOutline()
      } else {
        writerRef.current.hideOutline()
      }
    }
  }, [showHints])

  const handleReset = () => {
    if (!writerRef.current) return
    writerRef.current.cancelQuiz()
    totalStrokesRef.current = 0
    writerRef.current.quiz(quizCallbacks)
    resetProgress()
  }

  const toggleHints = () => setShowHints(h => !h)

  const handlePlayStrokeGuide = () => {
    const writer = writerRef.current
    if (!writer || isAnimating) return
    const total = totalStrokesRef.current
    // Mid-quiz: demo only the remaining strokes and resume where the user was.
    // Already complete (or count unknown): full demo + fresh restart.
    const startFrom = !isComplete && total > 0 && strokesCompleted < total ? strokesCompleted : 0
    setIsAnimating(true)
    writer.cancelQuiz()
    writer.showOutline()

    const resumeQuiz = () => {
      if (!writerRef.current) return
      setIsAnimating(false)
      writerRef.current.hideCharacter()
      // The demo turned the outline on — restore the user's hint preference
      if (!showHints) writerRef.current.hideOutline()
      // quizStartStrokeNum redraws earlier strokes automatically, so the
      // counter/bar keep their value instead of resetting or overflowing
      writerRef.current.quiz({ ...quizCallbacks, quizStartStrokeNum: startFrom })
      if (startFrom === 0) resetProgress()
    }

    if (total === 0) {
      // Char data not loaded yet — fall back to full-character demo
      writer.showCharacter()
      writer.animateCharacter({ onComplete: resumeQuiz })
      return
    }

    const animateFrom = (n: number) => {
      if (!writerRef.current) return
      if (n >= total) {
        resumeQuiz()
        return
      }
      writerRef.current.animateStroke(n, { onComplete: () => animateFrom(n + 1) })
    }
    animateFrom(startFrom)
  }

  const progress = totalStrokes > 0 ? (strokesCompleted / totalStrokes) * 100 : 0

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Character Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Answer hidden by default — tap to toggle (write from memory) */}
            <button
              type="button"
              onClick={() => setHanziRevealed(r => !r)}
              title={hanziRevealed ? 'Hide character' : 'Show character (hint)'}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                hanziRevealed
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              {hanziRevealed ? (
                <span className="text-3xl sm:text-4xl font-chinese text-gray-900 dark:text-gray-100">{character.simplified}</span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-chinese text-gray-300 dark:text-gray-600 select-none">？</span>
                  <Eye className="w-3.5 h-3.5 text-gray-400 absolute bottom-1 right-1" />
                </>
              )}
            </button>
            <div>
              <div className="text-base sm:text-xl text-primary-600 dark:text-primary-400 font-semibold">
                {character.pinyin}
              </div>
              <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{character.english}</div>
              {!hanziRevealed && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Tap ？ for a hint</div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Strokes</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {strokesCompleted} / {totalStrokes}
            </div>
            {mistakes > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                {mistakes} mistake{mistakes !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              ref={canvasRef}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white shadow-inner dark:bg-surface-card"
              style={{ width: canvasSize, height: canvasSize }}
            />
            {loadError && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 rounded-xl"
                style={{ width: canvasSize, height: canvasSize }}
              >
                <span className="text-6xl font-chinese text-gray-300 dark:text-gray-600 mb-2">{character.simplified}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                  Data karakter tidak tersedia
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 sm:gap-3 justify-center w-full">
            <button
              onClick={handlePlayStrokeGuide}
              disabled={isAnimating}
              className={`flex-1 sm:flex-none rounded-xl px-3 sm:px-4 py-2.5 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm ${
                isAnimating
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              {isAnimating ? 'Playing...' : 'Stroke Guide'}
            </button>

            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl px-3 sm:px-4 py-2.5 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button
              onClick={toggleHints}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl px-3 sm:px-4 py-2.5 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {showHints ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden xs:inline">Hide</span> Hints
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden xs:inline">Show</span> Hints
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Feedback */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <div className={`rounded-2xl shadow-sm p-4 sm:p-5 ${accuracy >= 80
              ? 'bg-gradient-to-r from-success-50 to-success-50 dark:from-success-950/30 dark:to-success-950/30 border border-success-200 dark:border-success-800'
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200 dark:border-yellow-800'
              }`}>
              <div className="flex items-center gap-3">
                {accuracy >= 80 ? (
                  <div className="p-2.5 bg-success-100 dark:bg-success-900/50 rounded-full flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                  </div>
                ) : accuracy >= 60 ? (
                  <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                ) : (
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-full flex-shrink-0">
                    <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                )}

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                    {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Accuracy: <span className="font-semibold">{accuracy}%</span>
                    {mistakes > 0 && ` • ${mistakes} mistake${mistakes !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {mode === 'practice' && !isComplete && (
        <div className="rounded-2xl border p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
              <strong>Tip:</strong> Tulis setiap goresan dengan benar. Toggle hints untuk latihan lebih menantang!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
