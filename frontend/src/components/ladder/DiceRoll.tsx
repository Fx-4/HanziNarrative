import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

/** Animated dice: tumbles through random faces briefly, then settles on `value`. */
export default function DiceRoll({ value }: { value: number }) {
  const [face, setFace] = useState(value)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    setSettled(false)
    let ticks = 0
    const iv = setInterval(() => {
      ticks++
      if (ticks >= 8) {
        clearInterval(iv)
        setFace(value)
        setSettled(true)
      } else {
        setFace(Math.floor(Math.random() * 6) + 1)
      }
    }, 90)
    return () => clearInterval(iv)
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
