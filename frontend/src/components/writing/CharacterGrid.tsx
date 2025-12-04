import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord, WritingProgress } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Circle,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react'

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
  mode: _mode = 'practice'
}: CharacterGridProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all')

  const getCharacterProgress = (wordId: number): WritingProgress | undefined => {
    return progress.find(p => p.word_id === wordId)
  }

  const getMasteryLevel = (characterProgress?: WritingProgress): {
    level: 'new' | 'learning' | 'mastered'
    icon: any
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
    if (accuracy >= 90) return 'text-green-600'
    if (accuracy >= 70) return 'text-blue-600'
    if (accuracy >= 50) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="mb-4 flex flex-col gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({characters.length})
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            filter === 'new'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Sparkles className="w-3 h-3 inline mr-1" />
          New
        </button>
        <button
          onClick={() => setFilter('learning')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            filter === 'learning'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Learning
        </button>
        <button
          onClick={() => setFilter('mastered')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            filter === 'mastered'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Award className="w-3 h-3 inline mr-1" />
          Mastered
        </button>
      </div>

      {/* Character Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {filteredCharacters.map((character, index) => {
            const charProgress = getCharacterProgress(character.id)
            const mastery = getMasteryLevel(charProgress)
            const MasteryIcon = mastery.icon
            const isSelected = selectedCharacter?.id === character.id

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onCharacterSelect(character)}
                className="cursor-pointer"
              >
                <Card
                  hover
                  className={`p-3 text-center relative overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : ''
                  }`}
                >
                  {/* Mastery Badge */}
                  <div className="absolute top-1.5 right-1.5">
                    <MasteryIcon
                      className={`w-4 h-4 text-${mastery.color}-600`}
                    />
                  </div>

                  {/* Character */}
                  <div className="text-4xl font-chinese mb-2 text-gray-900 leading-tight">
                    {character.simplified}
                  </div>

                  {/* Pinyin */}
                  <div className="text-xs text-primary-600 font-semibold mb-1">
                    {character.pinyin}
                  </div>

                  {/* English */}
                  <div className="text-xs text-gray-600 mb-1 truncate px-1">
                    {character.english}
                  </div>

                  {/* Progress Info */}
                  {charProgress && charProgress.total_attempts > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">
                          {charProgress.total_attempts}x
                        </span>
                        <span className={`font-bold ${getAccuracyColor(charProgress.accuracy_score)}`}>
                          {Math.round(charProgress.accuracy_score)}%
                        </span>
                      </div>

                      {/* Mastery Progress Bar */}
                      <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            charProgress.mastery_level >= 80
                              ? 'bg-green-500'
                              : charProgress.mastery_level >= 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${charProgress.mastery_level}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* New Badge */}
                  {!charProgress && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <Badge variant="default" className="text-[10px] px-2 py-0.5">
                        New
                      </Badge>
                    </div>
                  )}
                </Card>
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
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Circle className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">
            No characters found in this category
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            View all characters
          </button>
        </motion.div>
      )}
    </div>
  )
}
