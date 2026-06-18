import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { appLogger } from '@/utils/debugLogger'
import { Play, RotateCcw, Pencil, Eye } from 'lucide-react'
import { createLogger } from '@/utils/debugLogger'

const strokeOrderDisplayLogger = createLogger('StrokeOrderDisplay')

interface StrokeOrderDisplayProps {
  character: string
  size?: number
  showControls?: boolean
}

export default function StrokeOrderDisplay({
  character,
  size = 200,
  showControls = true
}: StrokeOrderDisplayProps) {
  const writerRef = useRef<HanziWriter | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous writer
    if (writerRef.current) {
      writerRef.current = null
    }
    containerRef.current.innerHTML = ''

    // Create new HanziWriter instance with proper CDN configuration
    try {
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 5,
        strokeColor: '#4F46E5', // Primary color
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        showCharacter: !isPracticeMode,
        showOutline: true,
        radicalColor: '#9333EA', // Purple for radicals
        // Use CDN.jsdelivr.net as primary source with fallback
        charDataLoader: (char: string) => {
          const code = char.charCodeAt(0)
          const hexCode = code.toString(16)
          // Try jsdelivr CDN first, then fall back to hanziwriter CDN
          return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${hexCode}.json`)
            .then(res => {
              if (!res.ok) throw new Error('Failed from jsdelivr')
              return res.json()
            })
            .catch(() => {
              // Fallback to hanziwriter.org CDN
              return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${hexCode}.json`)
                .then(res => res.json())
            })
        },
        onLoadCharDataError: (err: unknown) => {
          strokeOrderDisplayLogger.warn(`Failed to load character data for ${character}:`, err)
          // Don't show error to user, just log it
        }
      })
    } catch (error) {
      strokeOrderDisplayLogger.error('Failed to create HanziWriter:', error)
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null
      }
    }
  }, [character, size, isPracticeMode])

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return

    setIsAnimating(true)
    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false)
    })
  }

  const handleReset = () => {
    if (!writerRef.current) return

    setIsAnimating(false)
    setQuizComplete(false)
    setIsPracticeMode(false)

    // Recreate writer to reset state with proper CDN configuration
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 5,
        strokeColor: '#4F46E5',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        showCharacter: true,
        showOutline: true,
        radicalColor: '#9333EA',
        // Use CDN.jsdelivr.net as primary source with fallback
        charDataLoader: (char: string) => {
          const code = char.charCodeAt(0)
          const hexCode = code.toString(16)
          return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${hexCode}.json`)
            .then(res => {
              if (!res.ok) throw new Error('Failed from jsdelivr')
              return res.json()
            })
            .catch(() => {
              return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${hexCode}.json`)
                .then(res => res.json())
            })
        },
        onLoadCharDataError: (err: unknown) => {
          strokeOrderDisplayLogger.warn(`Failed to load character data for ${character}:`, err)
        }
      })
    }
  }

  const handlePracticeMode = () => {
    if (!writerRef.current) return

    setIsPracticeMode(true)
    setQuizComplete(false)

    // Hide character and enable quiz mode
    writerRef.current.hideCharacter()
    writerRef.current.quiz({
      onComplete: () => {
        setQuizComplete(true)
        setIsPracticeMode(false)
        // Show character after completion
        setTimeout(() => {
          if (writerRef.current) {
            writerRef.current.showCharacter()
          }
        }, 500)
      },
      onMistake: (strokeData: { strokeNum: number }) => {
        appLogger.debug('Mistake on stroke', { strokeNum: strokeData.strokeNum })
      }
    })
  }

  const handleShowCharacter = () => {
    if (!writerRef.current) return
    writerRef.current.showCharacter({ duration: 500 })
    setIsPracticeMode(false)
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="border-2 border-gray-200 rounded-lg bg-white shadow-sm dark:border-gray-700 dark:bg-surface-card"
        style={{ width: size, height: size }}
      />

      {/* Status Message */}
      {quizComplete && (
        <div className="text-sm font-medium text-success-600 animate-fade-in">
          ✓ Perfect! You wrote it correctly!
        </div>
      )}

      {isPracticeMode && !quizComplete && (
        <div className="text-sm font-medium text-blue-600 animate-pulse">
          ✍️ Draw the character stroke by stroke...
        </div>
      )}

      {/* Control Buttons */}
      {showControls && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleAnimate}
            disabled={isAnimating || isPracticeMode}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300"
          >
            <Play className="w-3.5 h-3.5" />
            Animate
          </button>

          <button
            onClick={handlePracticeMode}
            disabled={isAnimating || isPracticeMode}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300"
          >
            <Pencil className="w-3.5 h-3.5" />
            Practice
          </button>

          {isPracticeMode && (
            <button
              onClick={handleShowCharacter}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors dark:bg-gray-800 dark:text-gray-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Show
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isAnimating}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
