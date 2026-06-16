/**
 * HanziNarrative brand logo — squircle tile (汉 + AI spark) + two-tone wordmark.
 * Brand system: marketing/brand/ · indigo→violet, anti red-cliché, no mascot.
 */
interface LogoProps {
  /** show the "HanziNarrative." wordmark next to the mark */
  showWordmark?: boolean
  /** tile size in px (square) — default 32 */
  size?: number
  /** extra classes on the outer wrapper */
  className?: string
  /** extra classes on the wordmark (e.g. "hidden sm:inline-flex" to hide on mobile) */
  wordmarkClassName?: string
}

function Spark({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="absolute -top-1 -right-1 drop-shadow-sm"
      aria-hidden="true"
    >
      <path d="M12 1 L13.7 8.3 L21 10 L13.7 11.7 L12 19 L10.3 11.7 L3 10 L10.3 8.3 Z" fill="#fbbf24" />
    </svg>
  )
}

export default function Logo({
  showWordmark = true,
  size = 32,
  className = '',
  wordmarkClassName = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-[30%] bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-sm shadow-primary-500/30">
          <span
            className="font-chinese font-black text-white leading-none select-none"
            style={{ fontSize: Math.round(size * 0.6) }}
          >
            汉
          </span>
        </div>
        <Spark size={Math.max(10, Math.round(size * 0.34))} />
      </div>

      {showWordmark && (
        <span className={`font-extrabold tracking-tight text-base sm:text-lg leading-none ${wordmarkClassName}`}>
          <span className="text-gray-900 dark:text-white">Hanzi</span>
          <span className="bg-gradient-to-r from-primary-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            Narrative
          </span>
          <span className="text-accent-500">.</span>
        </span>
      )}
    </div>
  )
}
