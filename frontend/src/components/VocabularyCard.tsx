import { HanziWord } from '@/types'
import { FlashcardContainer } from './flashcard'

interface VocabularyCardProps {
  word: HanziWord
  showAnswer?: boolean
}

export default function VocabularyCard({ word, showAnswer = false }: VocabularyCardProps) {
  return <FlashcardContainer word={word} showAnswer={showAnswer} />
}
