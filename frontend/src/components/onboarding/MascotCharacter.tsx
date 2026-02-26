import { motion } from 'framer-motion'

interface MascotCharacterProps {
  mood?: 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'thoughtful'
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const MascotCharacter = ({
  mood = 'happy',
  message,
  size = 'md'
}: MascotCharacterProps) => {
  // Panda expressions based on mood
  const expressions = {
    happy: '🐼',
    excited: '🎉🐼',
    encouraging: '💪🐼',
    celebrating: '🎊🐼🎉',
    thoughtful: '🤔🐼'
  }

  // Animations based on mood
  const animations = {
    happy: {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    excited: {
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
      transition: { duration: 0.6, repeat: Infinity }
    },
    encouraging: {
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity }
    },
    celebrating: {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    thoughtful: {
      scale: [1, 1.02, 1],
      transition: { duration: 3, repeat: Infinity }
    }
  }

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  }

  const messageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Mascot Character */}
      <motion.div
        className={`${sizeClasses[size]} select-none`}
        animate={animations[mood]}
      >
        {expressions[mood]}
      </motion.div>

      {/* Speech Bubble with Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-md px-6 py-4 bg-blue-50 rounded-2xl shadow-lg"
        >
          {/* Speech bubble arrow */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 rotate-45"></div>

          {/* Message text */}
          <p className={`${messageSizeClasses[size]} text-gray-800 text-center font-medium relative z-10`}>
            {message}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default MascotCharacter
