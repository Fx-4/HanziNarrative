import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { storiesApi } from '@/services/api'
import { Story } from '@/types'
import { BookOpen, Calendar, Sparkles, Search } from 'lucide-react'
import StoryGenerator from '@/components/StoryGenerator'
import { createLogger } from '@/utils/debugLogger'
import { useTranslation } from 'react-i18next'

const storiesLogger = createLogger('Stories')

type TabType = 'browse' | 'generate'

function StoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 mr-2 animate-pulse" />
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function Stories() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('browse')
  const [stories, setStories] = useState<Story[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'curated' | 'ai_generated'>('all')

  useEffect(() => {
    loadStories()
  }, [selectedLevel])

  const loadStories = async () => {
    setLoading(true)
    try {
      const data = await storiesApi.getAll(selectedLevel)
      setStories(data)
    } catch (error) {
      storiesLogger.error('Failed to load stories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Called by StoryGenerator when a story finishes generating — adds it to the
  // top of the list instantly without re-fetching the full list.
  const handleStoryGenerated = (partial: {
    id: number
    title: string
    title_english?: string
    content: string
    hsk_level: number
  }) => {
    const newStory: Story = {
      id: partial.id,
      title: partial.title,
      title_english: partial.title_english,
      content: partial.content,
      hsk_level: partial.hsk_level,
      author_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: false,
      category: 'ai_generated',
    }
    setStories(prev => {
      // Avoid duplicates if the story is already in the list
      if (prev.some(s => s.id === newStory.id)) return prev
      return [newStory, ...prev]
    })
  }

  // Client-side filter — no extra API call on every keystroke
  const filteredStories = stories
    .filter(s =>
      !searchQuery.trim() ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title_english?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(s => {
      if (categoryFilter === 'all') return true
      // Treat null/undefined category as 'curated' for backward compatibility
      const storyCategory = s.category ?? 'curated'
      return storyCategory === categoryFilter
    })

  const levels = [
    { value: undefined, label: t('stories.allLevels') },
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
        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
        {t('stories.title')}
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
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('stories.tabBrowse')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 sm:pb-4 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'generate'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('stories.tabGenerate')}
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
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('stories.filterLevel')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
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
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Category filter */}
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('stories.filterCategory')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { value: 'all', label: t('stories.catAll') },
                { value: 'curated', label: t('stories.catCurated') },
                { value: 'ai_generated', label: t('stories.catAi') },
              ] as const).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                    categoryFilter === cat.value
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Client-side search — filters already-loaded stories with no extra API call */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="stories-search"
                name="stories-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('stories.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredStories.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-12 px-6">
                <BookOpen className="w-16 h-16 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {searchQuery.trim()
                    ? t('stories.noMatch', { query: searchQuery })
                    : t('stories.empty')}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link to={`/stories/${story.id}`} className="block h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1 mr-2">
                          {story.title}
                        </h3>
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 flex-shrink-0">
                          HSK {story.hsk_level}
                        </span>
                      </div>
                      {/* Category badge */}
                      <div className="mb-3">
                        {(story.category ?? 'curated') === 'ai_generated' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300">
                            {t('stories.catAi')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-950/40 text-success-700 dark:text-success-300">
                            {t('stories.catCurated')}
                          </span>
                        )}
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
          <StoryGenerator
            onStoryGenerated={handleStoryGenerated}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

