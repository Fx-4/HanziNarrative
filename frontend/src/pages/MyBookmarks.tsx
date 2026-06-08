import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { storiesApi } from '@/services/api'
import { Story } from '@/types'
import { Heart, Calendar, BookOpen } from 'lucide-react'

export default function MyBookmarks() {
  const [bookmarks, setBookmarks] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>()

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    setLoading(true)
    try {
      const data = await storiesApi.getMyBookmarks()
      setBookmarks(data)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookmarks = selectedLevel
    ? bookmarks.filter(s => s.hsk_level === selectedLevel)
    : bookmarks

  const levels = [
    { value: undefined, label: 'All Levels' },
    ...Array.from({ length: 6 }, (_, i) => ({ value: i + 1, label: `HSK ${i + 1}` }))
  ]

  return (
    <motion.div
      className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 text-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
        My Bookmarks
      </motion.h1>

      {/* Level Filter */}
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="block text-sm font-medium text-gray-700 mb-3">
          Filter by HSK Level
        </p>
        <div className="flex flex-wrap gap-2">
          {levels.map((level, index) => (
            <motion.div
              key={level.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <button
                onClick={() => setSelectedLevel(level.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                  selectedLevel === level.value
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {level.label}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4 pr-8">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6 w-3/4" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-12 shrink-0" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-5/6" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-2/3" />
              </div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-28" />
            </div>
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-6">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks for this level'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {bookmarks.length === 0
                ? 'Save stories you love by clicking the heart button while reading.'
                : 'Try selecting a different HSK level.'}
            </p>
            {bookmarks.length === 0 && (
              <Link
                to="/stories"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6 py-3 font-semibold transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Browse Stories
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link to={`/stories/${story.id}`} className="block h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer relative">
                  <Heart className="absolute top-4 right-4 w-5 h-5 text-rose-500 fill-current" />
                  <div className="flex justify-between items-start mb-4 pr-8">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 mr-2">
                      {story.title}
                    </h3>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 flex-shrink-0">
                      HSK {story.hsk_level}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-3 mb-4 text-sm sm:text-base">
                    {story.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(story.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

