import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HanziWord, TypingAttempt } from '@/types'
import { typingApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Target, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

interface Props {
  words: HanziWord[]
  hskLevel: number
  onBack: () => void
}

// Simulated candidate generator
function generateCandidates(word: HanziWord, allWords: HanziWord[]): string[] {
  const candidates: string[] = [word.simplified]

  // Get similar sounding words from the same HSK level
  const similarWords = allWords
    .filter(w => w.id !== word.id && w.hsk_level === word.hsk_level)
    .slice(0, 8)

  similarWords.forEach(w => {
    if (candidates.length < 6 && !candidates.includes(w.simplified)) {
      candidates.push(w.simplified)
    }
  })

  // Fill remaining slots with common characters if needed
  const commonChars = ['你', '好', '我', '的', '是', '人', '们', '在', '有', '他', '她', '这', '那', '们', '吗']
  commonChars.forEach(char => {
    if (candidates.length < 6 && !candidates.includes(char)) {
      candidates.push(char)
    }
  })

  // Shuffle so correct answer isn't always first
  return candidates.sort(() => Math.random() - 0.5).slice(0, 6)
}

export default function IMEPracticeMode({ words, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [candidates, setCandidates] = useState<string[]>([])
  const [, setSelectedCandidate] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [sessionResults, setSessionResults] = useState<boolean[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = words[currentIndex]

  useEffect(() => {
    setStartTime(Date.now())
    inputRef.current?.focus()
  }, [currentIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setInputValue(value)

    // Generate candidates when user types something
    if (value.length > 0) {
      // Remove tone marks from expected pinyin for comparison
      const expectedBase = currentWord.pinyin.toLowerCase()
        .replace(/[āáǎà]/g, 'a')
        .replace(/[ēéěè]/g, 'e')
        .replace(/[īíǐì]/g, 'i')
        .replace(/[ōóǒò]/g, 'o')
        .replace(/[ūúǔù]/g, 'u')
        .replace(/[ǖǘǚǜ]/g, 'ü')
        .replace(/\s+/g, '')

      // Check if input matches (allow partial or full match)
      if (expectedBase.startsWith(value.replace(/\s+/g, '')) || value.replace(/\s+/g, '').length >= 2) {
        setCandidates(generateCandidates(currentWord, words))
      }
    } else {
      setCandidates([])
    }
  }

  const handleCandidateSelect = async (candidate: string) => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setSelectedCandidate(candidate)
    const timeTaken = (Date.now() - startTime) / 1000
    const correct = candidate === currentWord.simplified
    setIsCorrect(correct)
    setShowFeedback(true)
    setSessionResults([...sessionResults, correct])

    // Record attempt
    try {
      const attempt: TypingAttempt = {
        word_id: currentWord.id,
        mode: 'ime',
        is_correct: correct,
        time_taken: timeTaken,
        typed_text: candidate,
        expected_text: currentWord.simplified,
        ime_attempts: newAttempts
      }
      await typingApi.recordAttempt(attempt)
    } catch (error) {
      console.error('Failed to record attempt:', error)
    }

    if (correct) {
      toast.success(newAttempts === 1 ? 'Perfect! First try!' : 'Correct!', {
        icon: newAttempts === 1 ? '🎯' : '✅'
      })
    } else {
      toast.error('Try again!', { icon: '❌' })
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setInputValue('')
      setCandidates([])
      setSelectedCandidate(null)
      setAttempts(0)
      setShowFeedback(false)
    } else {
      const accuracy = (sessionResults.filter(r => r).length / sessionResults.length) * 100
      toast.success(`Session complete! Accuracy: ${Math.round(accuracy)}%`, {
        duration: 4000,
        icon: '🎉'
      })
      onBack()
    }
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-600">No words available for this HSK level.</p>
        <button
          onClick={onBack}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors mt-4"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <span className="text-lg font-semibold">IME Practice</span>
        </div>
        <div className="text-lg font-semibold">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-4">
            Type pinyin and select the correct character:
          </p>
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <p className="text-2xl text-gray-700 mb-2">{currentWord.english}</p>
            <p className="text-lg text-gray-600">Pinyin: {currentWord.pinyin}</p>
          </motion.div>
        </div>

        <div className="max-w-md mx-auto">
          <input
            ref={inputRef}
            id="ime-practice-input"
            name="ime-typing"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type pinyin..."
            className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg text-center bg-white text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
            disabled={showFeedback}
            autoComplete="off"
          />

          <AnimatePresence>
            {candidates.length > 0 && !showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 grid grid-cols-3 gap-2"
              >
                {candidates.map((candidate, index) => (
                  <motion.button
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCandidateSelect(candidate)}
                    className="text-4xl font-chinese h-20 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all active:scale-95 cursor-pointer"
                  >
                    {candidate}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className={`p-6 rounded-lg ${
                isCorrect
                  ? 'bg-success-50 border-2 border-success-200'
                  : 'bg-error-50 border-2 border-error-200'
              }`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-success-600" />
                      <span className="text-2xl font-semibold text-success-900">
                        {attempts === 1 ? 'Perfect!' : 'Correct!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-error-600" />
                      <span className="text-2xl font-semibold text-error-900">Incorrect</span>
                    </>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-5xl font-chinese mb-2">{currentWord.simplified}</p>
                  <p className="text-lg">
                    <span className="font-semibold">Attempts:</span> {attempts}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition-colors w-full mt-4 flex items-center justify-center text-lg"
              >
                {currentIndex < words.length - 1 ? (
                  <>
                    Next Word <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  'Finish Session'
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Session Progress</span>
          <span className="text-sm text-gray-600">
            {sessionResults.length > 0
              ? `${Math.round((sessionResults.filter(r => r).length / sessionResults.length) * 100)}% accuracy`
              : 'No attempts yet'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / words.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
