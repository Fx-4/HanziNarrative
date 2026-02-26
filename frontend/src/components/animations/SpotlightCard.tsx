import { ReactNode, useRef, MouseEvent } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

/**
 * React Bits-inspired SpotlightCard: card with a radial gradient spotlight
 * that follows the mouse cursor.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(79, 70, 229, 0.12)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--spotlight-x', `${x}px`)
    card.style.setProperty('--spotlight-y', `${y}px`)
    card.style.setProperty('--spotlight-opacity', '1')
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--spotlight-opacity', '0')
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--spotlight-x': '50%',
          '--spotlight-y': '50%',
          '--spotlight-opacity': '0',
          '--spotlight-color': spotlightColor,
        } as React.CSSProperties
      }
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color, rgba(79,70,229,0.12)), transparent 70%)`,
          opacity: 'var(--spotlight-opacity, 0)' as string,
        }}
      />
      {children}
    </div>
  )
}
