import React, { useState, useEffect, useRef, useCallback } from 'react'
import { parse as parsePinyin, splitPinyinTokens } from '@/components/PinyinText'
import { fetchTTSAudio } from '@/utils/ttsHelper'
import { getShowPinyinPref } from '@/utils/uiPrefs'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pinyin } from 'pinyin-pro'

// pinyin-pro single-char lookup defaults to literary readings for some polyphones.
// These particles are almost exclusively used with their grammatical (non-literary)
// reading in HSK texts, so we override them here rather than globally (a global
// customPinyin override would break compound words like 了解→liǎojiě in sentences).
const PARTICLE_PINYIN: Record<string, string> = {
  '了': 'le',   // particle (vs. liǎo = understand/finish — rare in HSK stories)
}
import { storiesApi, vocabularyApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Story, HanziWord } from '@/types'
import HanziWordPopup from '@/components/HanziWordPopup'
import WordDetailsModal from '@/components/WordDetailsModal'
import { PinyinText } from '@/components/PinyinText'
import {
  BookOpen,
  Languages,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  BookMarked,
  Lightbulb,
  Type,
  Trash2,
  Heart,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { createLogger } from '@/utils/debugLogger'

const storyReaderLogger = createLogger('StoryReader')

interface ComprehensionQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function StoryReader() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  // Story data passed via router state (e.g. from StoryGenerator "View" button)
  // avoids a redundant DB fetch when the data is already available client-side.
  const preloadedStory = (location.state as { story?: Story } | null)?.story as Story | null | undefined
  const [story, setStory] = useState<Story | null>(preloadedStory ?? null)
  const [loading, setLoading] = useState(!preloadedStory)

  // Interactive features state
  const [showTranslation, setShowTranslation] = useState(false)
  const [showPinyin, setShowPinyin] = useState(() => getShowPinyinPref())
  const [isReading, setIsReading] = useState(false)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [selectedWord, setSelectedWord] = useState<HanziWord | null>(null)
  const [wordPosition, setWordPosition] = useState<{ x: number; y: number } | null>(null)
  const [showWordDetails, setShowWordDetails] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Refs for story audio playback (Google TTS, sequential)
  const isReadingRef = useRef(false)
  const storyAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (id) {
      loadStory(parseInt(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Close the delete-confirm modal on Escape
  useEffect(() => {
    if (!showDeleteConfirm) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDeleteConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showDeleteConfirm])

  const loadStory = async (storyId: number) => {
    if (preloadedStory) {
      // Story data was passed via router state — use it immediately, no network call.
      // Bookmark status is independent, so check it in the background.
      storiesApi.isBookmarked(storyId)
        .then(bm => setIsBookmarked(bm.is_bookmarked))
        .catch(() => { /* ignore — user might not be logged in */ })
      // loading is already false (set in useState initializer)
      return
    }

    setLoading(true)
    try {
      // Fetch story and bookmark status in parallel
      const [storyData, bm] = await Promise.all([
        storiesApi.getById(storyId),
        storiesApi.isBookmarked(storyId).catch(() => ({ is_bookmarked: false })),
      ])
      setStory(storyData)
      setIsBookmarked(bm.is_bookmarked)
    } catch (error) {
      storyReaderLogger.error('Failed to load story:', error)
      toast.error(t('storyReader.toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (!story || bookmarkLoading) return
    setBookmarkLoading(true)
    try {
      if (isBookmarked) {
        await storiesApi.unbookmarkStory(story.id)
        setIsBookmarked(false)
        toast.success(t('storyReader.toast.bookmarkRemoved'))
      } else {
        await storiesApi.bookmarkStory(story.id)
        setIsBookmarked(true)
        toast.success(t('storyReader.toast.bookmarked'))
      }
    } catch {
      toast.error(t('storyReader.toast.bookmarkFailed'))
    } finally {
      setBookmarkLoading(false)
    }
  }

  // Stop any ongoing story playback
  const stopReading = useCallback(() => {
    isReadingRef.current = false
    storyAudioRef.current?.pause()
    storyAudioRef.current = null
    setIsReading(false)
  }, [])

  // Play a single chunk via Edge TTS and wait until done
  const playChunk = async (text: string): Promise<void> => {
    try {
      const audio = await fetchTTSAudio({ text, speakingRate: 0.85 })
      storyAudioRef.current = audio
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
        audio.play().catch(() => resolve())
      })
    } catch {
      // ignore
    }
  }

  // Split story content into chunks ≤ 900 chars at sentence boundaries
  const chunkContent = (content: string): string[] => {
    const paragraphs = content.split('\n').filter(p => p.trim())
    const chunks: string[] = []
    for (const para of paragraphs) {
      if (para.length <= 900) {
        chunks.push(para)
      } else {
        // split at sentence-ending punctuation
        const parts = para.split(/(?<=[。！？])/).filter(Boolean)
        let current = ''
        for (const part of parts) {
          if (current.length + part.length > 900) {
            if (current) chunks.push(current)
            current = part
          } else {
            current += part
          }
        }
        if (current) chunks.push(current)
      }
    }
    return chunks.filter(c => c.trim())
  }

  const handleReadAloud = async () => {
    if (!story) return

    if (isReading) {
      stopReading()
      return
    }

    const chunks = chunkContent(story.content)
    if (!chunks.length) return

    setIsReading(true)
    isReadingRef.current = true
    toast.success(t('storyReader.toast.reading'))

    for (const chunk of chunks) {
      if (!isReadingRef.current) break
      await playChunk(chunk)
    }

    isReadingRef.current = false
    setIsReading(false)
  }

  const handleDeleteStory = async () => {
    if (!story) return

    setShowDeleteConfirm(false)

    try {
      await storiesApi.delete(story.id)
      toast.success(t('storyReader.toast.deleted'))
      navigate('/stories')
    } catch (error) {
      const err = error as { response?: { status?: number } }
      storyReaderLogger.error('Failed to delete story:', error)
      if (err.response?.status === 404) {
        toast.error(t('storyReader.toast.deleteNotFound'))
      } else if (err.response?.status === 401) {
        toast.error(t('storyReader.toast.deleteUnauthorized'))
      } else {
        toast.error(t('storyReader.toast.deleteFailed'))
      }
    }
  }

  const loadQuizQuestions = async () => {
    if (!story || questions.length > 0) return

    setLoadingQuiz(true)
    try {
      const quizData = await storiesApi.getStoryQuiz(story.id)
      setQuestions(quizData.questions)
      toast.success(t('storyReader.toast.quizLoaded'))
    } catch (error) {
      storyReaderLogger.error('Failed to load quiz:', error)
      toast.error(t('storyReader.toast.quizLoadFailed'))
      // Set fallback generic question
      setQuestions([
        {
          question: t('storyReader.quiz.fallbackQuestion'),
          options: [
            t('storyReader.quiz.fallbackOpt1'),
            t('storyReader.quiz.fallbackOpt2'),
            t('storyReader.quiz.fallbackOpt3'),
            t('storyReader.quiz.fallbackOpt4')
          ],
          correctAnswer: 0,
          explanation: t('storyReader.quiz.fallbackExplanation')
        }
      ])
    } finally {
      setLoadingQuiz(false)
    }
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answerIndex
    setQuizAnswers(newAnswers)
  }

  const handleSubmitQuiz = () => {
    if (quizAnswers.length < questions.length) {
      toast.error(t('storyReader.toast.answerAll'))
      return
    }
    setShowResults(true)

    const correctCount = questions.filter((q, i) => quizAnswers[i] === q.correctAnswer).length
    const score = Math.round((correctCount / questions.length) * 100)

    if (score >= 80) {
      toast.success(t('storyReader.toast.scoreGreat', { score }))
    } else if (score >= 60) {
      toast(t('storyReader.toast.scoreGood', { score }), { icon: '👍' })
    } else {
      toast(t('storyReader.toast.scoreKeep', { score }), { icon: '📚' })
    }
  }

  // Stable fallback — useCallback so PinyinText memo isn't defeated on re-renders
  const getPinyinFallback = useCallback(
    (char: string) => PARTICLE_PINYIN[char] ?? (pinyin(char, { toneType: 'symbol', type: 'array' })[0] || ''),
    [],
  )

  // Pre-compute paragraph+pinyin slices once when story changes (not on every render).
  // Uses parse()'s tokensConsumed to advance the pointer — not character count — so
  // erhua (点儿 → diǎnr, no separate token for 儿) and punct merging don't cause drift.
  const paragraphSlices = React.useMemo(() => {
    if (!story) return []
    const paragraphs = story.content.split('\n').filter(p => p.trim())
    if (!story.content_pinyin) return paragraphs.map(paragraph => ({ paragraph, paraSlice: '' }))

    // Normalise once so splitPinyinTokens doesn't run O(n) times per paragraph
    const normalizedParts = splitPinyinTokens(
      story.content_pinyin.trim().split(/\s+/).filter(Boolean)
    )
    let consumed = 0
    return paragraphs.map(paragraph => {
      // Pass all remaining tokens; parse() only consumes what it needs
      const remaining = normalizedParts.slice(consumed).join(' ')
      const { tokensConsumed } = parsePinyin(paragraph, remaining)
      const paraSlice = normalizedParts.slice(consumed, consumed + tokensConsumed).join(' ')
      consumed += tokensConsumed
      return { paragraph, paraSlice }
    })
  }, [story])

  const handleCharacterClick = useCallback(async (char: string, event: React.MouseEvent) => {
    // PinyinText only fires onCharClick for non-punct cells; guard is a safety net
    try {
      // Search for this character in vocabulary
      const words = await vocabularyApi.searchWords(char)
      if (words.length > 0) {
        setSelectedWord(words[0])
        // Get position for tooltip
        const rect = (event.target as HTMLElement).getBoundingClientRect()
        setWordPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
      } else {
        toast(t('storyReader.toast.wordNotFound'), { icon: '📚' })
      }
    } catch (error) {
      storyReaderLogger.error('Failed to lookup word:', error)
    }
  }, [t])

  const renderStoryContent = () => {
    if (!story) return null

    return (
      <div className="space-y-8">
        {paragraphSlices.map(({ paragraph, paraSlice }, pIdx) => (
          <motion.div
            key={pIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pIdx * 0.1 }}
            className="relative"
          >
            <PinyinText
              content={paragraph}
              contentPinyin={story.content_pinyin ? paraSlice : null}
              showPinyin={showPinyin}
              onCharClick={handleCharacterClick}
              getPinyinFallback={getPinyinFallback}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  const renderTranslation = () => {
    if (!story) return null

    // Get translation from story data
    const translation = story.english_translation ||
                       t('storyReader.translation.unavailable')

    const paragraphs = translation.split('\n').filter(p => p.trim())

    return (
      <AnimatePresence>
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6 dark:bg-blue-950/30 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-blue-600 shrink-0 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                  {t('storyReader.translation.title')}
                </h3>
              </div>
              <div className="space-y-3">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed dark:text-gray-300">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const renderVocabularyList = () => {
    if (!story) return null

    // Extract unique characters (in real app, this would be actual vocabulary)
    const uniqueChars = Array.from(new Set(story.content.replace(/[，。！？、；：""''（）《》【】…—\s\n]/g, '')))
      .slice(0, 30) // Show first 30 unique characters as example

    return (
      <AnimatePresence>
        {showVocabulary && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl overflow-y-auto z-50 p-4 sm:p-6 dark:bg-surface-card"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b dark:bg-surface-card">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-bold">{t('storyReader.vocab.title')}</h3>
              </div>
              <button
                onClick={() => setShowVocabulary(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl p-1.5 cursor-pointer transition-colors dark:text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-600 mb-4 dark:text-gray-400">
              {t('storyReader.vocab.count', { count: uniqueChars.length })}
            </div>

            <div className="space-y-3">
              {uniqueChars.map((char, idx) => {
                const charPinyin = PARTICLE_PINYIN[char] ?? pinyin(char, { toneType: 'symbol' })
                const isExpanded = selectedChar === char
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedChar(isExpanded ? null : char)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      isExpanded
                        ? 'bg-primary-100 border-primary-500 shadow-lg dark:bg-primary-900/40'
                        : 'bg-gradient-to-r from-gray-50 to-primary-50 hover:from-primary-100 hover:to-purple-100 border-gray-200 hover:border-primary-300 dark:to-primary-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                          {char}
                        </span>
                        <span className="text-lg text-primary-600 font-semibold dark:text-primary-400">
                          {charPinyin}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        #{idx + 1}
                      </span>
                    </div>

                    {!isExpanded ? (
                      <div className="text-xs text-gray-600 mt-2 dark:text-gray-400">
                        {t('storyReader.vocab.clickToSee')}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-primary-300"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1 dark:text-gray-400">{t('storyReader.vocab.character')}</p>
                            <p className="text-2xl font-chinese font-bold text-gray-900 dark:text-gray-50">{char}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1 dark:text-gray-400">{t('storyReader.vocab.pinyin')}</p>
                            <p className="text-base text-primary-700 dark:text-primary-300">{charPinyin}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1 dark:text-gray-400">{t('storyReader.vocab.meaning')}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {/* This would come from API in real app */}
                              {t('storyReader.vocab.meaningPlaceholder')}
                            </p>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/vocabulary?search=${char}`)
                                toast.success(t('storyReader.toast.openingVocab'))
                              }}
                              className="w-full bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-2xl px-4 py-2 font-semibold cursor-pointer transition-colors text-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                            >
                              {t('storyReader.vocab.viewInVocab')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const renderQuiz = () => {
    if (!story || !showQuiz) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <div className="bg-purple-50 border border-purple-200 rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6 dark:bg-purple-950/30 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-purple-600 shrink-0 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-purple-900">
              {t('storyReader.quiz.title')}
            </h3>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm dark:bg-surface-card">
                <p className="font-semibold text-gray-900 mb-4 dark:text-gray-50">
                  {qIdx + 1}. {question.question}
                </p>

                <div className="space-y-2">
                  {question.options.map((option, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx
                    const isCorrect = question.correctAnswer === oIdx
                    const showAnswer = showResults

                    return (
                      <button
                        key={oIdx}
                        onClick={() => !showResults && handleQuizAnswer(qIdx, oIdx)}
                        disabled={showResults}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          showAnswer && isCorrect
                            ? 'border-green-500 bg-success-50 dark:bg-success-950/30'
                            : showAnswer && isSelected && !isCorrect
                            ? 'border-error-500 bg-error-50 dark:bg-error-950/30'
                            : isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              showAnswer && isCorrect
                                ? 'border-green-500 bg-success-500'
                                : showAnswer && isSelected && !isCorrect
                                ? 'border-error-500 bg-error-500'
                                : isSelected
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="flex-1 text-sm sm:text-base">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-blue-50 rounded-xl dark:bg-blue-950/30"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">
                          {t('storyReader.quiz.explanation')}
                        </p>
                        <p className="text-blue-800 text-sm dark:text-blue-300">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {!showResults && (
            <button
              onClick={handleSubmitQuiz}
              className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors"
            >
              {t('storyReader.quiz.submit')}
            </button>
          )}

          {showResults && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setQuizAnswers([])
                  setShowResults(false)
                }}
                className="bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
              >
                {t('storyReader.quiz.retry')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        {/* Back button */}
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-24 mb-6" />
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-3/4" />
            <div className="flex gap-2">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-16" />
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-20" />
            </div>
          </div>
          {/* Story body lines */}
          <div className="p-6 sm:p-8 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6"
                style={{ width: `${75 + (i % 3) * 10}%` }} />
            ))}
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-600 text-lg dark:text-gray-400">{t('storyReader.notFound')}</p>
        <button
          onClick={() => navigate('/stories')}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors"
        >
          {t('storyReader.back')}
        </button>
      </div>
    )
  }

  // Only the author (or an admin) may delete — curated / other users' stories
  // are rejected by the backend, so hiding the button avoids a confusing dead-end.
  const canDelete = !!user && (story.author_id === user.id || user.is_admin === true)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            onClick={() => navigate('/stories')}
            className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium px-3 py-2 rounded-2xl hover:bg-primary-50 cursor-pointer transition-colors text-sm sm:text-base dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-primary-950/30"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t('storyReader.back')}</span>
            <span className="sm:hidden">{t('storyReader.backShort')}</span>
          </button>

          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-error-600 hover:text-error-700 hover:bg-error-50 font-medium px-3 py-2 rounded-2xl cursor-pointer transition-colors text-sm sm:text-base dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-950/30"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t('storyReader.delete')}</span>
              <span className="sm:hidden">{t('storyReader.deleteShort')}</span>
            </button>
          )}
        </div>

        {/* Title block */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight dark:text-gray-50">
            {story.title}
          </h1>
          {story.title_english && (
            <p className="text-base sm:text-xl text-gray-600 mb-3 italic dark:text-gray-400">
              {story.title_english}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              HSK {story.hsk_level}
            </span>
            {(story.category ?? 'curated') === 'ai_generated' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                ✨ {t('storyReader.aiGenerated')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300">
                📚 {t('storyReader.curated')}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-4 sm:p-6 dark:border-gray-800 dark:from-primary-950/30 dark:to-purple-950/30">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showPinyin
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 border border-gray-200 dark:border-gray-700 dark:hover:text-primary-300'
              }`}
            >
              <Type className="w-4 h-4 shrink-0" />
              <span>{showPinyin ? t('storyReader.controls.hidePinyin') : t('storyReader.controls.showPinyin')}</span>
            </button>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showTranslation
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 border border-gray-200 dark:border-gray-700 dark:hover:text-primary-300'
              }`}
            >
              {showTranslation
                ? <EyeOff className="w-4 h-4 shrink-0" />
                : <Eye className="w-4 h-4 shrink-0" />}
              <span>{showTranslation ? t('storyReader.controls.hideTranslation') : t('storyReader.controls.showTranslation')}</span>
            </button>

            <button
              onClick={handleReadAloud}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                isReading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 border border-gray-200 dark:border-gray-700 dark:hover:text-primary-300'
              }`}
            >
              {isReading
                ? <VolumeX className="w-4 h-4 shrink-0" />
                : <Volume2 className="w-4 h-4 shrink-0" />}
              <span>{isReading ? t('storyReader.controls.stop') : t('storyReader.controls.readAloud')}</span>
            </button>

            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showVocabulary
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 border border-gray-200 dark:border-gray-700 dark:hover:text-primary-300'
              }`}
            >
              <BookMarked className="w-4 h-4 shrink-0" />
              <span>{t('storyReader.controls.vocabulary')}</span>
            </button>

            <button
              onClick={() => {
                if (!showQuiz) {
                  loadQuizQuestions()
                }
                setShowQuiz(!showQuiz)
              }}
              disabled={loadingQuiz}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                showQuiz
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 border border-gray-200 dark:border-gray-700 dark:hover:text-primary-300'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{loadingQuiz ? t('storyReader.controls.loadingQuiz') : showQuiz ? t('storyReader.controls.hideQuiz') : t('storyReader.controls.takeQuiz')}</span>
            </button>

            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                isBookmarked
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-white dark:bg-surface-card hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-700 dark:text-gray-300 hover:text-rose-600 border border-gray-200 dark:border-gray-700 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 shrink-0 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? t('storyReader.controls.saved') : t('storyReader.controls.save')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Story Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 dark:bg-surface-card dark:border-gray-800">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600" />
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 text-gray-500 mb-6 dark:text-gray-400">
              <BookOpen className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                {t('storyReader.hint')}
              </p>
            </div>
            {renderStoryContent()}
          </div>
        </div>
      </motion.div>

      {/* Translation */}
      {renderTranslation()}

      {/* Quiz */}
      {renderQuiz()}

      {/* Vocabulary Sidebar */}
      {renderVocabularyList()}

      {/* Character Popup — using redesigned HanziWordPopup */}
      {selectedWord && wordPosition && (
        <HanziWordPopup
          word={selectedWord}
          position={wordPosition}
          onClose={() => setSelectedWord(null)}
          onOpenDetails={() => setShowWordDetails(true)}
        />
      )}

      {/* Full Word Details Modal */}
      {selectedWord && (
        <WordDetailsModal
          word={selectedWord}
          isOpen={showWordDetails}
          onClose={() => setShowWordDetails(false)}
        />
      )}

      {/* Delete confirmation modal (styled — replaces window.confirm) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
            >
              <div className="flex items-start gap-3 mb-5">
                <AlertTriangle className="w-6 h-6 text-error-500 shrink-0 mt-0.5" />
                <p className="text-gray-900 dark:text-gray-100 font-medium">{t('storyReader.deleteConfirm')}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  {t('storyReader.deleteCancel')}
                </button>
                <button
                  onClick={handleDeleteStory}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-error-600 text-white hover:bg-error-700 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {t('storyReader.deleteShort')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
