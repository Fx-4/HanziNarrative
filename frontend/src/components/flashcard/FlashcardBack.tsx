import { motion } from 'framer-motion'
import { HanziWord } from '@/types'
import AudioButton from '../AudioButton'

interface FlashcardBackProps {
  word: HanziWord
  isFlipped: boolean
}

export default function FlashcardBack({ word, isFlipped }: FlashcardBackProps) {
  return (
    <motion.div
      className="absolute inset-0 rounded-3xl shadow-xl p-5 sm:p-8 flex flex-col justify-center items-center overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)',
      }}
    >
      <div className="text-center w-full space-y-2 sm:space-y-3">
        {/* Chinese character on back */}
        <motion.h3
          className="text-3xl sm:text-4xl font-bold text-white/90"
          style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
          initial={{ scale: 0 }}
          animate={{ scale: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {word.simplified}
        </motion.h3>

        {/* Pinyin + Audio */}
        <div className="flex items-center justify-center gap-1.5">
          <motion.p
            className="text-lg sm:text-xl font-semibold text-white/95"
            style={{ letterSpacing: '0.5px' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 12 }}
            transition={{ delay: 0.3 }}
          >
            {word.pinyin}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ delay: 0.3 }}
          >
            <AudioButton
              text={word.simplified}
              language="zh-CN"
              size="sm"
              variant="ghost"
              className="bg-white/20 text-white hover:bg-white/30"
              tooltipText="Play pronunciation"
            />
          </motion.div>
        </div>

        {/* English Translation */}
        <motion.p
          className="text-base sm:text-lg font-medium text-white/90 px-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 12 }}
          transition={{ delay: 0.4 }}
        >
          {word.english}
        </motion.p>

        {/* Image (if available) */}
        {word.image_url && (
          <motion.img
            src={word.image_url}
            alt={word.english}
            className="w-full max-h-16 sm:max-h-20 object-cover rounded-2xl shadow-lg mx-auto"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.85 }}
            transition={{ delay: 0.5 }}
          />
        )}

        {/* HSK Level Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.55 }}
        >
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/20 text-white border border-white/30">
            HSK {word.hsk_level}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
