import React, { useState, useEffect, useRef, useCallback } from 'react'
import { parse as parsePinyin, splitPinyinTokens } from '@/components/PinyinText'
import axios from 'axios'
import { getVoiceName } from '@/utils/voicePreference'
import { API_URL } from '@/lib/env'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pinyin } from 'pinyin-pro'
import { storiesApi, vocabularyApi } from '@/services/api'
import { Story, HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
  Heart
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ComprehensionQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function StoryReader() {
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
  const [showPinyin, setShowPinyin] = useState(true)
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

  // Refs for story audio playback (Google TTS, sequential)
  const isReadingRef = useRef(false)
  const storyAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (id) {
      loadStory(parseInt(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
      console.error('Failed to load story:', error)
      toast.error('Failed to load story')
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
        toast.success('Bookmark removed')
      } else {
        await storiesApi.bookmarkStory(story.id)
        setIsBookmarked(true)
        toast.success('Story bookmarked!')
      }
    } catch {
      toast.error('Failed to update bookmark')
    } finally {
      setBookmarkLoading(false)
    }
  }

  // Stop any ongoing story playback
  const stopReading = useCallback(() => {
    isReadingRef.current = false
    window.speechSynthesis.cancel()
    if (storyAudioRef.current) {
      storyAudioRef.current.pause()
      storyAudioRef.current = null
    }
    setIsReading(false)
  }, [])

  // Play a single audio blob URL and wait until done
  const playAudioUrl = (url: string): Promise<void> =>
    new Promise((resolve) => {
      const audio = new Audio(url)
      storyAudioRef.current = audio
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play().catch(() => resolve())
    })

  // Browser TTS fallback for a single chunk
  const speakFallback = (text: string): Promise<void> =>
    new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.8
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })

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
    toast.success('Reading story aloud...')

    const token = localStorage.getItem('access_token')

    for (const chunk of chunks) {
      if (!isReadingRef.current) break

      if (token) {
        try {
          const response = await axios.post(
            `${API_URL}/tts/synthesize`,
            { text: chunk, language: 'cmn-CN', voice_name: getVoiceName(), speaking_rate: 0.85 },
            { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
          )
          if (!isReadingRef.current) break
          const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }))
          await playAudioUrl(url)
          URL.revokeObjectURL(url)
        } catch {
          // Fallback to browser TTS for this chunk
          if (isReadingRef.current) await speakFallback(chunk)
        }
      } else {
        await speakFallback(chunk)
      }
    }

    isReadingRef.current = false
    setIsReading(false)
  }

  const handleDeleteStory = async () => {
    if (!story) return

    const confirmed = window.confirm('Are you sure you want to delete this story? This action cannot be undone.')
    if (!confirmed) return

    try {
      await storiesApi.delete(story.id)
      toast.success('Story deleted successfully')
      navigate('/stories')
    } catch (error) {
      const err = error as { response?: { status?: number } }
      console.error('Failed to delete story:', error)
      if (err.response?.status === 404) {
        toast.error('Story not found')
      } else if (err.response?.status === 401) {
        toast.error('You must be logged in to delete stories')
      } else {
        toast.error('Failed to delete story. You can only delete stories you created.')
      }
    }
  }

  const loadQuizQuestions = async () => {
    if (!story || questions.length > 0) return

    setLoadingQuiz(true)
    try {
      const quizData = await storiesApi.getStoryQuiz(story.id)
      setQuestions(quizData.questions)
      toast.success('Quiz loaded successfully!')
    } catch (error) {
      console.error('Failed to load quiz:', error)
      toast.error('Failed to load quiz questions')
      // Set fallback generic question
      setQuestions([
        {
          question: "What is the main topic of this story?",
          options: [
            "Daily life and activities",
            "Historical events",
            "Scientific discoveries",
            "Sports and games"
          ],
          correctAnswer: 0,
          explanation: "Unable to generate story-specific questions. Please try again."
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
      toast.error('Please answer all questions first')
      return
    }
    setShowResults(true)

    const correctCount = questions.filter((q, i) => quizAnswers[i] === q.correctAnswer).length
    const score = Math.round((correctCount / questions.length) * 100)

    if (score >= 80) {
      toast.success(`Great job! You scored ${score}%`)
    } else if (score >= 60) {
      toast('Good effort! Score: ' + score + '%', { icon: '👍' })
    } else {
      toast('Keep practicing! Score: ' + score + '%', { icon: '📚' })
    }
  }

  // Stable fallback — useCallback so PinyinText memo isn't defeated on re-renders
  const getPinyinFallback = useCallback(
    (char: string) => pinyin(char, { toneType: 'symbol', type: 'array' })[0] || '',
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
        toast('Word not found in vocabulary', { icon: '📚' })
      }
    } catch (error) {
      console.error('Failed to lookup word:', error)
    }
  }, [])

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
                       "English translation not available for this story."

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
            <div className="bg-blue-50 border border-blue-200 rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-lg font-semibold text-blue-900">
                  English Translation
                </h3>
              </div>
              <div className="space-y-3">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed">
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
            className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl overflow-y-auto z-50 p-4 sm:p-6"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold">Vocabulary List</h3>
              </div>
              <button
                onClick={() => setShowVocabulary(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl p-1.5 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              {uniqueChars.length} unique characters in this story
            </div>

            <div className="space-y-3">
              {uniqueChars.map((char, idx) => {
                const charPinyin = pinyin(char, { toneType: 'symbol' })
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
                        ? 'bg-indigo-100 border-indigo-500 shadow-lg'
                        : 'bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-100 hover:to-purple-100 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900">
                          {char}
                        </span>
                        <span className="text-lg text-indigo-600 font-semibold">
                          {charPinyin}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        #{idx + 1}
                      </span>
                    </div>

                    {!isExpanded ? (
                      <div className="text-xs text-gray-600 mt-2">
                        Click to see full definition
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-indigo-300"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Character:</p>
                            <p className="text-2xl font-chinese font-bold">{char}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Pinyin:</p>
                            <p className="text-base text-indigo-700">{charPinyin}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Meaning:</p>
                            <p className="text-sm text-gray-700">
                              {/* This would come from API in real app */}
                              Click on vocabulary page to see detailed meaning and usage examples.
                            </p>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/vocabulary?search=${char}`)
                                toast.success('Opening vocabulary page...')
                              }}
                              className="w-full bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-2xl px-4 py-2 font-semibold cursor-pointer transition-colors text-sm"
                            >
                              View in Vocabulary
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
        <div className="bg-purple-50 border border-purple-200 rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-purple-600 shrink-0" />
            <h3 className="text-xl font-bold text-purple-900">
              Comprehension Quiz
            </h3>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
                <p className="font-semibold text-gray-900 mb-4">
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
                            ? 'border-green-500 bg-green-50'
                            : showAnswer && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              showAnswer && isCorrect
                                ? 'border-green-500 bg-green-500'
                                : showAnswer && isSelected && !isCorrect
                                ? 'border-red-500 bg-red-500'
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
                    className="mt-4 p-3 bg-blue-50 rounded-xl"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">
                          Explanation:
                        </p>
                        <p className="text-blue-800 text-sm">
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
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors"
            >
              Submit Quiz
            </button>
          )}

          {showResults && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setQuizAnswers([])
                  setShowResults(false)
                }}
                className="bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors"
              >
                Retry Quiz
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-600 text-lg">Story not found</p>
        <button
          onClick={() => navigate('/stories')}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors"
        >
          Back to Stories
        </button>
      </div>
    )
  }

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
            className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-2xl hover:bg-indigo-50 cursor-pointer transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Back to Stories</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            onClick={handleDeleteStory}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-2 rounded-2xl cursor-pointer transition-colors text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Delete Story</span>
            <span className="sm:hidden">Delete</span>
          </button>
        </div>

        {/* Title block */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {story.title}
          </h1>
          {story.title_english && (
            <p className="text-base sm:text-xl text-gray-600 mb-3 italic">
              {story.title_english}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
              HSK {story.hsk_level}
            </span>
            {(story.category ?? 'curated') === 'ai_generated' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                ✨ AI Generated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                📚 Curated
              </span>
            )}
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showPinyin
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200'
              }`}
            >
              <Type className="w-4 h-4 shrink-0" />
              <span>{showPinyin ? 'Hide' : 'Show'} Pinyin</span>
            </button>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showTranslation
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200'
              }`}
            >
              {showTranslation
                ? <EyeOff className="w-4 h-4 shrink-0" />
                : <Eye className="w-4 h-4 shrink-0" />}
              <span>{showTranslation ? 'Hide' : 'Show'} Translation</span>
            </button>

            <button
              onClick={handleReadAloud}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                isReading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200'
              }`}
            >
              {isReading
                ? <VolumeX className="w-4 h-4 shrink-0" />
                : <Volume2 className="w-4 h-4 shrink-0" />}
              <span>{isReading ? 'Stop' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm ${
                showVocabulary
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200'
              }`}
            >
              <BookMarked className="w-4 h-4 shrink-0" />
              <span>Vocabulary</span>
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
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{loadingQuiz ? 'Loading Quiz...' : showQuiz ? 'Hide Quiz' : 'Take Quiz'}</span>
            </button>

            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`flex items-center gap-1.5 rounded-2xl px-3 sm:px-4 py-2 font-semibold cursor-pointer transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                isBookmarked
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 border border-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 shrink-0 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <BookOpen className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                Click any character for details &bull; Use controls above for interactive features
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
    </div>
  )
}
