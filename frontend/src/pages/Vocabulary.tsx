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

// ── HSK level config ────────────────────────────────────────────
const HSK_LEVELS = [
  { level: 1, activeBg: 'bg-gradient-to-r from-emerald-400 to-teal-500',   gradient: 'from-emerald-400 to-teal-500',   label: 'Beginner' },
  { level: 2, activeBg: 'bg-gradient-to-r from-cyan-400 to-blue-500',      gradient: 'from-cyan-400 to-blue-500',      label: 'Elementary' },
  { level: 3, activeBg: 'bg-gradient-to-r from-blue-400 to-indigo-500',    gradient: 'from-blue-400 to-indigo-500',    label: 'Intermediate' },
  { level: 4, activeBg: 'bg-gradient-to-r from-violet-400 to-purple-500',  gradient: 'from-violet-400 to-purple-500',  label: 'Upper-Int.' },
  { level: 5, activeBg: 'bg-gradient-to-r from-purple-400 to-fuchsia-500', gradient: 'from-purple-400 to-fuchsia-500', label: 'Advanced' },
  { level: 6, activeBg: 'bg-gradient-to-r from-rose-400 to-red-500',       gradient: 'from-rose-400 to-red-500',       label: 'Mastery' },
]

type ViewMode = 'grid' | 'list'

export default function Vocabulary() {
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
      console.error('Failed to load categories:', error)
    }
  }, [selectedLevel])

  const loadVocabulary = useCallback(async () => {
    setLoading(true)
    setIsSearchMode(false)
    try {
      const data = await vocabularyApi.getByHSKLevel(selectedLevel, selectedCategory || undefined)
      setWords(data)
    } catch (error) {
      console.error('Failed to load vocabulary:', error)
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
      console.error('Failed to search vocabulary:', error)
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
          HSK Vocabulary
        </BlurText>
        <p className="text-sm text-gray-600">
          Browse, search, and study Chinese vocabulary from HSK levels 1–6.
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
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            HSK {level}
          </motion.button>
        ))}
      </div>

      {/* ── STATS BAR ── */}
      <AnimatePresence mode="wait">
        {!loading && !isSearchMode && (
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
                  {selectedCategory ? `"${selectedCategory}" words` : 'total words'} · HSK {selectedLevel}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-white/70 hidden sm:block font-medium">
              {currentLevel.label}
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
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (!e.target.value.trim()) loadVocabulary()
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search character, pinyin, or English…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                placeholder:text-gray-400"
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
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {selectedCategory && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
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
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize cursor-pointer
                      ${selectedCategory === cat.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
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
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <span>
              {isSearchMode ? `Results for "${searchQuery}"` : selectedCategory ? `HSK ${selectedLevel} · ${selectedCategory}` : ''}
              {' '}— <span className="font-semibold">{words.length} words</span>
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer text-xs"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </motion.div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className={`w-12 h-12 rounded-full border-4 border-gray-200`}
              style={{ borderTopColor: 'transparent' }}
            />
            <p className="text-gray-600 text-sm">Loading vocabulary…</p>
          </motion.div>

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
            <p className="text-lg font-semibold text-gray-700">No words found</p>
            <p className="text-sm text-gray-600 max-w-sm">
              {isSearchMode
                ? `No results for "${searchQuery}". Try a different keyword.`
                : `No vocabulary in${selectedCategory ? ` "${selectedCategory}"` : ''} HSK Level ${selectedLevel}.`}
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Clear Filters
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
            className="rounded-xl border border-gray-100 overflow-hidden bg-white"
          >
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2 sm:col-span-1">Char</div>
              <div className="col-span-3 sm:col-span-2">Pinyin</div>
              <div className="col-span-7 sm:col-span-5">English</div>
              <div className="hidden sm:block sm:col-span-2">Category</div>
              <div className="hidden sm:block sm:col-span-2 text-right">Action</div>
            </div>

            {words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.015, 0.4) }}
                className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center
                  border-b border-gray-50 last:border-0
                  hover:bg-gray-50 transition-colors group"
              >
                {/* Character */}
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                  >
                    {word.simplified}
                  </span>
                </div>

                {/* Pinyin + audio */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-indigo-600 truncate">
                    {word.pinyin}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <AudioButton text={word.simplified} language="zh-CN" size="sm" variant="ghost" />
                  </span>
                </div>

                {/* English */}
                <div className="col-span-7 sm:col-span-5 text-sm text-gray-700 line-clamp-1">
                  {word.english}
                </div>

                {/* Category */}
                <div className="hidden sm:flex sm:col-span-2 items-center">
                  {word.category && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize
                      ${word.category.toLowerCase() === 'verb'        ? 'bg-blue-100 text-blue-800'
                      : word.category.toLowerCase() === 'noun'        ? 'bg-green-100 text-green-800'
                      : word.category.toLowerCase() === 'adjective'   ? 'bg-purple-100 text-purple-800'
                      : word.category.toLowerCase() === 'adverb'      ? 'bg-orange-100 text-orange-800'
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
                      bg-indigo-50 text-indigo-700
                      hover:bg-indigo-100 font-medium cursor-pointer"
                  >
                    Details
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
