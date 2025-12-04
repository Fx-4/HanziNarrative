import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { Button } from '@/components/ui/Button'
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

    // Initialize HanziWriter for animation only
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
    })

    writerRef.current = writer

    if (autoPlay) {
      playAnimation()
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
          <Button
            onClick={playAnimation}
            size="sm"
            variant="primary"
          >
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
        )}

        {isPlaying && (
          <Button
            onClick={pauseAnimation}
            size="sm"
            variant="secondary"
          >
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </Button>
        )}

        {isPaused && (
          <Button
            onClick={resumeAnimation}
            size="sm"
            variant="primary"
          >
            <Play className="w-4 h-4 mr-1" />
            Resume
          </Button>
        )}

        <Button
          onClick={resetAnimation}
          size="sm"
          variant="ghost"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  )
}
