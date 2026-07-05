/**
 * "Powered by GIPHY" attribution mark — required by GIPHY's API terms and needed
 * to upgrade from a beta key to a production key.
 *
 * Renders GIPHY's signature wordmark next to "Powered by". Kept as inline SVG so
 * it scales crisply and needs no extra asset request.
 */

export default function GiphyAttribution({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className="text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase">
        Powered by
      </span>
      {/* GIPHY wordmark in brand colors (green/purple gradient signature) */}
      <svg
        viewBox="0 0 100 26"
        role="img"
        aria-label="GIPHY"
        className="h-3.5 w-auto"
      >
        <defs>
          <linearGradient id="giphy-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00ff99" />
            <stop offset="50%" stopColor="#00ccff" />
            <stop offset="100%" stopColor="#9933ff" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="20"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="-0.5"
          fill="url(#giphy-grad)"
        >
          GIPHY
        </text>
      </svg>
    </div>
  )
}
