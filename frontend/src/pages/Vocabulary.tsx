import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vocabularyApi } from '@/services/api'
import { HanziWord } from '@/types'
import VocabularyCard from '@/components/VocabularyCard'
import AudioButton from '@/components/AudioButton'
import WordDetailsModal from '@/components/WordDetailsModal'
import { motion, AnimatePresence } from 'framer-motion'
import BlurText from '@/components/animations/BlurText'
import CountUp from '@/components/animations/CountUp'
import { Search, X, LayoutGrid, List, BookOpen, SlidersHorizontal } from 'lucide-react'
import { createLogger } from '@/utils/debugLogger'
import { useTranslation } from 'react-i18next'

const vocabularyLogger = createLogger('Vocabulary')

// ── HSK level config ────────────────────────────────────────────
const HSK_LEVELS = [
  { level: 1, activeBg: 'bg-gradient-to-r from-success-400 to-teal-500',   gradient: 'from-success-400 to-teal-500',   label: 'Beginner' },
  { level: 2, activeBg: 'bg-gradient-to-r from-cyan-400 to-blue-500',      gradient: 'from-cyan-400 to-blue-500',      label: 'Elementary' },
  { level: 3, activeBg: 'bg-gradient-to-r from-blue-400 to-primary-500',    gradient: 'from-blue-400 to-primary-500',    label: 'Intermediate' },
  { level: 4, activeBg: 'bg-gradient-to-r from-violet-400 to-purple-500',  gradient: 'from-violet-400 to-purple-500',  label: 'Upper-Int.' },
  { level: 5, activeBg: 'bg-gradient-to-r from-purple-400 to-fuchsia-500', gradient: 'from-purple-400 to-fuchsia-500', label: 'Advanced' },
  { level: 6, activeBg: 'bg-gradient-to-r from-rose-400 to-error-500',       gradient: 'from-rose-400 to-error-500',       label: 'Mastery' },
]

type ViewMode = 'grid' | 'list'

function VocabGridSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Gradient header placeholder */}
      <div className="h-[100px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
      {/* Pinyin + english lines */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mx-auto" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
      </div>
      {/* Badge row */}
      <div className="px-3 pb-3 flex gap-1.5">
        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

function VocabListRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center border-b border-gray-50 dark:border-gray-800">
      <div className="col-span-2 sm:col-span-1">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="col-span-3 sm:col-span-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="col-span-7 sm:col-span-5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
      </div>
      <div className="hidden sm:block sm:col-span-2">
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
      <div className="hidden sm:block sm:col-span-2" />
    </div>
  )
}

export default function Vocabulary() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [words, setWords]                       = useState<HanziWord[]>([])
  const [selectedLevel, setSelectedLevel]       = useState(1)
  const [loading, setLoading]                   = useState(true)
  const [searchQuery, setSearchQuery]           = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories]             = useState<{ value: string; label: string }[]>([])
  const [isSearchMode, setIsSearchMode]         = useState(!!searchParams.get('search'))
  const [viewMode, setViewMode]                 = useState<ViewMode>('grid')
  const [showFilters, setShowFilters]           = useState(false)
  const [listDetail, setListDetail]             = useState<HanziWord | null>(null)

  const currentLevel = HSK_LEVELS.find(l => l.level === selectedLevel) ?? HSK_LEVELS[0]

  // ── Data fetching ─────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const data = await vocabularyApi.getCategories(selectedLevel)
      setCategories(data)
    } catch (error) {
      vocabularyLogger.error('Failed to load categories:', error)
    }
  }, [selectedLevel])

  const loadVocabulary = useCallback(async () => {
    setLoading(true)
    setIsSearchMode(false)
    try {
      const data = await vocabularyApi.getByHSKLevel(selectedLevel, selectedCategory || undefined)
      setWords(data)
    } catch (error) {
      vocabularyLogger.error('Failed to load vocabulary:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedLevel, selectedCategory])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) { loadVocabulary(); return }
    setLoading(true)
    setIsSearchMode(true)
    try {
      const data = await vocabularyApi.searchWords(searchQuery, selectedLevel)
      setWords(data)
    } catch (error) {
      vocabularyLogger.error('Failed to search vocabulary:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedLevel, loadVocabulary])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => {
    if (searchQuery.trim()) handleSearch()
    else loadVocabulary()
  }, [selectedLevel, selectedCategory, searchQuery, handleSearch, loadVocabulary])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setIsSearchMode(false)
    loadVocabulary()
  }

  const hasActiveFilter = !!(searchQuery || selectedCategory)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

      {/* ── PAGE HEADER ── */}
      <div className="mb-6 sm:mb-8">
        <BlurText
          as="h1"
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
          wordDelay={0.07}
        >
          {t('vocabulary.title')}
        </BlurText>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('vocabulary.subtitle')}
        </p>
      </div>

      {/* ── HSK LEVEL TABS ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
        {HSK_LEVELS.map(({ level, activeBg }) => (
          <motion.button
            key={level}
            onClick={() => { setSelectedLevel(level); setSelectedCategory('') }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer
              ${selectedLevel === level
                ? `${activeBg} text-white shadow-lg`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            HSK {level}
          </motion.button>
        ))}
      </div>

      {/* ── STATS BAR ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="stats-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-4 mb-5 bg-gray-200 dark:bg-gray-700 animate-pulse h-[72px]"
          />
        ) : !isSearchMode && (
          <motion.div
            key={`stats-${selectedLevel}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-xl p-4 mb-5 bg-gradient-to-r ${currentLevel.gradient} text-white flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none">
                  <CountUp to={words.length} duration={0.8} />
                </div>
                <div className="text-xs text-white/80 mt-0.5">
                  {selectedCategory ? t('vocabulary.categoryWords', { category: selectedCategory }) : t('vocabulary.totalWords')} · HSK {selectedLevel}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-white/70 hidden sm:block font-medium">
              {t(`vocabulary.levels.${selectedLevel}`)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH + FILTER BAR ── */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="vocab-search"
              name="vocab-search"
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (!e.target.value.trim()) loadVocabulary()
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('vocabulary.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer
              ${showFilters || selectedCategory
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t('vocabulary.filter')}</span>
            {selectedCategory && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category filter chips (collapsible) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                    ${!selectedCategory
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                >
                  {t('vocabulary.all')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize cursor-pointer
                      ${selectedCategory === cat.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter summary */}
        {hasActiveFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span>
              {isSearchMode ? t('vocabulary.resultsFor', { query: searchQuery }) : selectedCategory ? `HSK ${selectedLevel} · ${selectedCategory}` : ''}
              {' '}— <span className="font-semibold">{t('vocabulary.wordsCount', { n: words.length })}</span>
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-primary-600 hover:underline cursor-pointer text-xs dark:text-primary-400"
            >
              <X className="w-3 h-3" />
              {t('vocabulary.clear')}
            </button>
          </motion.div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading ? (
          viewMode === 'grid' ? (
            <motion.div
              key="loading-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <VocabGridSkeleton key={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="loading-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900"
            >
              {/* Column headers placeholder */}
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="col-span-2 sm:col-span-1 h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="col-span-3 sm:col-span-2 h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="col-span-7 sm:col-span-5 h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              {Array.from({ length: 10 }).map((_, i) => (
                <VocabListRowSkeleton key={i} />
              ))}
            </motion.div>
          )

        ) : words.length === 0 ? (
          /* Empty state */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-3"
          >
            <div className="text-5xl">📚</div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('vocabulary.noWordsFound')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              {isSearchMode
                ? t('vocabulary.noResults', { query: searchQuery })
                : selectedCategory
                  ? t('vocabulary.noVocabCategory', { category: selectedCategory, level: selectedLevel })
                  : t('vocabulary.noVocab', { level: selectedLevel })}
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer"
              >
                {t('vocabulary.clearFilters')}
              </button>
            )}
          </motion.div>

        ) : viewMode === 'grid' ? (
          /* Grid view */
          <motion.div
            key={`grid-${selectedLevel}-${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: Math.min(index * 0.03, 0.6),
                  duration: 0.3,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                <VocabularyCard word={word} />
              </motion.div>
            ))}
          </motion.div>

        ) : (
          /* List view */
          <motion.div
            key={`list-${selectedLevel}-${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900"
          >
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <div className="col-span-2 sm:col-span-1">{t('vocabulary.colChar')}</div>
              <div className="col-span-3 sm:col-span-2">{t('vocabulary.colPinyin')}</div>
              <div className="col-span-7 sm:col-span-5">{t('vocabulary.colEnglish')}</div>
              <div className="hidden sm:block sm:col-span-2">{t('vocabulary.colCategory')}</div>
              <div className="hidden sm:block sm:col-span-2 text-right">{t('vocabulary.colAction')}</div>
            </div>

            {words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.015, 0.4) }}
                className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center
                  border-b border-gray-50 dark:border-gray-800 last:border-0
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                {/* Character */}
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                    style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                  >
                    {word.simplified}
                  </span>
                </div>

                {/* Pinyin + audio */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-primary-600 truncate dark:text-primary-400">
                    {word.pinyin}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <AudioButton text={word.simplified} language="zh-CN" size="sm" variant="ghost" />
                  </span>
                </div>

                {/* English */}
                <div className="col-span-7 sm:col-span-5 text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                  {word.english}
                </div>

                {/* Category */}
                <div className="hidden sm:flex sm:col-span-2 items-center">
                  {word.category && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize
                      ${word.category.toLowerCase() === 'verb'        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      : word.category.toLowerCase() === 'noun'        ? 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300'
                      : word.category.toLowerCase() === 'adjective'   ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                      : word.category.toLowerCase() === 'adverb'      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                      : 'bg-gray-100 text-gray-700'}`}
                    >
                      {word.category}
                    </span>
                  )}
                </div>

                {/* Details action */}
                <div className="hidden sm:flex sm:col-span-2 justify-end">
                  <button
                    onClick={() => setListDetail(word)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-3 py-1.5 rounded-lg
                      bg-primary-50 text-primary-700
                      hover:bg-primary-100 font-medium cursor-pointer dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/40"
                  >
                    {t('vocabulary.details')}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details modal for list view */}
      {listDetail && (
        <WordDetailsModal
          word={listDetail}
          isOpen={!!listDetail}
          onClose={() => setListDetail(null)}
        />
      )}
    </div>
  )
}


