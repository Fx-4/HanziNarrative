import { motion } from 'framer-motion'
import { HanziWord } from '@/types'

interface FlashcardFrontProps {
  word: HanziWord
}

export default function FlashcardFront({ word }: FlashcardFrontProps) {
  return (
    <motion.div
      className="absolute inset-0 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col justify-center items-center overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #ede9fe 100%)',
        border: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        {/* Chinese Character */}
        <motion.h3
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2 text-indigo-900"
          style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
          whileHover={{ scale: 1.05 }}
        >
          {word.simplified}
        </motion.h3>

        {/* Traditional (if different) */}
        {word.traditional !== word.simplified && (
          <p
            className="text-base sm:text-lg font-semibold text-violet-600"
            style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
          >
            {word.traditional}
          </p>
        )}

        {/* Tap to flip hint */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-1.5"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
            <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-xs text-indigo-400 font-medium">Tap to reveal</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
