import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { HanziWord } from '@/types'
import { Sparkles, BookOpen } from 'lucide-react'

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-xl"></div>
      </div>
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
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              每日一词
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <BookOpen className="w-3 h-3" />
            <span>HSK {word.hsk_level}</span>
          </div>
        </div>

        {/* Word Display */}
        <div className="text-center py-2 sm:py-3">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}>
            {word.simplified}
          </div>
          <div className="text-base sm:text-lg md:text-xl text-indigo-600 mb-1 sm:mb-2 font-medium">
            {word.pinyin}
          </div>
          <div className="text-sm sm:text-base md:text-lg text-gray-700">
            {word.english}
          </div>

          {/* Category Badge */}
          {word.category && (
            <div className="mt-2 sm:mt-3">
              <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-white rounded-full text-[10px] sm:text-xs font-medium text-indigo-700 border border-indigo-200">
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
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-gray-500">
          Word of the Day • {new Date(wordData.date).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  )
}
