import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TranslationTooltipProps {
  chinese: string
  pinyin?: string
  english?: string
  children?: React.ReactNode
  mode?: 'hover' | 'click'
}

export default function TranslationTooltip({
  chinese,
  pinyin,
  english,
  children,
  mode = 'hover'
}: TranslationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleMouseEnter = () => {
    if (mode === 'hover') {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    if (mode === 'hover') {
      setIsVisible(false)
    }
  }

  const handleClick = () => {
    if (mode === 'click') {
      setIsVisible(!isVisible)
    }
  }

  return (
    <span className="relative inline-block">
      <span
        className={`
          ${mode === 'hover' ? 'hover:bg-primary-100' : 'cursor-pointer hover:bg-primary-50'}
          ${isVisible ? 'bg-primary-100' : ''}
          transition-colors duration-200 rounded px-0.5
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children || chinese}
      </span>

      <AnimatePresence>
        {isVisible && (english || pinyin) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg min-w-max max-w-xs">
              {pinyin && (
                <div className="text-xs text-gray-300 mb-1 font-medium">
                  {pinyin}
                </div>
              )}
              {english && (
                <div className="text-sm font-medium">
                  {english}
                </div>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                <div className="border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
