import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BlurTextProps {
  children: string
  className?: string
  delay?: number
  /** Delay between each word in seconds */
  wordDelay?: number
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
}

/**
 * React Bits-inspired BlurText: animates each word blurring in with stagger
 */
export default function BlurText({
  children,
  className = '',
  delay = 0,
  wordDelay = 0.08,
  as: Tag = 'div',
}: BlurTextProps) {
  const words = children.split(' ')

  const wordVariants = {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        delay: delay + i * wordDelay,
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <Tag className={`flex flex-wrap gap-x-[0.35em] ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}

/** BlurText variant but for a single inline node (for wrapping any ReactNode) */
export function BlurIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
