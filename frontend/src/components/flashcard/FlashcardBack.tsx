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
      className="absolute inset-0 rounded-lg shadow-lg p-2 flex flex-col justify-center items-center overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
      }}
    >
      <div className="text-center w-full space-y-0.5">
        {/* Chinese Character */}
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white"
          style={{
            fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          {word.simplified}
        </motion.h3>

        {/* Pinyin with Audio Button */}
        <div className="flex items-center justify-center gap-0.5">
          <motion.p
            className="text-xs sm:text-sm font-semibold text-white/95"
            style={{
              fontFamily: '"Noto Sans", "Arial", sans-serif',
              textShadow: '0 1px 5px rgba(0,0,0,0.15)',
              letterSpacing: '0.5px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
            transition={{ delay: 0.4 }}
          >
            {word.pinyin}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ delay: 0.4 }}
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
          className="text-xs sm:text-sm font-medium text-white px-1"
          style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.1)',
            lineHeight: '1.4'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
          transition={{ delay: 0.5 }}
        >
          {word.english}
        </motion.p>

        {/* Image (if available) */}
        {word.image_url && (
          <motion.img
            src={word.image_url}
            alt={word.english}
            className="w-full h-12 object-cover rounded-md shadow-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.8 }}
            transition={{ delay: 0.6 }}
          />
        )}

        {/* HSK Level Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.7 }}
        >
          <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
            HSK {word.hsk_level}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
