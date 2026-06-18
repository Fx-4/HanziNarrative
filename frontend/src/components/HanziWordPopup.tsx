import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import { X, BookMarked, BookOpen, Brush, Hash, Tag, Loader2 } from 'lucide-react'
import AudioButton from './AudioButton'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────
   Wikipedia REST API — free, no API key
   Returns thumbnail + short extract for
   most common vocabulary words.
───────────────────────────────────── */
interface WikiData {
  thumbnail?: string
  extract?: string
}

// Categories where Wikipedia image lookup produces irrelevant results
const SKIP_WIKI_CATEGORIES = ['particle', 'pronoun', 'conjunction', 'preposition', 'interjection']

function useWikipedia(englishWord: string, category?: string) {
  const [data, setData] = useState<WikiData | null>(null)
  const [loading, setLoading] = useState(true)

  const shouldSkip = !!(category && SKIP_WIKI_CATEGORIES.includes(category.toLowerCase()))

  useEffect(() => {
    if (shouldSkip) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setData(null)
    // Use the first word/phrase only (strip alternatives like "to eat; to consume")
    let keyword = englishWord.split(/[,;]/)[0].trim()
    // Strip verb "to " prefix: "to eat" → "eat" for a better Wikipedia match
    if (keyword.toLowerCase().startsWith('to ')) keyword = keyword.slice(3)
    const ctrl = new AbortController()

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`,
      { signal: ctrl.signal }
    )
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (json) {
          setData({
            thumbnail: json.thumbnail?.source,
            extract: json.extract
              ? json.extract.substring(0, 140) + (json.extract.length > 140 ? '…' : '')
              : undefined,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [englishWord, shouldSkip])

  return { data, loading }
}

/* ─────────────────────────────────────
   Smart popup position — keep in viewport
───────────────────────────────────── */
function calcPosition(x: number, y: number) {
  const POP_W = 344
  const POP_H = 430 // estimated
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = x - POP_W / 2
  let top = y - POP_H - 14 // default: above the word

  // Clamp horizontally
  left = Math.max(8, Math.min(left, vw - POP_W - 8))
  // Too close to top → show below instead
  if (top < 60) top = y + 24
  // Clamp vertically
  top = Math.max(8, Math.min(top, vh - POP_H - 8))

  return { left, top }
}

/* ─────────────────────────────────────
   Category pill styling
───────────────────────────────────── */
const categoryColors: Record<string, string> = {
  noun:        'bg-success-50 text-success-700',
  verb:        'bg-blue-50 text-blue-700',
  adjective:   'bg-purple-50 text-purple-700',
  adverb:      'bg-orange-50 text-orange-700',
  pronoun:     'bg-pink-50 text-pink-700',
  particle:    'bg-gray-100 text-gray-600',
  preposition: 'bg-primary-50 text-primary-700',
  conjunction: 'bg-teal-50 text-teal-700',
  number:      'bg-amber-50 text-amber-700',
}

function getCategoryColor(cat?: string) {
  if (!cat) return 'bg-gray-100 text-gray-600'
  return categoryColors[cat.toLowerCase()] ?? 'bg-primary-50 text-primary-700'
}

/* ─────────────────────────────────────
   Main component
───────────────────────────────────── */
interface HanziWordPopupProps {
  word: HanziWord
  position: { x: number; y: number }
  onClose: () => void
  onOpenDetails?: () => void
}

export default function HanziWordPopup({
  word,
  position,
  onClose,
  onOpenDetails,
}: HanziWordPopupProps) {
  const { data: wiki, loading: wikiLoading } = useWikipedia(word.english, word.category)
  const pos = calcPosition(position.x, position.y)

  const handleSave = () => {
    toast.success(`"${word.simplified}" saved to collection!`)
  }

  const imageUrl = word.image_url || wiki?.thumbnail

  return (
    <AnimatePresence>
      {/* Invisible backdrop — click to close */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Popup card */}
      <motion.div
        key="popup"
        className="fixed z-50"
        style={{ left: pos.left, top: pos.top, width: 344 }}
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      >
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgb(0_0_0/0.25)] border border-gray-200/80 overflow-hidden dark:bg-surface-card">

          {/* ── Row 1: Character + close ── */}
          <div className="flex items-start justify-between px-4 pt-4 pb-0">
            <div className="flex items-end gap-2.5">
              <motion.span
                className="text-[52px] font-bold text-gray-900 leading-none dark:text-gray-50"
                style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {word.simplified}
              </motion.span>
              {word.traditional && word.traditional !== word.simplified && (
                <div className="mb-0.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-0.5 dark:text-gray-500">
                    trad.
                  </p>
                  <span
                    className="text-2xl text-gray-400 leading-none dark:text-gray-500"
                    style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                  >
                    {word.traditional}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1 -mt-0.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Row 2: Pinyin + audio + English ── */}
          <div className="px-4 pt-2 pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg font-semibold text-primary-600 tracking-wide">
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
            <p className="text-sm text-gray-700 leading-snug dark:text-gray-300">
              {word.english}
            </p>
          </div>

          {/* ── Row 3: Visual image (Wikipedia / fallback) ── */}
          <div className="mx-3 mb-3 h-36 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-800">
            {wikiLoading ? (
              /* Shimmer skeleton */
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center"
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin dark:text-gray-500" />
              </motion.div>
            ) : imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={`Visual for ${word.english}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Dark gradient for readable text overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                {wiki?.extract && (
                  <p className="absolute bottom-2 left-3 right-3 text-[10px] text-white/90 leading-snug line-clamp-2 drop-shadow">
                    {wiki.extract}
                  </p>
                )}
                {/* "via Wikipedia" badge */}
                <span className="absolute top-2 right-2 text-[9px] text-white/70 bg-black/25 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                  via Wikipedia
                </span>
              </>
            ) : (
              /* No image: big character on gradient bg */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50">
                <span
                  className="text-[80px] font-bold text-primary-200 select-none leading-none"
                  style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                >
                  {word.simplified}
                </span>
              </div>
            )}
          </div>

          {/* ── Row 4: Meta pills ── */}
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {/* HSK level */}
            <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
              HSK {word.hsk_level}
            </span>
            {/* Category */}
            {word.category && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${getCategoryColor(word.category)}`}>
                <Tag className="w-2.5 h-2.5" />
                {word.category}
              </span>
            )}
            {/* Radical */}
            {word.radical && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                <Brush className="w-2.5 h-2.5" />
                {word.radical}
              </span>
            )}
            {/* Strokes */}
            {word.strokes && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Hash className="w-2.5 h-2.5" />
                {word.strokes} strokes
              </span>
            )}
          </div>

          {/* ── Row 5: Action buttons ── */}
          <div className="px-3 pb-3 flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-2.5">
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600
                transition-colors"
            >
              <BookMarked className="w-3.5 h-3.5" />
              Save word
            </button>
            {onOpenDetails && (
              <button
                onClick={() => { onOpenDetails(); onClose() }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                  bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white
                  transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Full details
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
