import { useState, useEffect } from 'react'
import { vocabularyApi } from '@/services/api'
import { HanziWord } from '@/types'
import VocabularyCard from '@/components/VocabularyCard'

export default function Vocabulary() {
  const [words, setWords] = useState<HanziWord[]>([])
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [selectedLevel])

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      loadVocabulary()
    }
  }, [selectedLevel, selectedCategory])

  const loadCategories = async () => {
    try {
      const data = await vocabularyApi.getCategories(selectedLevel)
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadVocabulary = async () => {
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
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVocabulary()
      return
    }

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
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (!value.trim()) {
      loadVocabulary()
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setIsSearchMode(false)
    loadVocabulary()
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">HSK Vocabulary Flashcards</h1>
        <p className="text-gray-600 mb-6">
          Click on any card to reveal the meaning
        </p>

        {/* HSK Level Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedLevel === level
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              HSK {level}
            </button>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by Chinese, Pinyin, or English..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
          <p className="text-gray-600 mt-4">Loading vocabulary...</p>
        </div>
      ) : words.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">
            {isSearchMode
              ? `No results found for "${searchQuery}"`
              : selectedCategory
              ? `No vocabulary found in category "${selectedCategory}" for HSK Level ${selectedLevel}`
              : `No vocabulary found for HSK Level ${selectedLevel}`}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 text-gray-600 flex items-center gap-2">
            <span className="font-semibold">{words.length} words</span>
            {isSearchMode && <span>• Search results for "{searchQuery}"</span>}
            {!isSearchMode && (
              <>
                <span>• HSK Level {selectedLevel}</span>
                {selectedCategory && <span>• Category: {selectedCategory}</span>}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {words.map((word) => (
              <VocabularyCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
