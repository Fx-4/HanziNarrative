import { useState } from 'react'
import { type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord, WritingProgress } from '@/types'
import {
  Circle,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react'

type IconComponent = FC<{ className?: string }>

interface CharacterGridProps {
  characters: HanziWord[]
  progress?: WritingProgress[]
  selectedCharacter?: HanziWord
  onCharacterSelect: (character: HanziWord) => void
  mode?: 'practice' | 'timed' | 'mastery' | null
}

export default function CharacterGrid({
  characters,
  progress = [],
  selectedCharacter,
  onCharacterSelect,
}: CharacterGridProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all')

  const getCharacterProgress = (wordId: number): WritingProgress | undefined => {
    return progress.find(p => p.word_id === wordId)
  }

  const getMasteryLevel = (characterProgress?: WritingProgress): {
    level: 'new' | 'learning' | 'mastered'
    icon: IconComponent
    color: string
  } => {
    if (!characterProgress) {
      return { level: 'new', icon: Circle, color: 'gray' }
    }
    if (characterProgress.mastery_level >= 80) {
      return { level: 'mastered', icon: Award, color: 'green' }
    }
    if (characterProgress.total_attempts > 0) {
      return { level: 'learning', icon: TrendingUp, color: 'blue' }
    }
    return { level: 'new', icon: Circle, color: 'gray' }
  }

  const getFilteredCharacters = () => {
    if (filter === 'all') return characters
    return characters.filter(char => {
      const charProgress = getCharacterProgress(char.id)
      const mastery = getMasteryLevel(charProgress)
      return mastery.level === filter
    })
  }

  const filteredCharacters = getFilteredCharacters()

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success-600 dark:text-success-400'
    if (accuracy >= 70) return 'text-blue-600 dark:text-blue-400'
    if (accuracy >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const inactivePill = 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
  const filters = [
    { key: 'all' as const,      label: `All (${characters.length})`, icon: null,      activeClass: 'bg-primary-600 text-white', inactiveClass: inactivePill },
    { key: 'new' as const,      label: 'New',                        icon: Sparkles,  activeClass: 'bg-purple-600 text-white',  inactiveClass: inactivePill },
    { key: 'learning' as const, label: 'Learning',                   icon: TrendingUp,activeClass: 'bg-blue-600 text-white',    inactiveClass: inactivePill },
    { key: 'mastered' as const, label: 'Mastered',                   icon: Award,     activeClass: 'bg-success-600 text-white', inactiveClass: inactivePill },
  ]

  return (
    <div>
      {/* Filter Pills — horizontal, single row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {filters.map(({ key, label, icon: Icon, activeClass, inactiveClass }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filter === key ? activeClass : inactiveClass
            }`}
          >
            {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
            {label}
          </button>
        ))}
      </div>

      {/* Character Grid — 2 cols on all mobile, 3 cols on tablet+ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2"
        >
          {filteredCharacters.map((character, index) => {
            const charProgress = getCharacterProgress(character.id)
            const mastery = getMasteryLevel(charProgress)
            const MasteryIcon = mastery.icon
            const isSelected = selectedCharacter?.id === character.id

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onCharacterSelect(character)}
                className="cursor-pointer"
              >
                <div
                  className={`relative rounded-xl border-2 p-2 text-center overflow-hidden
                    transition-all duration-200 hover:shadow-md active:scale-95
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md dark:bg-primary-950/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card hover:border-primary-300'
                    }`}
                >
                  {/* Mastery icon top-right */}
                  <div className="absolute top-1.5 right-1.5">
                    <MasteryIcon className={`w-3.5 h-3.5 text-${mastery.color}-500`} />
                  </div>

                  {/* Chinese Character — hidden so the list doesn't leak the answer;
                      writing practice is from memory (reveal via Hint on the canvas card) */}
                  <div className="text-3xl font-chinese leading-tight mb-1 text-gray-300 dark:text-gray-600 select-none">
                    ？
                  </div>

                  {/* Pinyin */}
                  <div className="text-[11px] text-primary-600 font-semibold leading-none mb-0.5 dark:text-primary-400">
                    {character.pinyin}
                  </div>

                  {/* English — capped at 1 line */}
                  <div className="text-[10px] text-gray-500 truncate px-0.5 leading-none mb-1 dark:text-gray-400">
                    {character.english}
                  </div>

                  {/* Progress bar + accuracy (if practiced) */}
                  {charProgress && charProgress.total_attempts > 0 ? (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{charProgress.total_attempts}×</span>
                        <span className={`font-bold ${getAccuracyColor(charProgress.accuracy_score)}`}>
                          {Math.round(charProgress.accuracy_score)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            charProgress.mastery_level >= 80 ? 'bg-success-500'
                            : charProgress.mastery_level >= 50 ? 'bg-blue-500'
                            : 'bg-yellow-500'
                          }`}
                          style={{ width: `${charProgress.mastery_level}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">New</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredCharacters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Circle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No characters in this category
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
          >
            View all →
          </button>
        </motion.div>
      )}
    </div>
  )
}
