import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.25, 0.4, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.08, ease: 'easeIn' },
  },
}

/**
 * Lightweight page transition — fast enter (150ms), instant exit (80ms).
 * Wraps each route inside AnimatePresence (in Layout.tsx).
 */
export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
