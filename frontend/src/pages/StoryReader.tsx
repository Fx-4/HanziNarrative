import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pinyin } from 'pinyin-pro'
import { storiesApi } from '@/services/api'
import { Story } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
  Type
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

  // Mock comprehension questions (in real app, these would come from backend)
  const [questions] = useState<ComprehensionQuestion[]>([
    {
      question: "What is the main topic of this story?",
      options: [
        "Daily life and activities",
        "Historical events",
        "Scientific discoveries",
        "Sports and games"
      ],
      correctAnswer: 0,
      explanation: "The story describes everyday activities and experiences."
    }
  ])

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

  const renderCharacterWithPinyin = (char: string, index: number) => {
    // Skip rendering pinyin for punctuation and whitespace
    const isPunctuation = /[\s\n，。！？、；：""''（）《》【】…—]/.test(char)

    if (isPunctuation) {
      return <span key={index} className="text-2xl">{char}</span>
    }

    // Get pinyin for the character
    const charPinyin = pinyin(char, { toneType: 'symbol', type: 'array' })[0] || ''

    return (
      <ruby key={index} className="inline-block mx-0.5">
        <span className="text-2xl font-chinese text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
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

    return (
      <div className="space-y-8">
        {paragraphs.map((paragraph, pIdx) => (
          <motion.div
            key={pIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pIdx * 0.1 }}
            className="relative"
          >
            <div className="leading-[3rem]">
              {Array.from(paragraph).map((char, cIdx) =>
                renderCharacterWithPinyin(char, cIdx)
              )}
            </div>
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
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-blue-600" />
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
                        <span className="text-4xl font-bold text-gray-900">
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
                      <div className="text-xs text-gray-500 mt-2">
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
                            <p className="text-sm text-gray-700">
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
                                navigate(`/vocabulary`)
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
        <p className="text-gray-600 text-lg">Story not found</p>
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
        <Button
          variant="ghost"
          onClick={() => navigate('/stories')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {story.title}
            </h1>
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
              onClick={() => setShowQuiz(!showQuiz)}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Take Quiz
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
    </div>
  )
}
