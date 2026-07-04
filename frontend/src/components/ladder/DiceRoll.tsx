import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

/** Animated dice: tumbles through random faces briefly, then settles on `value`. */
export default function DiceRoll({ value }: { value: number }) {
  const [face, setFace] = useState(value)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    setSettled(false)
    let cancelled = false
    let tick = 0
    const TOTAL_TICKS = 12
    // Decelerating timeout chain (~2s total) — tumbles fast at first then slows
    // down like a real die, instead of a fixed-interval blur that ends too fast
    const step = () => {
      if (cancelled) return
      tick++
      if (tick >= TOTAL_TICKS) {
        setFace(value)
        setSettled(true)
        return
      }
      setFace(Math.floor(Math.random() * 6) + 1)
      setTimeout(step, 70 + tick * 18)
    }
    step()
    return () => { cancelled = true }
  }, [value])

  return (
    <motion.div
      initial={{ scale: 0.6, rotate: -20 }}
      animate={{ scale: settled ? 1.1 : 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`inline-flex items-center justify-center text-5xl leading-none ${
        settled ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
      }`}
    >
      {FACES[face - 1]}
    </motion.div>
  )
}
