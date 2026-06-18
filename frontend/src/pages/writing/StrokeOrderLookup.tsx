import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import { vocabularyApi } from '@/services/api'
import { Search, X } from 'lucide-react'
import { StrokeOrderAnimation } from '@/components/writing'

export default function StrokeOrderLookup() {
  const [inputValue, setInputValue] = useState('')
  const [lookupChar, setLookupChar] = useState<string | null>(null)
  const [wordInfo, setWordInfo] = useState<HanziWord | null>(null)
  const [infoLoading, setInfoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isChinese = (char: string) => /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(char)

  const fetchWordInfo = async (char: string) => {
    setInfoLoading(true)
    setWordInfo(null)
    try {
      const results = await vocabularyApi.searchWords(char)
      const exact = results.find(w => w.simplified === char) || results[0] || null
      setWordInfo(exact)
    } catch {
      setWordInfo(null)
    } finally {
      setInfoLoading(false)
    }
  }

  const handleSearch = () => {
    const chars = [...inputValue].filter(isChinese)
    if (chars.length === 0) {
      setError('Masukkan minimal 1 karakter hanzi')
      return
    }
    setError(null)
    setLookupChar(chars[0])
    fetchWordInfo(chars[0])
  }

  const handleCharSelect = (char: string) => {
    setLookupChar(char)
    setError(null)
    fetchWordInfo(char)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setInputValue('')
    setLookupChar(null)
    setWordInfo(null)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="mt-6 sm:mt-8"
    >
      <div className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-500" />
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cari Cara Menulis Hanzi
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Ketik karakter hanzi, lalu lihat animasi urutan goresannya
          </p>

          {/* Input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="stroke-lookup"
                name="hanzi-search"
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setError(null) }}
                onKeyDown={handleKeyDown}
                placeholder="Ketik hanzi, misal: 你好学"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xl font-chinese text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3 font-semibold cursor-pointer flex items-center gap-2 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              Cari
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-error-500">{error}</p>
          )}

          {/* Character selector when input has multiple chars */}
          {inputValue && [...inputValue].filter(isChinese).length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Pilih karakter:</span>
              {[...inputValue].filter(isChinese).map((char, i) => (
                <button
                  key={i}
                  onClick={() => handleCharSelect(char)}
                  className={`text-xl font-chinese rounded-xl px-3 py-1.5 border cursor-pointer transition-colors ${
                    lookupChar === char
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          {/* Stroke order display */}
          <AnimatePresence mode="wait">
            {lookupChar && (
              <motion.div
                key={lookupChar}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 grid sm:grid-cols-2 gap-6 items-start"
              >
                {/* Left: character info */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-8xl font-chinese text-gray-800 dark:text-gray-200 leading-none">{lookupChar}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">U+{lookupChar.charCodeAt(0).toString(16).toUpperCase()}</span>

                  {/* Word info panel */}
                  {infoLoading ? (
                    <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                  ) : wordInfo ? (
                    <div className="w-full rounded-2xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-teal-700 dark:text-teal-400 font-chinese">{wordInfo.pinyin}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                          HSK {wordInfo.hsk_level}
                        </span>
                        {wordInfo.strokes && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {wordInfo.strokes} goresan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{wordInfo.english}</p>
                      {wordInfo.radical && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Radikal: <span className="font-chinese">{wordInfo.radical}</span></p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Info tidak ditemukan di database</p>
                  )}
                </div>

                {/* Right: stroke animation */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">Animasi cara menulis:</p>
                  <StrokeOrderAnimation
                    character={lookupChar}
                    size={220}
                    autoPlay={true}
                    loop={true}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

