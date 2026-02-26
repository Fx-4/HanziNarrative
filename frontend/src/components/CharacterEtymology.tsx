import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronRight, BookOpen } from 'lucide-react'
import { HanziWord } from '@/types'

interface EtymologyStage {
  era: string
  character: string
  description: string
  year?: string
}

interface CharacterEtymologyProps {
  character: string
  className?: string
  word?: HanziWord  // Optional: if provided, use evolution_history from API
  evolutionHistory?: string  // Optional: direct evolution history text
}

// Etymology data for common HSK 1 characters
const etymologyData: Record<string, EtymologyStage[]> = {
  '日': [
    { era: 'Oracle Bone', character: '☀', description: 'Drawing of the sun', year: '~1200 BC' },
    { era: 'Bronze', character: '◎', description: 'Circle with center dot', year: '~1000 BC' },
    { era: 'Seal Script', character: '囗', description: 'Square with horizontal line', year: '~200 BC' },
    { era: 'Modern', character: '日', description: 'Simplified rectangle', year: 'Today' }
  ],
  '月': [
    { era: 'Oracle Bone', character: '🌙', description: 'Crescent moon shape', year: '~1200 BC' },
    { era: 'Bronze', character: '⟨', description: 'Curved crescent', year: '~1000 BC' },
    { era: 'Seal Script', character: '⊏', description: 'Simplified curve', year: '~200 BC' },
    { era: 'Modern', character: '月', description: 'Two horizontal strokes', year: 'Today' }
  ],
  '山': [
    { era: 'Oracle Bone', character: '⛰', description: 'Three mountain peaks', year: '~1200 BC' },
    { era: 'Bronze', character: '∧∧∧', description: 'Three triangular peaks', year: '~1000 BC' },
    { era: 'Seal Script', character: '屮屮屮', description: 'Stylized peaks', year: '~200 BC' },
    { era: 'Modern', character: '山', description: 'Three vertical strokes', year: 'Today' }
  ],
  '水': [
    { era: 'Oracle Bone', character: '≋', description: 'Flowing water waves', year: '~1200 BC' },
    { era: 'Bronze', character: '川', description: 'Water stream lines', year: '~1000 BC' },
    { era: 'Seal Script', character: '氵', description: 'Three water drops', year: '~200 BC' },
    { era: 'Modern', character: '水', description: 'Central line with dots', year: 'Today' }
  ],
  '火': [
    { era: 'Oracle Bone', character: '🔥', description: 'Flames rising up', year: '~1200 BC' },
    { era: 'Bronze', character: '炎', description: 'Multiple flames', year: '~1000 BC' },
    { era: 'Seal Script', character: '灬', description: 'Four flame dots', year: '~200 BC' },
    { era: 'Modern', character: '火', description: 'Central stroke with sides', year: 'Today' }
  ],
  '木': [
    { era: 'Oracle Bone', character: '🌳', description: 'Tree with branches', year: '~1200 BC' },
    { era: 'Bronze', character: '𣎳', description: 'Tree trunk and branches', year: '~1000 BC' },
    { era: 'Seal Script', character: '朩', description: 'Simplified tree form', year: '~200 BC' },
    { era: 'Modern', character: '木', description: 'Cross with horizontal line', year: 'Today' }
  ],
  '人': [
    { era: 'Oracle Bone', character: '🚶', description: 'Walking person', year: '~1200 BC' },
    { era: 'Bronze', character: '𠆢', description: 'Person standing', year: '~1000 BC' },
    { era: 'Seal Script', character: '亻', description: 'Two stroke person', year: '~200 BC' },
    { era: 'Modern', character: '人', description: 'Two strokes forming "人"', year: 'Today' }
  ],
  '大': [
    { era: 'Oracle Bone', character: '🙆', description: 'Person with arms spread', year: '~1200 BC' },
    { era: 'Bronze', character: '大', description: 'Wide stance figure', year: '~1000 BC' },
    { era: 'Seal Script', character: '大', description: 'Stylized figure', year: '~200 BC' },
    { era: 'Modern', character: '大', description: 'Person with arms wide', year: 'Today' }
  ],
  '小': [
    { era: 'Oracle Bone', character: '⋮', description: 'Three small dots', year: '~1200 BC' },
    { era: 'Bronze', character: '⋯', description: 'Small divided parts', year: '~1000 BC' },
    { era: 'Seal Script', character: '小', description: 'Central line with sides', year: '~200 BC' },
    { era: 'Modern', character: '小', description: 'Small dividing strokes', year: 'Today' }
  ],
  '一': [
    { era: 'Oracle Bone', character: '—', description: 'Single horizontal line', year: '~1200 BC' },
    { era: 'Bronze', character: '—', description: 'One stroke', year: '~1000 BC' },
    { era: 'Seal Script', character: '—', description: 'Horizontal line', year: '~200 BC' },
    { era: 'Modern', character: '一', description: 'Single stroke', year: 'Today' }
  ],
  '二': [
    { era: 'Oracle Bone', character: '=', description: 'Two parallel lines', year: '~1200 BC' },
    { era: 'Bronze', character: '=', description: 'Two strokes', year: '~1000 BC' },
    { era: 'Seal Script', character: '=', description: 'Two horizontal lines', year: '~200 BC' },
    { era: 'Modern', character: '二', description: 'Two parallel strokes', year: 'Today' }
  ],
  '三': [
    { era: 'Oracle Bone', character: '≡', description: 'Three parallel lines', year: '~1200 BC' },
    { era: 'Bronze', character: '≡', description: 'Three strokes', year: '~1000 BC' },
    { era: 'Seal Script', character: '≡', description: 'Three horizontal lines', year: '~200 BC' },
    { era: 'Modern', character: '三', description: 'Three parallel strokes', year: 'Today' }
  ],
  '口': [
    { era: 'Oracle Bone', character: '○', description: 'Open mouth', year: '~1200 BC' },
    { era: 'Bronze', character: '◯', description: 'Round opening', year: '~1000 BC' },
    { era: 'Seal Script', character: '□', description: 'Square mouth', year: '~200 BC' },
    { era: 'Modern', character: '口', description: 'Square opening', year: 'Today' }
  ],
  '手': [
    { era: 'Oracle Bone', character: '✋', description: 'Hand with fingers', year: '~1200 BC' },
    { era: 'Bronze', character: '𠂇', description: 'Hand shape', year: '~1000 BC' },
    { era: 'Seal Script', character: '扌', description: 'Simplified hand', year: '~200 BC' },
    { era: 'Modern', character: '手', description: 'Three fingers and wrist', year: 'Today' }
  ],
  '目': [
    { era: 'Oracle Bone', character: '👁', description: 'Eye with pupil', year: '~1200 BC' },
    { era: 'Bronze', character: '◉', description: 'Eye shape', year: '~1000 BC' },
    { era: 'Seal Script', character: '罒', description: 'Stylized eye', year: '~200 BC' },
    { era: 'Modern', character: '目', description: 'Rectangle with lines', year: 'Today' }
  ],
}

export default function CharacterEtymology({ character, className = '', word, evolutionHistory }: CharacterEtymologyProps) {
  const [currentStage, setCurrentStage] = useState(0)
  
  // Priority: 1. word object, 2. evolutionHistory prop, 3. hardcoded data
  const apiEvolutionHistory = word?.evolution_history || evolutionHistory
  
  // If we have evolution history from API, display it as text
  if (apiEvolutionHistory) {
    return (
      <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-amber-900">Character Evolution</h3>
        </div>
        <div className="text-xs leading-relaxed text-amber-900">
          {apiEvolutionHistory}
        </div>
      </div>
    )
  }
  
  // Fallback to hardcoded timeline data if available
  const etymology = etymologyData[character]

  if (!etymology) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-600">No evolution history available for this character.</p>
        </div>
      </div>
    )
  }

  const stage = etymology[currentStage]

  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
          <History className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-amber-900">Character Evolution</h3>
      </div>

      {/* Timeline Navigation */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {etymology.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStage(index)}
            className={`flex-1 h-2 rounded-full transition-all ${
              index === currentStage
                ? 'bg-amber-600'
                : index < currentStage
                ? 'bg-amber-400'
                : 'bg-amber-200'
            }`}
            aria-label={`Stage ${index + 1}`}
          />
        ))}
      </div>

      {/* Current Stage Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-lg p-6 mb-3 shadow-sm">
            <motion.div
              className="text-6xl mb-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {stage.character}
            </motion.div>
            <div className="text-xs text-amber-600 font-semibold mb-1">
              {stage.era}
              {stage.year && <span className="text-amber-500 ml-2">({stage.year})</span>}
            </div>
            <div className="text-sm text-gray-700 italic">
              {stage.description}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Previous
            </button>
            <button
              onClick={() => setCurrentStage(Math.min(etymology.length - 1, currentStage + 1))}
              disabled={currentStage === etymology.length - 1}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="text-center mt-3 text-xs text-amber-700">
        Stage {currentStage + 1} of {etymology.length}
      </div>
    </div>
  )
}
