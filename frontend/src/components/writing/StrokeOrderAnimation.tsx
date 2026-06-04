import { useEffect, useRef, useState, useCallback } from 'react'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef    = useRef<any>(null)
  const dataReady    = useRef(false)          // true once CDN data loaded
  const loopTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loopRef      = useRef(loop)           // always current value of loop prop
  const activeRef    = useRef(false)          // true while this component is mounted

  // animation state: 'idle' | 'playing' | 'paused' | 'between-loops'
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'between-loops'>('idle')

  // keep loopRef in sync
  useEffect(() => { loopRef.current = loop }, [loop])

  const clearTimer = () => {
    if (loopTimer.current) { clearTimeout(loopTimer.current); loopTimer.current = null }
  }

  // Stable animation starter — reads all mutable state from refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runAnimation = useCallback((w: any) => {
    if (!w || !dataReady.current || !activeRef.current) return

    // cancel any in-progress animation before starting fresh
    try { w.cancelAnimation() } catch { /* no-op */ }

    setPhase('playing')

    w.animateCharacter({
      onComplete: () => {
        if (!activeRef.current) return
        if (loopRef.current) {
          setPhase('between-loops')
          loopTimer.current = setTimeout(() => {
            if (!activeRef.current || !writerRef.current || !dataReady.current) return
            runAnimation(writerRef.current)
          }, 1500)
        } else {
          setPhase('idle')
        }
      }
    })
  }, []) // intentionally empty — uses refs only

  useEffect(() => {
    if (!containerRef.current) return

    // Each effect run gets its own cancellation token so stale callbacks are ignored
    // (React StrictMode fires effects twice in dev — this prevents double animate())
    let cancelled = false

    activeRef.current = true
    containerRef.current.innerHTML = ''
    dataReady.current = false
    clearTimer()
    setPhase('idle')

    try {
      const writer = HanziWriter.create(containerRef.current, character.charAt(0), {
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
        onLoadCharDataSuccess: () => {
          if (cancelled) return          // stale effect run — ignore
          dataReady.current = true
          if (autoPlay) runAnimation(writer)
        },
        onLoadCharDataError: (err: unknown) => {
          console.warn(`HanziWriter: failed to load "${character}"`, err)
        }
      })
      writerRef.current = writer
    } catch (err) {
      console.error(`HanziWriter: create error for "${character}"`, err)
    }

    return () => {
      cancelled = true               // invalidate this effect run's callbacks
      activeRef.current = false
      clearTimer()
      writerRef.current = null
      dataReady.current = false
    }
  }, [character, size, autoPlay, runAnimation])

  // ── Button handlers ──────────────────────────────────────────────────────────

  const handlePlay = () => {
    clearTimer()
    runAnimation(writerRef.current)
  }

  const handlePause = () => {
    clearTimer()
    const w = writerRef.current
    if (!w || !dataReady.current) return
    try { w.pauseAnimation(); setPhase('paused') } catch { /* no-op */ }
  }

  const handleResume = () => {
    const w = writerRef.current
    if (!w || !dataReady.current) return
    try { w.resumeAnimation(); setPhase('playing') } catch { /* no-op */ }
  }

  const handleReset = () => {
    clearTimer()
    const w = writerRef.current
    if (!w || !dataReady.current) return
    try { w.cancelAnimation(); w.hideCharacter() } catch { /* no-op */ }
    setPhase('idle')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const isPlaying      = phase === 'playing' || phase === 'between-loops'
  const showPlay       = phase === 'idle'
  const showPause      = phase === 'playing' || phase === 'between-loops'
  const showResume     = phase === 'paused'

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm"
      />

      <div className="flex gap-2">
        {showPlay && (
          <button
            onClick={handlePlay}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-sm"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
        )}

        {showPause && (
          <button
            onClick={handlePause}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-sm"
          >
            <Pause className="w-4 h-4" />
            {phase === 'between-loops' ? 'Stop' : 'Pause'}
          </button>
        )}

        {showResume && (
          <button
            onClick={handleResume}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-sm"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        )}

        <button
          onClick={handleReset}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* subtle indicator while looping */}
      {isPlaying && loop && (
        <p className="text-xs text-primary-400 dark:text-primary-500 animate-pulse">
          Animasi berjalan otomatis…
        </p>
      )}
    </div>
  )
}
