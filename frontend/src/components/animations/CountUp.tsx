import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  delay?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  /** Format function for custom display */
  format?: (value: number) => string
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * React Bits-inspired CountUp: animates a number from `from` to `to` when visible.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1.5,
  delay = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
  format,
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isInView) return

    const startAnimation = () => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp
        }
        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const easedProgress = easeOutQuart(progress)
        const current = from + (to - from) * easedProgress
        setDisplayValue(current)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    const timer = setTimeout(startAnimation, delay * 1000)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      startTimeRef.current = null
    }
  }, [isInView, to, from, duration, delay])

  const formatted = format
    ? format(displayValue)
    : `${prefix}${displayValue.toFixed(decimals)}${suffix}`

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  )
}
