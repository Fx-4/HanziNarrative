import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { storiesApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Sparkles,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Users,
  AlignLeft,
  Eye,
  Zap,
  Crown,
  RefreshCw
} from 'lucide-react'

interface GeneratedStory {
  title: string
  title_english?: string
  content: string
  pinyin?: string
  hsk_level: number
  vocabulary?: Array<{ word: string; pinyin: string; meaning: string }>
  grammar_points?: string[]
}

interface GenerateResponse {
  story: GeneratedStory
  story_id: number
  mode: string
  usage_stats: LimitStats
}

interface LimitStats {
  used_today: number
  limit_daily: number
  used_this_hour: number
  limit_hourly: number
}

interface UsageStats {
  story_generation?: LimitStats
  story_generation_simple?: LimitStats
}

type GenerationMode = 'quick' | 'advanced'

export default function StoryGenerator() {
  const [hskLevel, setHskLevel] = useState(1)
  const [topic, setTopic] = useState('')
  const [characterNames, setCharacterNames] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short')
  const [mode, setMode] = useState<GenerationMode>('quick')
  const [loading, setLoading] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [generatedStoryId, setGeneratedStoryId] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentStats = mode === 'advanced'
    ? usageStats?.story_generation
    : usageStats?.story_generation_simple

  const isLimitReached = currentStats
    ? (currentStats.used_today >= currentStats.limit_daily ||
       currentStats.used_this_hour >= currentStats.limit_hourly)
    : false

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
        length,
        mode
      })

      setGeneratedStory(response.story)
      setGeneratedStoryId(response.story_id)
      // Update the correct stats key from the response
      setUsageStats(prev => ({
        ...prev,
        [mode === 'advanced' ? 'story_generation' : 'story_generation_simple']: response.usage_stats
      }))
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(`Rate limit reached for ${mode === 'advanced' ? 'Advanced' : 'Quick'} mode. Try the other mode or wait.`)
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
    } catch (err: any) {
      console.error('Failed to load usage stats:', err)
      setUsageStats({
        story_generation: { used_today: 0, limit_daily: 5, used_this_hour: 0, limit_hourly: 2 },
        story_generation_simple: { used_today: 0, limit_daily: 10, used_this_hour: 0, limit_hourly: 4 }
      })
    }
  }

  useEffect(() => {
    loadUsageStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Quick Mode */}
          <button
            onClick={() => setMode('quick')}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer text-left ${
              mode === 'quick'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-5 h-5 ${mode === 'quick' ? 'text-emerald-600' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className={`font-bold text-sm sm:text-base ${mode === 'quick' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Quick
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Fast generation using free AI. Great for practice.
            </p>
            {usageStats?.story_generation_simple && (
              <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {usageStats.story_generation_simple.used_today}/{usageStats.story_generation_simple.limit_daily} today
              </div>
            )}
            {mode === 'quick' && (
              <motion.div layoutId="mode-indicator" className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Advanced Mode */}
          <button
            onClick={() => setMode('advanced')}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer text-left ${
              mode === 'advanced'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className={`w-5 h-5 ${mode === 'advanced' ? 'text-purple-600' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className={`font-bold text-sm sm:text-base ${mode === 'advanced' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Advanced
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Premium Claude AI. Richer stories & vocabulary.
            </p>
            {usageStats?.story_generation && (
              <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {usageStats.story_generation.used_today}/{usageStats.story_generation.limit_daily} today
              </div>
            )}
            {mode === 'advanced' && (
              <motion.div layoutId="mode-indicator" className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-500" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Usage Stats Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`rounded-2xl shadow-sm border p-4 ${
          mode === 'advanced'
            ? 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30'
            : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'advanced' ? (
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {mode === 'advanced' ? 'Advanced' : 'Quick'} Usage
              </span>
            </div>
            {currentStats ? (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Daily: </span>
                  <span className={`font-bold ${
                    currentStats.used_today >= currentStats.limit_daily
                      ? 'text-red-600'
                      : mode === 'advanced' ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {currentStats.used_today}/{currentStats.limit_daily}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Hourly: </span>
                  <span className={`font-bold ${
                    currentStats.used_this_hour >= currentStats.limit_hourly
                      ? 'text-red-600'
                      : mode === 'advanced' ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {currentStats.used_this_hour}/{currentStats.limit_hourly}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Loading...</span>
            )}
            <button
              onClick={loadUsageStats}
              className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
              title="Refresh stats"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          {isLimitReached && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
              Limit reached for this mode.{' '}
              {mode === 'advanced'
                ? 'Try Quick mode for more generations!'
                : 'Please wait for the limit to reset.'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Generator Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Sparkles className={`w-5 h-5 ${mode === 'advanced' ? 'text-purple-600' : 'text-emerald-600'}`} />
            Story Settings
          </h3>

          <div className="space-y-6">
            {/* HSK Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <GraduationCap className="w-4 h-4" />
                HSK Level
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    onClick={() => setHskLevel(level)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      hskLevel === level
                        ? mode === 'advanced'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    HSK {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="w-4 h-4" />
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., daily life, school, travel, food..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Character Names */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4" />
                Character Names (Optional)
              </label>
              <input
                type="text"
                value={characterNames}
                onChange={(e) => setCharacterNames(e.target.value)}
                placeholder="e.g., 小明, 小红, 王老师 (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple names with commas
              </p>
            </div>

            {/* Length */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <AlignLeft className="w-4 h-4" />
                Story Length
              </label>
              <div className="flex gap-2">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={`capitalize rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      length === len
                        ? mode === 'advanced'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || isLimitReached}
              className={`w-full flex items-center justify-center rounded-xl px-6 py-3 font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                mode === 'advanced'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'advanced' ? 'Crafting Premium Story...' : 'Generating Story...'}
                </>
              ) : (
                <>
                  {mode === 'advanced' ? (
                    <Crown className="w-5 h-5 mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  {mode === 'advanced' ? 'Generate Advanced Story' : 'Quick Generate'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="rounded-2xl shadow-sm border border-red-200 dark:border-red-800 p-6 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generated Story */}
      {generatedStory && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`rounded-2xl shadow-sm border p-6 ${
            mode === 'advanced'
              ? 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30'
              : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {generatedStory.title}
                </h2>
                {generatedStory.title_english && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 italic">
                    {generatedStory.title_english}
                  </p>
                )}
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Story saved successfully! You can now find it in Browse Stories.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  mode === 'advanced'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}>
                  HSK {generatedStory.hsk_level}
                </span>
                {generatedStoryId && (
                  <Link to={`/stories/${generatedStoryId}`}>
                    <button className={`flex items-center text-white rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      mode === 'advanced'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Story Content */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Story</h3>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg mb-4 whitespace-pre-wrap">
                {generatedStory.content}
              </p>
              {generatedStory.pinyin && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Pinyin</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {generatedStory.pinyin}
                  </p>
                </div>
              )}
            </div>

            {/* Vocabulary */}
            {generatedStory.vocabulary && generatedStory.vocabulary.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Vocabulary</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatedStory.vocabulary.map((vocab, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className={`text-xl font-medium ${mode === 'advanced' ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {vocab.word}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{vocab.pinyin}</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">{vocab.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Points */}
            {generatedStory.grammar_points && generatedStory.grammar_points.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Grammar Points</h3>
                <ul className="space-y-2">
                  {generatedStory.grammar_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`mt-1 ${mode === 'advanced' ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        •
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
