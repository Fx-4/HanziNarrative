import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface StaggerItemProps {
  children: ReactNode
  className?: string
  direction?: Direction
  distance?: number
}

const directionOffset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
}

/**
 * React Bits-inspired StaggerItem: child of StaggerContainer.
 * Animates in as part of the stagger sequence.
 */
export default function StaggerItem({
  children,
  className = '',
  direction = 'up',
  distance: _distance,
}: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
