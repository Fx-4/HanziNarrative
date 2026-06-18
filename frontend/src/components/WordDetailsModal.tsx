import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import {
  X, BookOpen, Brush, Hash, Tag, Globe, Loader2,
  ScrollText, ExternalLink
} from 'lucide-react'
import AudioButton from './AudioButton'

import { API_URL as API_BASE } from '@/lib/env'

/* ─────────────────────────────────────
   Pexels via backend — best image match
───────────────────────────────────── */
function usePexelsImage(wordId: number, enabled: boolean, hasStoredImage: boolean, skipImage: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    // If word already has an image or category doesn't need one, skip fetch
    if (!enabled || hasStoredImage || skipImage) return

    setLoading(true)
    setImageUrl(null)
    const ctrl = new AbortController()

    fetch(`${API_BASE}/vocabulary/${wordId}/fetch-image`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.image_url) setImageUrl(data.image_url) })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [wordId, enabled, hasStoredImage, skipImage])

  return { imageUrl, loading }
}

/* ─────────────────────────────────────
   Wikipedia REST API — text / link only
───────────────────────────────────── */
interface WikiData {
  extract?: string
  pageUrl?: string
}

const SKIP_IMAGE_CATEGORIES = ['particle', 'pronoun', 'conjunction', 'preposition', 'interjection']

function useWikipedia(englishWord: string, enabled: boolean, category?: string) {
  const [data, setData] = useState<WikiData | null>(null)

  const skipImage = !!(category && SKIP_IMAGE_CATEGORIES.includes(category.toLowerCase()))

  useEffect(() => {
    if (!enabled) return
    setData(null)
    let keyword = englishWord.split(/[,;]/)[0].trim()
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
            extract: json.extract ?? undefined,
            pageUrl: json.content_urls?.desktop?.page,
          })
        }
      })
      .catch(() => {})

    return () => ctrl.abort()
  }, [englishWord, enabled])

  return { data, skipImage }
}

/* ─────────────────────────────────────
   HSK gradient + category config
───────────────────────────────────── */
const hskGradients: Record<number, string> = {
  1: 'from-emerald-500 to-teal-600',
  2: 'from-cyan-500 to-blue-600',
  3: 'from-blue-500 to-indigo-600',
  4: 'from-violet-500 to-purple-600',
  5: 'from-purple-500 to-fuchsia-600',
  6: 'from-rose-500 to-red-600',
}

const hskLabel: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Upper-Intermediate',
  5: 'Advanced',
  6: 'Mastery',
}

const categoryColors: Record<string, string> = {
  noun:        'bg-success-50 text-success-700 border-success-200',
  verb:        'bg-blue-50 text-blue-700 border-blue-200',
  adjective:   'bg-purple-50 text-purple-700 border-purple-200',
  adverb:      'bg-orange-50 text-orange-700 border-orange-200',
  pronoun:     'bg-pink-50 text-pink-700 border-pink-200',
  particle:    'bg-gray-50 text-gray-600 border-gray-200',
  preposition: 'bg-primary-50 text-primary-700 border-primary-200',
  conjunction: 'bg-teal-50 text-teal-700 border-teal-200',
  number:      'bg-amber-50 text-amber-700 border-amber-200',
}

function getCatStyle(cat?: string) {
  if (!cat) return ''
  return (
    categoryColors[cat.toLowerCase()] ??
    'bg-primary-50 text-primary-700 border-primary-200'
  )
}

/* ─────────────────────────────────────
   Component
───────────────────────────────────── */
interface WordDetailsModalProps {
  word: HanziWord
  isOpen: boolean
  onClose: () => void
}

export default function WordDetailsModal({ word, isOpen, onClose }: WordDetailsModalProps) {
  const gradient = hskGradients[word.hsk_level] ?? hskGradients[1]

  const { data: wiki, skipImage } = useWikipedia(word.english, isOpen, word.category)
  const { imageUrl: pixabayImage, loading: pixabayLoading } = usePexelsImage(
    word.id, isOpen, !!word.image_url, skipImage,
  )

  // Priority: stored DB image → Pexels fetch → nothing
  const imageUrl    = !skipImage ? (word.image_url || pixabayImage || undefined) : undefined
  const imageLoading = !skipImage && !word.image_url && pixabayLoading

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ── Modal ── */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto dark:bg-surface-card"
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >

              {/* ══════════════════════════════════
                  HEADER — gradient by HSK level
              ════════════════════════════════════ */}
              <div className={`relative bg-gradient-to-br ${gradient} p-6 text-white flex-shrink-0`}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* HSK badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    HSK {word.hsk_level} — {hskLabel[word.hsk_level] ?? ''}
                  </span>
                  {word.category && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 capitalize flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {word.category}
                    </span>
                  )}
                </div>

                {/* Main character display */}
                <div className="flex items-end gap-5">
                  {/* Simplified (big) */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-[72px] font-bold leading-none drop-shadow-lg"
                    style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                  >
                    {word.simplified}
                  </motion.div>

                  {/* Meta column */}
                  <motion.div
                    initial={{ x: 12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="pb-1"
                  >
                    {/* Traditional form */}
                    {word.traditional && word.traditional !== word.simplified && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-medium text-white/60">
                          trad.
                        </span>
                        <span
                          className="text-3xl font-bold text-white/80 leading-none"
                          style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                        >
                          {word.traditional}
                        </span>
                      </div>
                    )}
                    {/* Pinyin + audio */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-semibold tracking-wide">{word.pinyin}</span>
                      <AudioButton
                        text={word.simplified}
                        language="zh-CN"
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 text-white hover:bg-white/30"
                        tooltipText="Hear pronunciation"
                      />
                    </div>
                    {/* English */}
                    <p className="text-base text-white/90 leading-snug max-w-[220px]">
                      {word.english}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* ══════════════════════════════════
                  SCROLLABLE BODY
              ════════════════════════════════════ */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">

                {/* ── Visual Section (Pexels image) ── */}
                <div className="relative">
                  {imageLoading ? (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-7 h-7 text-gray-400 animate-spin dark:text-gray-500" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">Loading visual reference…</p>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="relative w-full aspect-[4/3] bg-gray-900/5 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${word.english} — visual reference`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      {/* Gradient overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {wiki?.extract && (
                          <p className="text-xs text-white/90 leading-relaxed line-clamp-2 mb-2 drop-shadow">
                            {wiki.extract}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          {wiki?.pageUrl && (
                            <a
                              href={wiki.pageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <Globe className="w-3 h-3" />
                              Wikipedia
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <a
                            href="https://www.pexels.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 transition-colors ml-auto"
                            onClick={e => e.stopPropagation()}
                          >
                            Photos by Pexels
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* No image — decorative strip */
                    <div className={`h-4 bg-gradient-to-r ${gradient} opacity-30`} />
                  )}

                  {/* ── Wikipedia link always visible when no image ── */}
                  {!imageUrl && wiki?.pageUrl && (
                    <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 dark:bg-blue-950/30 dark:border-blue-900/40">
                      <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {wiki?.extract && (
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3 mb-1.5 dark:text-gray-300">
                            {wiki.extract}
                          </p>
                        )}
                        <a
                          href={wiki.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                          onClick={e => e.stopPropagation()}
                        >
                          Read on Wikipedia
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Word Details Grid ── */}
                <div className="p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2 dark:text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    Word Details
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {/* Radical */}
                    {word.radical && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40">
                        <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1 dark:text-amber-400">
                          <Brush className="w-2.5 h-2.5" />
                          Radical
                        </p>
                        <p
                          className="text-2xl font-bold text-amber-800 leading-none dark:text-amber-300"
                          style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                        >
                          {word.radical}
                        </p>
                      </div>
                    )}

                    {/* Stroke count */}
                    {word.strokes && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1 dark:text-gray-400">
                          <Hash className="w-2.5 h-2.5" />
                          Strokes
                        </p>
                        <p className="text-2xl font-bold text-gray-800 leading-none dark:text-gray-200">
                          {word.strokes}
                        </p>
                      </div>
                    )}

                    {/* Category */}
                    {word.category && (
                      <div className={`p-3 rounded-xl border ${getCatStyle(word.category)}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 flex items-center gap-1 opacity-70">
                          <Tag className="w-2.5 h-2.5" />
                          Category
                        </p>
                        <p className="text-sm font-bold capitalize leading-tight flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 opacity-70" /> {word.category}
                        </p>
                      </div>
                    )}

                    {/* Traditional form */}
                    {word.traditional && word.traditional !== word.simplified && (
                      <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 dark:bg-primary-950/30 dark:border-primary-900/40">
                        <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-widest mb-1 dark:text-primary-400">
                          Traditional
                        </p>
                        <p
                          className="text-2xl font-bold text-primary-800 leading-none dark:text-primary-300"
                          style={{ fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif' }}
                        >
                          {word.traditional}
                        </p>
                      </div>
                    )}

                    {/* HSK Level */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1 dark:text-gray-400">
                        HSK Level
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {word.hsk_level} — {hskLabel[word.hsk_level]}
                      </p>
                    </div>
                  </div>

                  {/* ── Character Evolution History ── */}
                  {word.evolution_history && (
                    <div className="mb-5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2 dark:text-gray-500">
                        <ScrollText className="w-3.5 h-3.5" />
                        Character Evolution
                      </h3>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40">
                        <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">
                          {word.evolution_history}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ══════════════════════════════════
                  FOOTER
              ════════════════════════════════════ */}
              <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <button
                  onClick={onClose}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${gradient} hover:opacity-90 active:opacity-80 transition-opacity shadow-md`}
                >
                  Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
