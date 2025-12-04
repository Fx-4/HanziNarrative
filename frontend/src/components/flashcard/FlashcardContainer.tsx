import { useState } from 'react'
import { motion } from 'framer-motion'
import { HanziWord } from '@/types'
import FlashcardFront from './FlashcardFront'
import FlashcardBack from './FlashcardBack'

interface FlashcardContainerProps {
  word: HanziWord
  showAnswer?: boolean
}

export default function FlashcardContainer({
  word,
  showAnswer: initialShowAnswer = false
}: FlashcardContainerProps) {
  const [isFlipped, setIsFlipped] = useState(initialShowAnswer)

  return (
    <div className="w-full perspective-1000">
      <div className="relative w-full" style={{ paddingBottom: '140%' }}>
        <motion.div
          className="absolute inset-0 cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          onClick={() => setIsFlipped(!isFlipped)}
          whileHover={{ scale: 1.05 }}
        >
          {/* Front of card */}
          <FlashcardFront word={word} />

          {/* Back of card */}
          <FlashcardBack word={word} isFlipped={isFlipped} />
        </motion.div>
      </div>
    </div>
  )
}
