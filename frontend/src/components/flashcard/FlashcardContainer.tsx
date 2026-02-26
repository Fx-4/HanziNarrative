import { useState } from 'react'
import { HanziWord } from '@/types'
import FlashcardFront from './FlashcardFront'
import FlashcardBack from './FlashcardBack'

interface FlashcardContainerProps {
  word: HanziWord
  showAnswer?: boolean
  isFlipped?: boolean
  onFlip?: () => void
}

export default function FlashcardContainer({
  word,
  showAnswer: initialShowAnswer = false,
  isFlipped: externalIsFlipped,
  onFlip
}: FlashcardContainerProps) {
  const [internalIsFlipped, setInternalIsFlipped] = useState(initialShowAnswer)

  // Use external state if provided, otherwise use internal state
  const isFlipped = externalIsFlipped !== undefined ? externalIsFlipped : internalIsFlipped
  const handleFlip = () => {
    if (onFlip) {
      onFlip()
    } else {
      setInternalIsFlipped(!internalIsFlipped)
    }
  }

  return (
    <div className="w-full perspective-1000 max-w-sm mx-auto">
      <div className="relative w-full" style={{ paddingBottom: '50%' }}>
        <div
          className="absolute inset-0 cursor-pointer transition-transform duration-600"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <FlashcardFront word={word} />

          {/* Back of card */}
          <FlashcardBack word={word} isFlipped={isFlipped} />
        </div>
      </div>
    </div>
  )
}
