import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { storiesApi } from '@/services/api'
import { apiLogger } from '@/utils/debugLogger'
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
  SlidersHorizontal,
  RefreshCw,
  Drama,
  Palette,
  MapPin,
  MessageSquare,
  Landmark,
  PenTool,
  BookText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────
interface GeneratedStory {
  title: string
  title_english?: string
  content: string
  pinyin?: string
  hsk_level: number
  vocabulary?: Array<{ word: string; pinyin: string; meaning: string }>
  grammar_points?: string[]
}

interface LimitStats {
  used_today: number
  limit_daily: number
  used_this_hour: number
  limit_hourly: number
}

type GenerationMode = 'quick' | 'advanced'

// ─── Option presets ──────────────────────────────────────────────────
const GENRE_OPTIONS = [
  { value: 'adventure', label: '🗺️ Adventure', labelZh: '冒险' },
  { value: 'romance', label: '💕 Romance', labelZh: '浪漫' },
  { value: 'mystery', label: '🔍 Mystery', labelZh: '悬疑' },
  { value: 'comedy', label: '😄 Comedy', labelZh: '喜剧' },
  { value: 'slice-of-life', label: '🌿 Slice of Life', labelZh: '日常' },
  { value: 'fable', label: '📖 Fable', labelZh: '寓言' },
  { value: 'sci-fi', label: '🚀 Sci-Fi', labelZh: '科幻' },
  { value: 'historical', label: '🏯 Historical', labelZh: '历史' },
]

const TONE_OPTIONS = [
  { value: 'humorous', label: '😂 Humorous' },
  { value: 'heartwarming', label: '🥰 Heartwarming' },
  { value: 'suspenseful', label: '😰 Suspenseful' },
  { value: 'inspirational', label: '✨ Inspirational' },
  { value: 'lighthearted', label: '🌈 Lighthearted' },
  { value: 'serious', label: '🎭 Serious' },
]

const SETTING_OPTIONS = [
  { value: 'modern city', label: '🏙️ Modern City' },
  { value: 'ancient China', label: '🏯 Ancient China' },
  { value: 'countryside', label: '🌾 Countryside' },
  { value: 'school', label: '🏫 School' },
  { value: 'market', label: '🏪 Market' },
  { value: 'train journey', label: '🚄 Train Journey' },
  { value: 'restaurant', label: '🍜 Restaurant' },
  { value: 'park', label: '🌳 Park' },
]

const CULTURAL_THEMES = [
  { value: 'Spring Festival', label: '🧧 Spring Festival' },
  { value: 'Mid-Autumn Festival', label: '🥮 Mid-Autumn' },
  { value: 'Dragon Boat Festival', label: '🐉 Dragon Boat' },
  { value: 'Tea Culture', label: '🍵 Tea Culture' },
  { value: 'Calligraphy', label: '✍️ Calligraphy' },
  { value: 'Chinese Cuisine', label: '🥢 Cuisine' },
  { value: 'Family Values', label: '👨‍👩‍👧 Family Values' },
  { value: 'Martial Arts', label: '🥋 Martial Arts' },
]

const GRAMMAR_PRESETS: Record<number, string[]> = {
  1: ['是...的', '在 + place', '了 (completed action)', '不/没', '的 (possession)'],
  2: ['比 (comparison)', '把 (disposal)', '着 (ongoing)', '过 (experience)', '要...了 (about to)'],
  3: ['被 (passive)', '越来越', '不但...而且', '虽然...但是', '如果...就'],
  4: ['不仅...还', '无论...都', '即使...也', '恐怕', '竟然'],
  5: ['倒是', '何况', '以免', '与其...不如', '以...为主'],
  6: ['何尝', '不免', '未免', '不妨', '固然...但'],
}

// ─── Chip selector component ────────────────────────────────────────
function ChipSelector({
  options,
  value,
  onChange,
  multi = false,
  accentColor = 'indigo',
}: {
  options: { value: string; label: string }[]
  value: string | string[]
  onChange: (val: string | string[]) => void
  multi?: boolean
  accentColor?: string
}) {
  const isSelected = (v: string) =>
    multi ? (value as string[]).includes(v) : value === v

  const toggle = (v: string) => {
    if (multi) {
      const arr = value as string[]
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])
    } else {
      onChange(value === v ? '' : v)
    }
  }

  const activeClasses: Record<string, string> = {
    indigo: 'bg-indigo-600 text-white shadow-sm',
    purple: 'bg-purple-600 text-white shadow-sm',
    emerald: 'bg-emerald-600 text-white shadow-sm',
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
            isSelected(opt.value)
              ? activeClasses[accentColor] || activeClasses.indigo
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────
export default function StoryGenerator() {
  // Shared fields (both modes)
  const [hskLevel, setHskLevel] = useState(1)
  const [topic, setTopic] = useState('')
  const [characterNames, setCharacterNames] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short')
  const [mode, setMode] = useState<GenerationMode>('quick')

  // Advanced-only fields
  const [genre, setGenre] = useState('')
  const [tone, setTone] = useState('')
  const [setting, setSetting] = useState('')
  const [narrativePerspective, setNarrativePerspective] = useState('')
  const [includeDialogue, setIncludeDialogue] = useState<boolean | null>(null)
  const [culturalTheme, setCulturalTheme] = useState('')
  const [targetGrammar, setTargetGrammar] = useState<string[]>([])
  const [targetVocabulary, setTargetVocabulary] = useState('')
  const [showGrammar, setShowGrammar] = useState(false)

  // Generation state
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [generatedStoryId, setGeneratedStoryId] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<LimitStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isLimitReached = usageStats
    ? usageStats.used_today >= usageStats.limit_daily ||
      usageStats.used_this_hour >= usageStats.limit_hourly
    : false

  const isAdvanced = mode === 'advanced'

  const handleGenerate = async () => {
    setLoading(true)
    setLoadingMessage('Connecting...')
    setError(null)
    setGeneratedStory(null)
    setGeneratedStoryId(null)

    try {
      const characterNamesArray = characterNames
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      const vocabArray = targetVocabulary
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)

      const request: Record<string, any> = {
        hsk_level: hskLevel,
        topic: topic || undefined,
        character_names: characterNamesArray.length > 0 ? characterNamesArray : undefined,
        length,
        mode,
      }

      if (isAdvanced) {
        if (genre) request.genre = genre
        if (tone) request.tone = tone
        if (setting) request.setting = setting
        if (narrativePerspective) request.narrative_perspective = narrativePerspective
        if (includeDialogue !== null) request.include_dialogue = includeDialogue
        if (culturalTheme) request.cultural_theme = culturalTheme
        if (targetGrammar.length > 0) request.target_grammar = targetGrammar
        if (vocabArray.length > 0) request.target_vocabulary = vocabArray
      }

      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
      const token = localStorage.getItem('access_token')

      apiLogger.debug('SSE connecting', { url: `${apiUrl}/stories/generate-stream` })

      const res = await fetch(`${apiUrl}/stories/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
      })

      apiLogger.debug('SSE response status', { status: res.status, ok: res.ok })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        console.error('[SSE] Error response:', res.status, errData)
        throw new Error(errData?.detail || `Server error ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response body')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6))

          if (event.type === 'progress') {
            setLoadingMessage(event.message)
          } else if (event.type === 'done') {
            const raw = event.story as any
            const normalized: GeneratedStory = {
              ...raw,
              pinyin: raw.pinyin ?? raw.content_pinyin,
              hsk_level: raw.hsk_level ?? raw.difficulty_level ?? hskLevel,
              vocabulary: raw.vocabulary ?? (raw.key_vocabulary?.map((v: any) => ({
                word: v.word ?? v.simplified,
                pinyin: v.pinyin,
                meaning: v.meaning ?? v.english,
              }))),
            }
            setGeneratedStory(normalized)
            setGeneratedStoryId(event.story_id)
            if (event.usage_stats) setUsageStats(event.usage_stats)
          } else if (event.type === 'error') {
            setError(event.message || 'Failed to generate story')
          }
        }
      }
    } catch (err: any) {
      console.error('[SSE] Generation error:', err)
      setError(err.message || 'Failed to generate story')
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }

  const loadUsageStats = async () => {
    try {
      const stats = await storiesApi.getAIUsageStats()
      setUsageStats(stats.story_generation ?? null)
    } catch {
      setUsageStats({ used_today: 0, limit_daily: 5, used_this_hour: 0, limit_hourly: 2 })
    }
  }

  useEffect(() => {
    loadUsageStats()
  }, [])

  return (
    <div className="space-y-5">
      {/* ─── Mode Selector ─────────────────────────────────── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 gap-3">
          {/* Quick */}
          <button
            onClick={() => setMode('quick')}
            className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer text-left ${
              !isAdvanced
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className={`w-5 h-5 ${!isAdvanced ? 'text-emerald-600' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className={`font-bold text-sm ${!isAdvanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Quick
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Pick level & topic, generate instantly.
            </p>
            {!isAdvanced && (
              <motion.div layoutId="mode-dot" className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Advanced */}
          <button
            onClick={() => setMode('advanced')}
            className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer text-left ${
              isAdvanced
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <SlidersHorizontal className={`w-5 h-5 ${isAdvanced ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className={`font-bold text-sm ${isAdvanced ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Advanced
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Genre, tone, setting, grammar & more.
            </p>
            {isAdvanced && (
              <motion.div layoutId="mode-dot" className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-indigo-500" />
            )}
          </button>
        </div>
      </motion.div>

      {/* ─── Usage Stats ───────────────────────────────────── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className={`rounded-2xl shadow-sm border p-3.5 ${
          isAdvanced
            ? 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30'
            : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Story Generation
              </span>
            </div>
            {usageStats ? (
              <div className="flex gap-3 text-sm">
                <div className="text-center">
                  <div className={`font-bold text-base leading-none ${
                    usageStats.used_today >= usageStats.limit_daily ? 'text-red-600' : isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {usageStats.limit_daily - usageStats.used_today}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">left today</div>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                <div className="text-center">
                  <div className={`font-bold text-base leading-none ${
                    usageStats.used_this_hour >= usageStats.limit_hourly ? 'text-red-600' : isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {usageStats.limit_hourly - usageStats.used_this_hour}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">left/hour</div>
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
              Rate limit reached. Please wait for the limit to reset.
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Generator Form ────────────────────────────────── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Sparkles className={`w-5 h-5 ${isAdvanced ? 'text-indigo-600' : 'text-emerald-600'}`} />
            {isAdvanced ? 'Advanced Story Settings' : 'Story Settings'}
          </h3>

          <div className="space-y-5">
            {/* HSK Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <GraduationCap className="w-4 h-4" />
                HSK Level
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <button
                    key={level}
                    onClick={() => setHskLevel(level)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      hskLevel === level
                        ? isAdvanced
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., daily life, school, travel, food..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Story Length */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlignLeft className="w-4 h-4" />
                Story Length
              </label>
              <div className="flex gap-2">
                {(['short', 'medium', 'long'] as const).map(len => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={`capitalize rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      length === len
                        ? isAdvanced
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Advanced Options (animated reveal) ──────── */}
            <AnimatePresence>
              {isAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Customization Options
                    </p>

                    {/* Genre */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Drama className="w-4 h-4" />
                        Genre
                      </label>
                      <ChipSelector
                        options={GENRE_OPTIONS.map(g => ({ value: g.value, label: g.label }))}
                        value={genre}
                        onChange={v => setGenre(v as string)}
                        accentColor="indigo"
                      />
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Palette className="w-4 h-4" />
                        Tone / Mood
                      </label>
                      <ChipSelector
                        options={TONE_OPTIONS}
                        value={tone}
                        onChange={v => setTone(v as string)}
                        accentColor="indigo"
                      />
                    </div>

                    {/* Setting */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4" />
                        Setting / Location
                      </label>
                      <ChipSelector
                        options={SETTING_OPTIONS}
                        value={setting}
                        onChange={v => setSetting(v as string)}
                        accentColor="indigo"
                      />
                    </div>

                    {/* Cultural Theme */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Landmark className="w-4 h-4" />
                        Cultural Theme
                      </label>
                      <ChipSelector
                        options={CULTURAL_THEMES}
                        value={culturalTheme}
                        onChange={v => setCulturalTheme(v as string)}
                        accentColor="indigo"
                      />
                    </div>

                    {/* Narrative Perspective + Dialogue (row) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <PenTool className="w-4 h-4" />
                          Perspective
                        </label>
                        <div className="flex gap-2">
                          {(['first-person', 'third-person'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setNarrativePerspective(narrativePerspective === p ? '' : p)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                                narrativePerspective === p
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {p === 'first-person' ? '👤 1st Person' : '👥 3rd Person'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          Dialogue
                        </label>
                        <div className="flex gap-2">
                          {([
                            { val: true, label: '💬 Yes' },
                            { val: false, label: '📝 Minimal' },
                          ]).map(d => (
                            <button
                              key={String(d.val)}
                              onClick={() => setIncludeDialogue(includeDialogue === d.val ? null : d.val)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                                includeDialogue === d.val
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Character Names (moved here for advanced) */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Users className="w-4 h-4" />
                        Character Names (Optional)
                      </label>
                      <input
                        type="text"
                        value={characterNames}
                        onChange={e => setCharacterNames(e.target.value)}
                        placeholder="e.g., 小明, 小红, 王老师 (comma separated)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    {/* Target Vocabulary */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <BookText className="w-4 h-4" />
                        Target Vocabulary (Optional)
                      </label>
                      <input
                        type="text"
                        value={targetVocabulary}
                        onChange={e => setTargetVocabulary(e.target.value)}
                        placeholder="Words to include: 学习, 朋友, 高兴 (comma separated)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        The AI will try to use these words in the story
                      </p>
                    </div>

                    {/* Grammar Patterns */}
                    <div>
                      <button
                        onClick={() => setShowGrammar(!showGrammar)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Grammar Patterns (Optional)
                        {showGrammar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <AnimatePresence>
                        {showGrammar && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Select grammar patterns for HSK {hskLevel} to practice:
                            </p>
                            <ChipSelector
                              options={(GRAMMAR_PRESETS[hskLevel] || []).map(g => ({
                                value: g,
                                label: g,
                              }))}
                              value={targetGrammar}
                              onChange={v => setTargetGrammar(v as string[])}
                              multi
                              accentColor="purple"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Generate Button ─────────────────────────── */}
            <button
              onClick={handleGenerate}
              disabled={loading || isLimitReached}
              className={`w-full flex items-center justify-center rounded-xl px-6 py-3 font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                isAdvanced
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {loadingMessage || (isAdvanced ? 'Crafting Your Custom Story...' : 'Generating Story...')}
                </>
              ) : (
                <>
                  {isAdvanced ? (
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  {isAdvanced ? 'Generate Custom Story' : 'Quick Generate'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Error ─────────────────────────────────────────── */}
      {error && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="rounded-2xl shadow-sm border border-red-200 dark:border-red-800 p-5 bg-red-50 dark:bg-red-950/30">
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

      {/* ─── Generated Story ───────────────────────────────── */}
      {generatedStory && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className={`rounded-2xl shadow-sm border p-5 ${
            isAdvanced
              ? 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30'
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
                  Story saved! Find it in Browse Stories.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdvanced
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}>
                  HSK {generatedStory.hsk_level}
                </span>
                {generatedStoryId && (
                  <Link to={`/stories/${generatedStoryId}`}>
                    <button className={`flex items-center text-white rounded-xl px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                      isAdvanced
                        ? 'bg-indigo-600 hover:bg-indigo-700'
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
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 mb-4">
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
              <div className="bg-white dark:bg-gray-900 rounded-lg p-5 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Vocabulary</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatedStory.vocabulary.map((vocab, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className={`text-xl font-medium ${isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
              <div className="bg-white dark:bg-gray-900 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Grammar Points</h3>
                <ul className="space-y-2">
                  {generatedStory.grammar_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`mt-1 ${isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>•</span>
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
