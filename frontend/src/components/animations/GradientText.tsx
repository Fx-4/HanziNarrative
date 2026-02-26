import { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
  animated?: boolean
  speed?: number
}

/**
 * React Bits-inspired GradientText: animated or static gradient text
 */
export default function GradientText({
  children,
  className = '',
  colors = ['#4F46E5', '#818CF8', '#22C55E', '#4F46E5'],
  animated = true,
  speed = 5,
}: GradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: animated ? '200% auto' : '100% auto',
        animation: animated
          ? `gradientFlow ${speed}s linear infinite`
          : undefined,
      }}
    >
      {children}
      {animated && (
        <style>{`
          @keyframes gradientFlow {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}</style>
      )}
    </span>
  )
}
