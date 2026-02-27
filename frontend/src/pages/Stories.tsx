import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { storiesApi } from '@/services/api'
import { Story } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BookOpen, Calendar, Sparkles } from 'lucide-react'
import StoryGenerator from '@/components/StoryGenerator'

type TabType = 'browse' | 'generate'

export default function Stories() {
  const [activeTab, setActiveTab] = useState<TabType>('browse')
  const [stories, setStories] = useState<Story[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [selectedLevel])

  const loadStories = async () => {
    setLoading(true)
    try {
      const data = await storiesApi.getAll(selectedLevel)
      setStories(data)
    } catch (error) {
      console.error('Failed to load stories:', error)
    } finally {
      setLoading(false)
    }
  }

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
        className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400" />
        Interactive Stories
      </motion.h1>

      {/* Tabs */}
      <motion.div
        className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-700"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 sm:pb-4 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'browse'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Browse Stories
            </div>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 sm:pb-4 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'generate'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Generate Story
            </div>
          </button>
        </div>
      </motion.div>

      {/* Browse Stories Tab */}
      {activeTab === 'browse' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filter by HSK Level
            </label>
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
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading stories...</p>
            </motion.div>
          ) : stories.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-12 px-6">
                <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No stories found for this level. Check back soon!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link to={`/stories/${story.id}`} className="block h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1 mr-2">
                          {story.title}
                        </h3>
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                          HSK {story.hsk_level}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 text-sm sm:text-base">
                        {story.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
      )}

      {/* Generate Story Tab */}
      {activeTab === 'generate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StoryGenerator />
        </motion.div>
      )}
    </motion.div>
  )
}
