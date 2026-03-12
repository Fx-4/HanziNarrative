import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { HanziWord, AttemptResult } from '@/types'
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

interface WritingCanvasProps {
  character: HanziWord
  showStrokeOrder?: boolean
  onComplete?: (result: AttemptResult) => void
  mode?: 'practice' | 'timed' | 'mastery' | null
}

export default function WritingCanvas({
  character,
  showStrokeOrder: _showStrokeOrder = true,
  onComplete,
  mode = 'practice'
}: WritingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [canvasSize, setCanvasSize] = useState(260)
  const [showHints, setShowHints] = useState(true)
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

  const handleCompleteRef = useRef<(summaryData: any) => void>(() => { })
  handleCompleteRef.current = (summaryData: any) => {
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

  useEffect(() => {
    if (!canvasRef.current || canvasSize === 0) return

    // Clean up previous writer BEFORE creating new one
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz()
      } catch (_) {}
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
        onLoadCharDataError: (err: any) => {
          console.warn(`HanziWriter: failed to load "${char}"`, err)
          setLoadError(true)
        }
      })

      writerRef.current = writer

      writer.quiz({
        onMistake: (strokeData: any) => {
          mistakesRef.current = strokeData.totalMistakes ?? (mistakesRef.current + 1)
          setMistakes(mistakesRef.current)
          if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
            const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
            totalStrokesRef.current = total
            setTotalStrokes(total)
          }
        },
        onCorrectStroke: (strokeData: any) => {
          if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
            const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
            totalStrokesRef.current = total
            setTotalStrokes(total)
          }
          setStrokesCompleted(prev => {
            const newCount = prev + 1
            if (newCount === 1) {
              startTimeRef.current = Date.now()
            }
            return newCount
          })
        },
        onComplete: (summaryData: any) => {
          handleCompleteRef.current(summaryData)
        }
      })
    } catch (error) {
      console.error(`Error creating HanziWriter for ${character.simplified}:`, error)
    }

    return () => {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz()
        } catch (_) {}
        writerRef.current = null
      }
    }
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

    // Reset refs
    mistakesRef.current = 0
    totalStrokesRef.current = 0

    writerRef.current.quiz({
      onMistake: (strokeData: any) => {
        mistakesRef.current = strokeData.totalMistakes ?? (mistakesRef.current + 1)
        setMistakes(mistakesRef.current)
        if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
          const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
          totalStrokesRef.current = total
          setTotalStrokes(total)
        }
      },
      onCorrectStroke: (strokeData: any) => {
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
      onComplete: (summaryData: any) => handleCompleteRef.current(summaryData)
    })
    setStrokesCompleted(0)
    setMistakes(0)
    startTimeRef.current = null
    setIsComplete(false)
    setAccuracy(0)
  }

  const toggleHints = () => setShowHints(h => !h)

  const handlePlayStrokeGuide = () => {
    if (!writerRef.current || isAnimating) return
    setIsAnimating(true)
    writerRef.current.cancelQuiz()
    writerRef.current.showCharacter()
    writerRef.current.showOutline()
    writerRef.current.animateCharacter({
      onComplete: () => {
        if (!writerRef.current) return
        setIsAnimating(false)
        writerRef.current.hideCharacter()
        // Restart quiz after animation
        writerRef.current.quiz({
          onMistake: (strokeData: any) => {
            mistakesRef.current = strokeData.totalMistakes ?? (mistakesRef.current + 1)
            setMistakes(mistakesRef.current)
            if (strokeData.strokeNum !== undefined && strokeData.strokesRemaining !== undefined) {
              const total = strokeData.strokeNum + strokeData.strokesRemaining + 1
              totalStrokesRef.current = total
              setTotalStrokes(total)
            }
          },
          onCorrectStroke: (strokeData: any) => {
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
          onComplete: (summaryData: any) => handleCompleteRef.current(summaryData)
        })
      }
    })
  }

  const progress = totalStrokes > 0 ? (strokesCompleted / totalStrokes) * 100 : 0

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Character Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl font-chinese">{character.simplified}</span>
            <div>
              <div className="text-base sm:text-xl text-indigo-600 dark:text-indigo-400 font-semibold">
                {character.pinyin}
              </div>
              <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{character.english}</div>
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
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full"
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
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white shadow-inner"
              style={{ width: canvasSize, height: canvasSize }}
            />
            {loadError && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 rounded-xl"
                style={{ width: canvasSize, height: canvasSize }}
              >
                <span className="text-6xl font-chinese text-gray-300 dark:text-gray-600 mb-2">{character.simplified}</span>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-4">
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
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800'
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200 dark:border-yellow-800'
              }`}>
              <div className="flex items-center gap-3">
                {accuracy >= 80 ? (
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-full flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
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
