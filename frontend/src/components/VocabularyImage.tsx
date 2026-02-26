import { useState } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, ImageOff } from 'lucide-react'

interface VocabularyImageProps {
  imageUrl: string
  word: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64'
}

export default function VocabularyImage({ 
  imageUrl, 
  word, 
  size = 'md',
  showLabel = false,
  className = ''
}: VocabularyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </motion.div>
      )}

      {/* Error State */}
      {hasError && (
        <motion.div
          className="absolute inset-0 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-600 text-center">Image not available</p>
        </motion.div>
      )}

      {/* Actual Image */}
      {!hasError && (
        <motion.img
          src={imageUrl}
          alt={`Visual representation of ${word}`}
          className={`w-full h-full object-cover rounded-lg shadow-md border-2 border-gray-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: isLoading ? 0 : 1,
            scale: isLoading ? 0.9 : 1
          }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
        />
      )}

      {/* Optional Label */}
      {showLabel && !hasError && !isLoading && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white text-xs font-medium text-center">
            {word}
          </p>
        </motion.div>
      )}
    </div>
  )
}
