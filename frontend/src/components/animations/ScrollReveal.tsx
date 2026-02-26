import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  /** How much of element must be in view before animating (0 - 1) */
  threshold?: number
  once?: boolean
}

const variants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
}

/**
 * React Bits-inspired ScrollReveal: element reveals with a subtle scale+fade
 * when scrolled into view.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.55,
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
