import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedListProps<T> {
  items: T[]
  keyExtractor: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  itemClassName?: string
  staggerDelay?: number
  direction?: 'up' | 'left'
}

/**
 * React Bits-inspired AnimatedList: renders a list where each item animates
 * in with stagger when mounted.
 */
export default function AnimatedList<T>({
  items,
  keyExtractor,
  renderItem,
  className = '',
  itemClassName = '',
  staggerDelay = 0.06,
  direction = 'up',
}: AnimatedListProps<T>) {
  const initial =
    direction === 'up'
      ? { opacity: 0, y: 20 }
      : { opacity: 0, x: -20 }

  const animate = { opacity: 1, y: 0, x: 0 }
  const exit =
    direction === 'up'
      ? { opacity: 0, y: -10, scale: 0.97 }
      : { opacity: 0, x: -10, scale: 0.97 }

  return (
    <div className={className}>
      <AnimatePresence initial>
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            className={itemClassName}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{
              delay: index * staggerDelay,
              duration: 0.4,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
