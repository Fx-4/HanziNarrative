import { useState } from 'react'
import { motion } from 'framer-motion'
import { HanziWord } from '@/types'
import WordDetailsModal from './WordDetailsModal'
import AudioButton from './AudioButton'
import SpotlightCard from './animations/SpotlightCard'
import { Info, Brush } from 'lucide-react'

interface VocabularyCardProps {
  word: HanziWord
}

// HSK level gradient headers
const hskGradients: Record<number, string> = {
  1: 'from-emerald-400 to-teal-500',
  2: 'from-cyan-400 to-blue-500',
  3: 'from-blue-400 to-indigo-500',
  4: 'from-violet-400 to-purple-500',
  5: 'from-purple-400 to-fuchsia-500',
  6: 'from-rose-400 to-red-500',
}

// Category badge colors
const categoryColors: Record<string, string> = {
  verb:         'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  noun:         'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  adjective:    'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  adverb:       'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  pronoun:      'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  particle:     'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300',
  number:       'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  conjunction:  'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  preposition:  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  interjection: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
}

function getCategoryColor(category?: string) {
  if (!category) return 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300'
  return categoryColors[category.toLowerCase()] ??
    'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300'
}

export default function VocabularyCard({ word }: VocabularyCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const gradient = hskGradients[word.hsk_level] ?? hskGradients[1]

  return (
    <>
      <SpotlightCard spotlightColor="rgba(99,102,241,0.10)" className="h-full">
        <motion.div
          className="h-full flex flex-col rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300"
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* ── Header: character + HSK badge ── */}
          <div className={`relative bg-gradient-to-br ${gradient} p-5 flex flex-col items-center`}>
            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
              HSK {word.hsk_level}
            </span>

            <motion.div
              className="text-5xl font-bold text-white drop-shadow-md leading-none mb-1"
              style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {word.simplified}
            </motion.div>

            {word.traditional && word.traditional !== word.simplified && (
              <div
                className="text-sm text-white/80 font-medium"
                style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
              >
                {word.traditional}
              </div>
            )}
          </div>

          {/* ── Body: pinyin, english, meta ── */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Pinyin + audio */}
            <div className="flex items-center justify-between">
              <span
                className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide"
                style={{ fontFamily: '"Noto Sans", Arial, sans-serif' }}
              >
                {word.pinyin}
              </span>
              <AudioButton
                text={word.simplified}
                language="zh-CN"
                size="sm"
                variant="ghost"
                tooltipText="Hear pronunciation"
              />
            </div>

            {/* English meaning */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 flex-1">
              {word.english}
            </p>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5">
              {word.category && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${getCategoryColor(word.category)}`}>
                  {word.category}
                </span>
              )}
              {word.radical && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                  <Brush className="w-2.5 h-2.5" />
                  {word.radical}
                </span>
              )}
              {word.strokes && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {word.strokes} strokes
                </span>
              )}
            </div>

            {/* Details button */}
            <button
              onClick={() => setShowDetails(true)}
              className="mt-1 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5
                bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300
                hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300
                border border-gray-100 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700
                transition-all duration-200 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              View Details
            </button>
          </div>
        </motion.div>
      </SpotlightCard>

      <WordDetailsModal
        word={word}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}
