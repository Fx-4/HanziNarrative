import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pinyin } from 'pinyin-pro'
import { storiesApi, vocabularyApi } from '@/services/api'
import { Story } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import HanziWordPopup from '@/components/HanziWordPopup'
import WordDetailsModal from '@/components/WordDetailsModal'
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
  Trash2
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
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

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
  const [selectedWord, setSelectedWord] = useState<any | null>(null)
  const [wordPosition, setWordPosition] = useState<{ x: number; y: number } | null>(null)
  const [showWordDetails, setShowWordDetails] = useState(false)

  useEffect(() => {
    if (id) {
      loadStory(parseInt(id))
    }
  }, [id])

  const loadStory = async (storyId: number) => {
    setLoading(true)
    try {
      const storyData = await storiesApi.getById(storyId)
      setStory(storyData)
    } catch (error) {
      console.error('Failed to load story:', error)
      toast.error('Failed to load story')
    } finally {
      setLoading(false)
    }
  }

  const handleReadAloud = () => {
    if (!story) return

    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(story.content)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8

    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => {
      setIsReading(false)
      toast.error('Speech synthesis not available')
    }

    window.speechSynthesis.speak(utterance)
    setIsReading(true)
    toast.success('Reading story aloud...')
  }

  const handleDeleteStory = async () => {
    if (!story) return

    const confirmed = window.confirm('Are you sure you want to delete this story? This action cannot be undone.')
    if (!confirmed) return

    try {
      await storiesApi.delete(story.id)
      toast.success('Story deleted successfully')
      navigate('/stories')
    } catch (error: any) {
      console.error('Failed to delete story:', error)
      if (error.response?.status === 404) {
        toast.error('Story not found')
      } else if (error.response?.status === 401) {
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

  const handleCharacterClick = async (char: string, event: React.MouseEvent) => {
    // Skip if punctuation
    const isPunctuation = /[\s\n，。！？、；：""''（）《》【】…—]/.test(char)
    if (isPunctuation) return

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
  }

  // Parse AI-generated pinyin to map each character to correct pinyin
  const parsePinyinMapping = (content: string, contentPinyin: string | null | undefined): Map<number, string> => {
    const pinyinMap = new Map<number, string>()

    if (!contentPinyin) {
      // Fallback to pinyin-pro if no AI pinyin available
      return pinyinMap
    }

    // Remove newlines and preserve structure
    const normalizedContent = content.replace(/\n/g, ' ').trim()
    const normalizedPinyin = contentPinyin.replace(/\n/g, ' ').trim()

    // Split pinyin by spaces to get individual syllables
    const pinyinSyllables = normalizedPinyin.split(/\s+/).filter(s => s.length > 0)

    // Extract only Chinese characters (no punctuation)
    const chineseChars: string[] = []
    for (let i = 0; i < normalizedContent.length; i++) {
      const char = normalizedContent[i]
      // Skip punctuation and whitespace
      if (!/[，。！？、；：""''（）《》【】…—\s\n]/.test(char)) {
        chineseChars.push(char)
      }
    }

    // Debug logging (optional - remove in production)
    if (chineseChars.length !== pinyinSyllables.length) {
      console.warn(
        `Pinyin mismatch: ${chineseChars.length} characters but ${pinyinSyllables.length} pinyin syllables`,
        {
          characters: chineseChars.join(''),
          pinyin: pinyinSyllables.join(' ')
        }
      )
    }

    // Map each character to its pinyin
    let charIndex = 0
    let syllableIndex = 0

    for (let i = 0; i < normalizedContent.length; i++) {
      const char = normalizedContent[i]

      // Skip punctuation and whitespace - they don't have pinyin
      if (/[，。！？、；：""''（）《》【】…—\s\n]/.test(char)) {
        continue
      }

      // Assign pinyin syllable to this character
      if (syllableIndex < pinyinSyllables.length) {
        pinyinMap.set(charIndex, pinyinSyllables[syllableIndex])
        syllableIndex++
      }

      charIndex++
    }

    return pinyinMap
  }

  const renderCharacterWithPinyin = (char: string, index: number, pinyinMap: Map<number, string>) => {
    // Skip rendering pinyin for punctuation and whitespace
    const isPunctuation = /[\s\n，。！？、；：""''（）《》【】…—]/.test(char)

    if (isPunctuation) {
      return <span key={index} className="text-2xl">{char}</span>
    }

    // Get pinyin from AI-generated map or fallback to pinyin-pro
    let charPinyin = pinyinMap.get(index)
    if (!charPinyin) {
      // Fallback to pinyin-pro library (but it won't be context-aware for duoyinzi)
      charPinyin = pinyin(char, { toneType: 'symbol', type: 'array' })[0] || ''
    }

    return (
      <ruby key={index} className="inline-block mx-0.5">
        <span
          className="text-2xl font-chinese text-gray-900 dark:text-gray-100 hover:text-primary-600 cursor-pointer transition-colors hover:bg-primary-100 rounded px-1"
          onClick={(e) => handleCharacterClick(char, e)}
        >
          {char}
        </span>
        {showPinyin && charPinyin && (
          <rt className="text-xs text-primary-600 font-sans select-none">
            {charPinyin}
          </rt>
        )}
      </ruby>
    )
  }

  const renderStoryContent = () => {
    if (!story) return null

    const paragraphs = story.content.split('\n').filter(p => p.trim())

    // Parse AI-generated pinyin for context-aware mapping
    const pinyinMap = parsePinyinMapping(story.content, story.content_pinyin)

    // globalCharIndex tracks the non-punctuation character position across ALL paragraphs
    // This MUST match how parsePinyinMapping assigns keys (sequential non-punct index)
    let globalCharIndex = 0

    return (
      <div className="space-y-8">
        {paragraphs.map((paragraph, pIdx) => {
          // Render each character in this paragraph, using the global non-punct index
          const rendered = Array.from(paragraph).map((char, cIdx) => {
            const isPunctuation = /[\s\n，。！？、；：""''（）《》【】…—]/.test(char)
            if (isPunctuation) {
              return <span key={cIdx} className="text-2xl">{char}</span>
            }
            // Use globalCharIndex so later paragraphs don't reset to 0
            const currentIndex = globalCharIndex
            globalCharIndex++
            return renderCharacterWithPinyin(char, currentIndex, pinyinMap)
          })

          return (
            <motion.div
              key={pIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pIdx * 0.1 }}
              className="relative"
            >
              <div className="leading-[3rem]">{rendered}</div>
            </motion.div>
          )
        })}
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
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  English Translation
                </h3>
              </div>
              <div className="space-y-3">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </Card>
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
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold">Vocabulary List</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVocabulary(false)}
              >
                ✕
              </Button>
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
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      isExpanded
                        ? 'bg-primary-100 border-primary-500 shadow-lg'
                        : 'bg-gradient-to-r from-gray-50 to-primary-50 hover:from-primary-100 hover:to-purple-100 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                          {char}
                        </span>
                        <span className="text-lg text-primary-600 font-semibold">
                          {charPinyin}
                        </span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        #{idx + 1}
                      </Badge>
                    </div>

                    {!isExpanded ? (
                      <div className="text-xs text-gray-600 mt-2">
                        Click to see full definition
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-primary-300"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Character:</p>
                            <p className="text-2xl font-chinese font-bold">{char}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Pinyin:</p>
                            <p className="text-base text-primary-700">{charPinyin}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Meaning:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {/* This would come from API in real app */}
                              Click on vocabulary page to see detailed meaning and usage examples.
                            </p>
                          </div>
                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/vocabulary?search=${char}`)
                                toast.success('Opening vocabulary page...')
                              }}
                              className="w-full"
                            >
                              View in Vocabulary
                            </Button>
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
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-purple-900">
              Comprehension Quiz
            </h3>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="bg-white rounded-lg p-5 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
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
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
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
            <Button
              onClick={handleSubmitQuiz}
              className="mt-6 w-full"
              size="lg"
            >
              Submit Quiz
            </Button>
          )}

          {showResults && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  setQuizAnswers([])
                  setShowResults(false)
                }}
                variant="secondary"
                size="lg"
              >
                Retry Quiz
              </Button>
            </div>
          )}
        </Card>
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
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300 text-lg">Story not found</p>
        <Button onClick={() => navigate('/stories')} className="mt-4">
          Back to Stories
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/stories')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>

          <Button
            variant="ghost"
            onClick={handleDeleteStory}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Story
          </Button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {story.title}
            </h1>
            {story.title_english && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-3 italic">
                {story.title_english}
              </p>
            )}
            <Badge variant="default">HSK {story.hsk_level}</Badge>
          </div>
        </div>

        {/* Interactive Controls */}
        <Card className="bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={showPinyin ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowPinyin(!showPinyin)}
            >
              <Type className="w-4 h-4 mr-2" />
              {showPinyin ? 'Hide' : 'Show'} Pinyin
            </Button>

            <Button
              variant={showTranslation ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              {showTranslation ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showTranslation ? 'Hide' : 'Show'} Translation
            </Button>

            <Button
              variant={isReading ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleReadAloud}
            >
              {isReading ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
              {isReading ? 'Stop' : 'Read Aloud'}
            </Button>

            <Button
              variant={showVocabulary ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowVocabulary(!showVocabulary)}
            >
              <BookMarked className="w-4 h-4 mr-2" />
              Vocabulary
            </Button>

            <Button
              variant={showQuiz ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                if (!showQuiz) {
                  loadQuizQuestions()
                }
                setShowQuiz(!showQuiz)
              }}
              disabled={loadingQuiz}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {loadingQuiz ? 'Loading Quiz...' : showQuiz ? 'Hide Quiz' : 'Take Quiz'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Story Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6">
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <BookOpen className="w-5 h-5" />
            <p className="text-sm">
              Click any character for details • Use controls above for interactive features
            </p>
          </div>
          {renderStoryContent()}
        </Card>
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
