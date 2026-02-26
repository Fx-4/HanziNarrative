import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { HanziWord } from '@/types'
import { Sparkles, BookOpen } from 'lucide-react'
import { Card } from './ui/Card'

export default function WordOfTheDay() {
  const [wordData, setWordData] = useState<{ word: HanziWord; date: string; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWordOfTheDay()
  }, [])

  const loadWordOfTheDay = async () => {
    try {
      const data = await vocabularyApi.getWordOfTheDay()
      setWordData(data)
    } catch (error) {
      console.error('Failed to load word of the day:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </Card>
    )
  }

  if (!wordData) return null

  const { word } = wordData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20 border-2 border-primary-200 dark:border-primary-800 p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              每日一词
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            <BookOpen className="w-3 h-3" />
            <span>HSK {word.hsk_level}</span>
          </div>
        </div>

        {/* Word Display */}
        <div className="text-center py-2 sm:py-3">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {word.simplified}
          </div>
          <div className="text-base sm:text-lg md:text-xl text-primary-600 dark:text-primary-400 mb-1 sm:mb-2 font-medium">
            {word.pinyin}
          </div>
          <div className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">
            {word.english}
          </div>

          {/* Category Badge */}
          {word.category && (
            <div className="mt-2 sm:mt-3">
              <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-primary-700">
                {word.category}
              </span>
            </div>
          )}
        </div>

        {/* Image if available */}
        {word.image_url && (
          <div className="mt-2 sm:mt-3 flex justify-center">
            <img
              src={word.image_url}
              alt={word.simplified}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          Word of the Day • {new Date(wordData.date).toLocaleDateString()}
        </div>
      </Card>
    </motion.div>
  )
}
