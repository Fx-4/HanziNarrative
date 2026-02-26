import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface StrokeOrderAnimationProps {
  character: string
  size?: number
  autoPlay?: boolean
  loop?: boolean
}

export default function StrokeOrderAnimation({
  character,
  size = 200,
  autoPlay = false,
  loop = false
}: StrokeOrderAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear container before creating new writer
    containerRef.current.innerHTML = ''

    // Initialize HanziWriter for animation only with proper CDN configuration
    try {
      const writer = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 10,
        strokeColor: '#4F46E5',
        radicalColor: '#7C3AED',
        outlineColor: '#E5E7EB',
        showCharacter: false,
        showOutline: true,
        strokeAnimationSpeed: 2,
        delayBetweenStrokes: 300,
        delayBetweenLoops: 2000,
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
        onLoadCharDataError: (err: any) => {
          console.warn(`Failed to load character data for ${character}:`, err)
          // Don't show error to user, just log it
        }
      })

      writerRef.current = writer

      if (autoPlay) {
        playAnimation()
      }
    } catch (error) {
      console.error(`Error creating HanziWriter for ${character}:`, error)
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null
      }
    }
  }, [character, size])

  const playAnimation = () => {
    if (!writerRef.current) return

    setIsPlaying(true)
    setIsPaused(false)

    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false)
        if (loop) {
          setTimeout(() => {
            playAnimation()
          }, 1000)
        }
      }
    })
  }

  const pauseAnimation = () => {
    if (writerRef.current) {
      writerRef.current.pauseAnimation()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const resumeAnimation = () => {
    if (writerRef.current) {
      writerRef.current.resumeAnimation()
      setIsPaused(false)
      setIsPlaying(true)
    }
  }

  const resetAnimation = () => {
    if (writerRef.current) {
      writerRef.current.hideCharacter()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="border-2 border-gray-200 rounded-lg bg-white shadow-sm mb-4"
      />

      <div className="flex gap-2">
        {!isPlaying && !isPaused && (
          <button
            onClick={playAnimation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center"
          >
            <Play className="w-4 h-4 mr-1" />
            Play
          </button>
        )}

        {isPlaying && (
          <button
            onClick={pauseAnimation}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center"
          >
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={resumeAnimation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center"
          >
            <Play className="w-4 h-4 mr-1" />
            Resume
          </button>
        )}

        <button
          onClick={resetAnimation}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>
    </div>
  )
}
