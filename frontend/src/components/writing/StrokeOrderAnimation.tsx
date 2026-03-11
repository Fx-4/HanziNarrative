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
  const dataLoadedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''
    dataLoadedRef.current = false

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
        onLoadCharDataSuccess: () => {
          dataLoadedRef.current = true
          if (autoPlay) {
            playAnimation(writer)
          }
        },
        onLoadCharDataError: (err: any) => {
          console.warn(`Failed to load character data for ${character}:`, err)
        }
      })

      writerRef.current = writer
    } catch (error) {
      console.error(`Error creating HanziWriter for ${character}:`, error)
    }

    return () => {
      writerRef.current = null
      dataLoadedRef.current = false
    }
  }, [character, size])

  const playAnimation = (writer?: any) => {
    const w = writer || writerRef.current
    if (!w || !dataLoadedRef.current) return

    setIsPlaying(true)
    setIsPaused(false)

    w.animateCharacter({
      onComplete: () => {
        setIsPlaying(false)
        if (loop) {
          setTimeout(() => playAnimation(), 1000)
        }
      }
    })
  }

  const pauseAnimation = () => {
    if (!writerRef.current || !dataLoadedRef.current) return
    try {
      writerRef.current.pauseAnimation()
      setIsPaused(true)
      setIsPlaying(false)
    } catch (e) {
      // data not ready yet
    }
  }

  const resumeAnimation = () => {
    if (!writerRef.current || !dataLoadedRef.current) return
    try {
      writerRef.current.resumeAnimation()
      setIsPaused(false)
      setIsPlaying(true)
    } catch (e) {
      // data not ready yet
    }
  }

  const resetAnimation = () => {
    if (!writerRef.current || !dataLoadedRef.current) return
    try {
      writerRef.current.hideCharacter()
      setIsPlaying(false)
      setIsPaused(false)
    } catch (e) {
      // data not ready yet
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm mb-4"
      />

      <div className="flex gap-2">
        {!isPlaying && !isPaused && (
          <button
            onClick={() => playAnimation()}
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
