import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  label?: string
}

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: { container: "w-6 h-6", ring: 3, r: 10, dot: "w-1 h-1" },
    md: { container: "w-14 h-14", ring: 4, r: 22, dot: "w-1.5 h-1.5" },
    lg: { container: "w-24 h-24", ring: 5, r: 38, dot: "w-2 h-2" },
  }

  const cfg = sizeConfig[size]
  const circ = 2 * Math.PI * cfg.r
  const viewBox = (cfg.r + cfg.ring + 2) * 2
  const center = viewBox / 2

  if (size === "sm") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <motion.div
          className="rounded-full border-2 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400"
          style={{ width: 18, height: 18 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative" style={{ width: viewBox, height: viewBox }}>
        {/* Outer glowing ring */}
        <svg className="absolute inset-0" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          <defs>
            <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={center} cy={center} r={cfg.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={cfg.ring}
            className="text-gray-200 dark:text-gray-700"
            opacity={0.5}
          />
        </svg>

        {/* Animated arc */}
        <motion.svg
          className="absolute inset-0"
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx={center} cy={center} r={cfg.r}
            fill="none"
            stroke="url(#loading-gradient)"
            strokeWidth={cfg.ring}
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.3} ${circ * 0.7}`}
          />
        </motion.svg>

        {/* Center Chinese character pulse */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [0.85, 1, 0.85], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={cn(
            "font-chinese bg-gradient-to-br from-primary-600 to-violet-600 bg-clip-text text-transparent font-bold select-none",
            size === "lg" ? "text-3xl" : "text-xl"
          )}>
            字
          </span>
        </motion.div>
      </div>

      {/* Label */}
      {(size === "lg" || label) && (
        <motion.p
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {label || "加载中…"}
        </motion.p>
      )}
    </div>
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1.5 items-center", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary-500 to-violet-500"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "text-sm font-medium bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent",
        className
      )}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      加载中…
    </motion.div>
  )
}
