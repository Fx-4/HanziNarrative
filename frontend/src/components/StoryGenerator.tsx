import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { storiesApi } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Sparkles, AlertCircle, BookOpen, GraduationCap, Users, AlignLeft, Eye } from 'lucide-react'

interface GeneratedStory {
  title: string
  content: string
  pinyin?: string
  hsk_level: number
  vocabulary?: Array<{ word: string; pinyin: string; meaning: string }>
  grammar_points?: string[]
}

interface GenerateResponse {
  story: GeneratedStory
  story_id: number
  usage_stats: UsageStats
}

interface UsageStats {
  story_generation?: {
    used_today: number
    limit_daily: number
    used_this_hour: number
    limit_hourly: number
  }
}

export default function StoryGenerator() {
  const [hskLevel, setHskLevel] = useState(1)
  const [topic, setTopic] = useState('')
  const [characterNames, setCharacterNames] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short')
  const [loading, setLoading] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [generatedStoryId, setGeneratedStoryId] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setGeneratedStory(null)
    setGeneratedStoryId(null)

    try {
      const characterNamesArray = characterNames
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      const response: GenerateResponse = await storiesApi.generateStory({
        hsk_level: hskLevel,
        topic: topic || undefined,
        character_names: characterNamesArray.length > 0 ? characterNamesArray : undefined,
        length
      })

      setGeneratedStory(response.story)
      setGeneratedStoryId(response.story_id)
      setUsageStats(response.usage_stats)
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.')
      } else {
        setError(err.response?.data?.detail || 'Failed to generate story')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async () => {
    try {
      const stats = await storiesApi.getAIUsageStats()
      setUsageStats(stats)
    } catch (err) {
      console.error('Failed to load usage stats:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary-50 to-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">AI Story Generator</h3>
              <p className="text-sm text-gray-600 mb-3">
                Generate personalized Chinese stories tailored to your HSK level using AI
              </p>
              {usageStats?.story_generation && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Today: </span>
                    <span className="font-semibold text-primary-600">
                      {usageStats.story_generation.used_today}/{usageStats.story_generation.limit_daily}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">This Hour: </span>
                    <span className="font-semibold text-primary-600">
                      {usageStats.story_generation.used_this_hour}/{usageStats.story_generation.limit_hourly}
                    </span>
                  </div>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={loadUsageStats}
                className="mt-3"
              >
                Refresh Usage Stats
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Generator Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Story Settings
          </h3>

          <div className="space-y-6">
            {/* HSK Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <GraduationCap className="w-4 h-4" />
                HSK Level
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <Button
                    key={level}
                    variant={hskLevel === level ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setHskLevel(level)}
                  >
                    HSK {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4" />
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., daily life, school, travel, food..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Character Names */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Character Names (Optional)
              </label>
              <input
                type="text"
                value={characterNames}
                onChange={(e) => setCharacterNames(e.target.value)}
                placeholder="e.g., , �=, N (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple names with commas
              </p>
            </div>

            {/* Length */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <AlignLeft className="w-4 h-4" />
                Story Length
              </label>
              <div className="flex gap-2">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <Button
                    key={len}
                    variant={length === len ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setLength(len)}
                    className="capitalize"
                  >
                    {len}
                  </Button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating Story...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Generated Story */}
      {generatedStory && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-purple-50">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {generatedStory.title}
                </h2>
                <p className="text-sm text-green-700 font-medium">
                  Story saved successfully! You can now find it in Browse Stories.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">HSK {generatedStory.hsk_level}</Badge>
                {generatedStoryId && (
                  <Link to={`/stories/${generatedStoryId}`}>
                    <Button variant="primary" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Story
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Story Content */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Story</h3>
              <p className="text-gray-800 leading-relaxed text-lg mb-4 whitespace-pre-wrap">
                {generatedStory.content}
              </p>
              {generatedStory.pinyin && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">Pinyin</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {generatedStory.pinyin}
                  </p>
                </div>
              )}
            </div>

            {/* Vocabulary */}
            {generatedStory.vocabulary && generatedStory.vocabulary.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Vocabulary</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatedStory.vocabulary.map((vocab, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl font-medium text-primary-600">{vocab.word}</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">{vocab.pinyin}</div>
                        <div className="text-sm text-gray-800">{vocab.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Points */}
            {generatedStory.grammar_points && generatedStory.grammar_points.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Grammar Points</h3>
                <ul className="space-y-2">
                  {generatedStory.grammar_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-600 mt-1">"</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
