import { ReactNode } from 'react'

interface ShinyTextProps {
  children: ReactNode
  className?: string
  /** Speed of the shimmer in seconds */
  speed?: number
  disabled?: boolean
}

/**
 * React Bits-inspired ShinyText: shimmer/shine effect over text using CSS animation.
 * Works with both light and dark mode.
 */
export default function ShinyText({
  children,
  className = '',
  speed = 3,
  disabled = false,
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{children}</span>
  }

  return (
    <span
      className={`relative inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, #4F46E5 20%, #818CF8 40%, #ffffff 50%, #818CF8 60%, #4F46E5 80%)',
        backgroundSize: '200% auto',
        animation: `shinyText ${speed}s linear infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes shinyText {
          to { background-position: 200% center; }
        }
      `}</style>
    </span>
  )
}

/** Dark-mode-aware shiny text using Tailwind-compatible classes */
export function ShinyTextAuto({
  children,
  className = '',
  speed = 3,
}: Omit<ShinyTextProps, 'disabled'>) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, var(--shiny-from, #4F46E5) 20%, var(--shiny-mid, #a5b4fc) 40%, var(--shiny-bright, #fff) 50%, var(--shiny-mid, #a5b4fc) 60%, var(--shiny-from, #4F46E5) 80%)',
        backgroundSize: '200% auto',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shinyText ${speed}s linear infinite`,
      }}
    >
      {children}
    </span>
  )
}
