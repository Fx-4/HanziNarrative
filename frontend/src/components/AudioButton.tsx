import { FC } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'

interface AudioButtonProps {
  text: string
  language?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  tooltipText?: string
}

export const AudioButton: FC<AudioButtonProps> = ({
  text,
  language = 'zh-CN',
  size = 'md',
  variant = 'ghost',
  className = '',
  tooltipText = 'Click to hear pronunciation'
}) => {
  const { speak, isSpeaking, isSupported } = useTTS({ language })

  if (!isSupported) {
    return null // Don't render if TTS not supported
  }

  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700',
  }

  return (
    <motion.button
      onClick={() => speak(text)}
      disabled={isSpeaking}
      className={`rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      whileHover={!isSpeaking ? { scale: 1.05 } : {}}
      whileTap={!isSpeaking ? { scale: 0.95 } : {}}
      title={tooltipText}
      aria-label={`Play pronunciation for: ${text}`}
    >
      <motion.div
        animate={isSpeaking ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isSpeaking
            ? { duration: 1, repeat: Infinity, ease: 'linear' }
            : { duration: 0.3 }
        }
      >
        {isSpeaking ? (
          <VolumeX className={iconSizes[size]} />
        ) : (
          <Volume2 className={iconSizes[size]} />
        )}
      </motion.div>
    </motion.button>
  )
}

export default AudioButton
