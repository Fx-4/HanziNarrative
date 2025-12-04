import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { HanziWord, AttemptResult } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Eye,
  EyeOff,
  Play,
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
  const canvasRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showHints, setShowHints] = useState(true)
  const [strokesCompleted, setStrokesCompleted] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [accuracy, setAccuracy] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize HanziWriter
    const writer = HanziWriter.create(canvasRef.current, character.simplified, {
      width: 300,
      height: 300,
      padding: 20,
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
    })

    writerRef.current = writer

    // Get total strokes
    writer.quiz({
      onMistake: () => {
        setMistakes(prev => prev + 1)
      },
      onCorrectStroke: () => {
        setStrokesCompleted(prev => {
          const newCount = prev + 1

          // Start timing on first stroke
          if (newCount === 1 && !startTime) {
            setStartTime(Date.now())
          }

          return newCount
        })
      },
      onComplete: (summaryData: any) => {
        handleComplete(summaryData)
      }
    })

    // Extract total strokes from character data (using any type to avoid complex type definitions)
    const charData = (writer.target as any).character
    if (charData && charData.strokes) {
      setTotalStrokes(charData.strokes.length)
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null
      }
    }
  }, [character.simplified])

  useEffect(() => {
    if (writerRef.current) {
      writerRef.current.updateColor('outlineColor', showHints ? '#E5E7EB' : '#F3F4F6')
      if (showHints) {
        writerRef.current.showOutline()
      } else {
        writerRef.current.hideOutline()
      }
    }
  }, [showHints])

  const handleComplete = (summaryData: any) => {
    if (!startTime) return

    const timeTaken = (Date.now() - startTime) / 1000 // in seconds
    const accuracyScore = Math.round(((summaryData.strokeCount - mistakes) / summaryData.strokeCount) * 100)

    setAccuracy(accuracyScore)
    setIsComplete(true)

    if (onComplete) {
      onComplete({
        accuracy: accuracyScore,
        timeTaken: timeTaken,
        strokeData: summaryData
      })
    }
  }

  const handleReset = () => {
    if (writerRef.current) {
      writerRef.current.cancelQuiz()
      writerRef.current.quiz({
        onMistake: () => {
          setMistakes(prev => prev + 1)
        },
        onCorrectStroke: () => {
          setStrokesCompleted(prev => {
            const newCount = prev + 1
            if (newCount === 1 && !startTime) {
              setStartTime(Date.now())
            }
            return newCount
          })
        },
        onComplete: (summaryData: any) => {
          handleComplete(summaryData)
        }
      })
    }

    setStrokesCompleted(0)
    setMistakes(0)
    setStartTime(null)
    setIsComplete(false)
    setAccuracy(0)
  }

  const handleShowStrokeOrder = () => {
    if (writerRef.current && !isAnimating) {
      setIsAnimating(true)
      writerRef.current.cancelQuiz()
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsAnimating(false)
          setTimeout(() => {
            handleReset()
          }, 500)
        }
      })
    }
  }

  const toggleHints = () => {
    setShowHints(!showHints)
  }

  const progress = totalStrokes > 0 ? (strokesCompleted / totalStrokes) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Character Info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Character</div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-chinese">{character.simplified}</span>
              <div>
                <div className="text-xl text-primary-600 font-semibold">
                  {character.pinyin}
                </div>
                <div className="text-gray-700">{character.english}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">
                {strokesCompleted} / {totalStrokes}
              </div>
              <div className="text-sm text-gray-500">strokes</div>
            </div>
            {mistakes > 0 && (
              <div className="text-sm text-orange-600">
                {mistakes} mistake{mistakes !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-6">
        <div className="flex flex-col items-center">
          <div
            ref={canvasRef}
            className="border-2 border-gray-200 rounded-lg mb-6 bg-white shadow-inner"
          />

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={handleReset}
              variant="secondary"
              size="md"
              disabled={isAnimating}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={handleShowStrokeOrder}
              variant="outline"
              size="md"
              disabled={isAnimating}
            >
              <Play className="w-4 h-4 mr-2" />
              {isAnimating ? 'Animating...' : 'Show Stroke Order'}
            </Button>

            <Button
              onClick={toggleHints}
              variant="ghost"
              size="md"
            >
              {showHints ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Hints
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Hints
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Completion Feedback */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <Card className={`p-6 ${accuracy >= 80 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'}`}>
              <div className="flex items-center gap-4">
                {accuracy >= 80 ? (
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : accuracy >= 60 ? (
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Sparkles className="w-8 h-8 text-yellow-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-orange-100 rounded-full">
                    <XCircle className="w-8 h-8 text-orange-600" />
                  </div>
                )}

                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                  </h4>
                  <p className="text-gray-700">
                    Accuracy: <span className="font-semibold">{accuracy}%</span>
                    {startTime && ` • Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`}
                  </p>
                  {mistakes > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {mistakes} mistake{mistakes !== 1 ? 's' : ''} - try to follow the stroke order carefully
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {mode === 'practice' && !isComplete && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Tip:</strong> Follow the stroke order animation to learn the correct sequence.
              You can toggle hints on/off to challenge yourself!
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
