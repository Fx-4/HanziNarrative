import { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'

interface AudioButtonProps {
  text: string
  language?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  tooltipText?: string
}

const BAR_DELAYS = [0, 0.15, 0.3]
const BAR_SEQUENCES = [
  [0.35, 1.0, 0.5, 0.8, 0.25, 0.9, 0.45, 1.0],
  [0.8,  0.3, 1.0, 0.5, 0.9,  0.4, 0.75, 0.6],
  [0.5,  0.85,0.3, 1.0, 0.6,  0.95,0.35, 0.8],
]

export const AudioButton: FC<AudioButtonProps> = ({
  text,
  language = 'cmn-CN',
  size = 'md',
  variant = 'ghost',
  className = '',
  tooltipText = 'Click to hear pronunciation',
}) => {
  const { speak, stop, isSpeaking, isSupported } = useTTS({ language })

  if (!isSupported) return null

  const sizeMap = {
    sm: { btn: 'w-8 h-8',  icon: 'w-3.5 h-3.5', bar: { w: 'w-[3px]', h: 10 } },
    md: { btn: 'w-10 h-10', icon: 'w-5 h-5',   bar: { w: 'w-[3px]', h: 13 } },
    lg: { btn: 'w-12 h-12', icon: 'w-6 h-6',   bar: { w: 'w-1',     h: 16 } },
  }

  const s = sizeMap[size]

  const variantMap = {
    primary: {
      idle:     'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/30',
      speaking: 'bg-primary-500 text-white shadow-lg shadow-primary-500/40',
    },
    secondary: {
      idle:     'bg-gray-100 text-gray-700 hover:bg-gray-200',
      speaking: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
    },
    ghost: {
      idle:     'text-gray-500 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30 dark:hover:text-primary-400',
      speaking: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
    },
  }

  const colors = variantMap[variant]

  return (
    <motion.button
      onClick={() => (isSpeaking ? stop() : speak(text))}
      className={`
        relative flex items-center justify-center rounded-xl
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1
        ${s.btn}
        ${isSpeaking ? colors.speaking : colors.idle}
        ${className}
      `}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isSpeaking ? 'Click to stop' : tooltipText}
      aria-label={isSpeaking ? 'Stop audio' : `Play pronunciation for: ${text}`}
    >
      <AnimatePresence mode="wait">
        {isSpeaking ? (
          /* Equalizer bars */
          <motion.div
            key="bars"
            className="flex items-end gap-[3px]"
            style={{ height: s.bar.h }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            {BAR_SEQUENCES.map((seq, i) => (
              <motion.span
                key={i}
                className={`${s.bar.w} rounded-full bg-current origin-bottom`}
                style={{ height: '100%' }}
                animate={{ scaleY: seq }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: BAR_DELAYS[i],
                  ease: 'easeInOut',
                  times: seq.map((_, idx) => idx / (seq.length - 1)),
                }}
              />
            ))}
          </motion.div>
        ) : (
          /* Volume icon */
          <motion.span
            key="icon"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <Volume2 className={s.icon} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Ripple ring when speaking */}
      {isSpeaking && (
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-current opacity-40"
          animate={{ scale: [1, 1.35], opacity: [0.4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  )
}

export default AudioButton
