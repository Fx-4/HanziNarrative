/**
 * "Powered by GIPHY" attribution mark — required by GIPHY's API terms and needed
 * to upgrade from a beta key to a production key.
 *
 * Uses GIPHY's official horizontal "POWERED BY GIPHY" mark shipped at
 * public/giphy-attribution.png (neutral gray — legible on both light and dark
 * backgrounds). Falls back to an inline SVG wordmark if the asset is missing so
 * attribution is always present.
 */

import { useState } from 'react'

export default function GiphyAttribution({ className = '' }: { className?: string }) {
  const [officialFailed, setOfficialFailed] = useState(false)

  if (!officialFailed) {
    return (
      <img
        src="/giphy-attribution.png"
        alt="Powered by GIPHY"
        onError={() => setOfficialFailed(true)}
        className={`h-3.5 w-auto select-none opacity-90 ${className}`}
      />
    )
  }

  // Fallback: inline "Powered by GIPHY" wordmark in brand colors
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className="text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase">
        Powered by
      </span>
      <svg viewBox="0 0 100 26" role="img" aria-label="GIPHY" className="h-3.5 w-auto">
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
