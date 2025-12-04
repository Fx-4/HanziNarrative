import { motion } from 'framer-motion'
import { HanziWord } from '@/types'

interface FlashcardFrontProps {
  word: HanziWord
}

export default function FlashcardFront({ word }: FlashcardFrontProps) {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl shadow-2xl p-8 flex flex-col justify-center items-center overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Chinese Character */}
        <motion.h3
          className="text-5xl sm:text-6xl font-bold mb-2"
          style={{
            fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
            color: '#2d3748',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
          whileHover={{ scale: 1.05 }}
        >
          {word.simplified}
        </motion.h3>

        {/* Traditional (if different) */}
        {word.traditional !== word.simplified && (
          <p
            className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-2"
            style={{
              fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
            }}
          >
            {word.traditional}
          </p>
        )}

        {/* Click to Reveal Indicator */}
        <motion.div
          className="mt-4 flex flex-col items-center space-y-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-700 font-semibold">Tap</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
