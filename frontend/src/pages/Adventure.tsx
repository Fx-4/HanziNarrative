import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adventureApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
    Map,
    Sparkles,
    ArrowRight,
    RotateCcw,
    Eye,
    EyeOff,
    Trophy,
    AlertCircle,
    Volume2,
    Pause,
    Home,
    UtensilsCrossed,
    GraduationCap,
    Plane,
    ShoppingBag,
    Users,
    Search,
    TreePine,
    MapPin
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'
import { fetchTTSAudio } from '@/utils/ttsHelper'

interface Choice {
    id: number
    text: string
    text_pinyin: string
    text_english: string
}

interface StoryStep {
    paragraph: string
    paragraph_pinyin: string
    paragraph_english: string
    choices: Choice[]
    is_ending?: boolean
    moral?: string
    setting?: string
}

const TOPIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'daily life': Home,
    'food and restaurant': UtensilsCrossed,
    'school and studying': GraduationCap,
    'travel and transportation': Plane,
    'shopping': ShoppingBag,
    'friendship': Users,
    'mystery': Search,
    'nature and animals': TreePine,
}

const TOPICS = [
    { value: 'daily life', label: '日常生活' },
    { value: 'food and restaurant', label: '美食' },
    { value: 'school and studying', label: '学习' },
    { value: 'travel and transportation', label: '旅行' },
    { value: 'shopping', label: '购物' },
    { value: 'friendship', label: '友谊' },
    { value: 'mystery', label: '神秘' },
    { value: 'nature and animals', label: '自然' },
]

export default function Adventure() {
    const [hskLevel, setHskLevel] = useState(1)
    const [topic, setTopic] = useState('daily life')
    const [storySteps, setStorySteps] = useState<StoryStep[]>([])
    const [stepNumber, setStepNumber] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showPinyin, setShowPinyin] = useState(true)
    const [showTranslation, setShowTranslation] = useState(false)
    const [usageStats, setUsageStats] = useState<{ adventure_start?: { remaining_daily: number; remaining_hourly: number; limit_daily: number }; adventure_continue?: { remaining_daily: number; limit_daily: number } } | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
    const [streamingText, setStreamingText] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        loadUsageStats()
        return () => {
            abortRef.current?.abort()
        }
    }, [])

    const loadUsageStats = async () => {
        try {
            const stats = await adventureApi.getUsageStats()
            setUsageStats(stats)
        } catch {
            // Ignore — will show default
        }
    }

    const startAdventure = async () => {
        setLoading(true)
        setStreamingText('')
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        try {
            const result = await adventureApi.startStream(
                hskLevel,
                topic,
                (chunk) => setStreamingText(prev => (prev ?? '') + chunk),
                controller.signal,
            )
            if (result) {
                setStorySteps([result])
                setStepNumber(1)
                setUsageStats(null)
                loadUsageStats()
            }
        } catch (error) {
            const err = error as { name?: string; message?: string; response?: { status?: number } }
            if (err.name === 'AbortError') return
            if (err.message?.includes('429') || err.response?.status === 429) {
                toast.error('Rate limit reached! Try again later.')
            } else {
                toast.error('Failed to start adventure')
            }
        } finally {
            setLoading(false)
            setStreamingText(null)
        }
    }

    const handleChoice = async (choice: Choice) => {
        setLoading(true)
        setStreamingText('')
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        try {
            // Build story context from all previous paragraphs
            const context = storySteps.map(s => s.paragraph).join('\n')

            const result = await adventureApi.continueStream(
                context,
                choice.text,
                hskLevel,
                stepNumber + 1,
                (chunk) => setStreamingText(prev => (prev ?? '') + chunk),
                controller.signal,
            )

            if (result) {
                setStorySteps(prev => [...prev, result])
                setStepNumber(prev => prev + 1)
                loadUsageStats()
            }
        } catch (error) {
            const err = error as { name?: string; message?: string; response?: { status?: number } }
            if (err.name === 'AbortError') return
            if (err.message?.includes('429') || err.response?.status === 429) {
                toast.error('Rate limit reached! Try again later.')
            } else {
                toast.error('Failed to continue story')
            }
        } finally {
            setLoading(false)
            setStreamingText(null)
        }
    }

    const playParagraph = async (text: string) => {
        if (isPlaying) {
            if (audioRef) { audioRef.pause(); setAudioRef(null) }
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            return
        }

        setIsPlaying(true)
        try {
            const audio = await fetchTTSAudio({ text, speakingRate: 0.85 })
            setAudioRef(audio)
            audio.onended = () => setIsPlaying(false)
            audio.onerror = () => setIsPlaying(false)
            await audio.play()
        } catch {
            setIsPlaying(false)
        }
    }

    const resetAdventure = () => {
        abortRef.current?.abort()
        setStorySteps([])
        setStepNumber(0)
        setStreamingText(null)
        setLoading(false)
        if (audioRef) { audioRef.pause(); setAudioRef(null) }
        setIsPlaying(false)
    }

    const startQuota = usageStats?.adventure_start
    const continueQuota = usageStats?.adventure_continue
    const canStart = !startQuota || (startQuota.remaining_daily > 0 && startQuota.remaining_hourly > 0)

    // Landing screen
    if (storySteps.length === 0) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Map className="w-8 h-8 sm:w-10 sm:h-10 text-success-600 dark:text-success-400" />
                            <BlurText
                                as="h1"
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50"
                                wordDelay={0.08}
                            >
                                Adventure Stories
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            Choose your own adventure — in Chinese!
                        </p>
                    </motion.div>

                    {/* HSK Level */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:bg-surface-card dark:border-gray-800">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 dark:text-gray-50">HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level
                                            ? 'bg-success-600 hover:bg-success-700 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Topic Selector */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:bg-surface-card dark:border-gray-800">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 dark:text-gray-50">Choose a Topic</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {TOPICS.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTopic(t.value)}
                                        className={`rounded-2xl px-3 py-3 text-sm font-medium cursor-pointer transition-all text-center ${topic === t.value
                                            ? 'bg-success-100 border-2 border-success-500 text-success-800'
                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {(() => { const Icon = TOPIC_ICONS[t.value]; return Icon ? <Icon className="w-5 h-5 mx-auto mb-1" /> : null })()}
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Usage Quota */}
                    {usageStats && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                        >
                            <div className="bg-gradient-to-r from-success-50 to-success-50 rounded-3xl shadow border border-success-200 p-4 sm:p-5 dark:from-success-950/30 dark:to-success-950/30 dark:border-success-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                                    <h4 className="text-sm font-semibold text-success-800 dark:text-success-300">Today's Quota</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-success-700 dark:text-success-300">Adventures remaining</p>
                                        <p className="text-lg font-bold text-success-800 dark:text-success-300">
                                            {startQuota ? `${startQuota.remaining_daily}/${startQuota.limit_daily}` : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-success-700 dark:text-success-300">Choices remaining</p>
                                        <p className="text-lg font-bold text-success-800 dark:text-success-300">
                                            {continueQuota ? `${continueQuota.remaining_daily}/${continueQuota.limit_daily}` : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-center"
                    >
                        <button
                            onClick={startAdventure}
                            disabled={loading || !canStart}
                            className="bg-gradient-to-r from-success-600 to-success-600 hover:from-success-700 hover:to-success-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Map className="w-6 h-6" />}
                            {canStart ? 'Start Adventure' : 'Quota exhausted — try tomorrow'}
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Story playback
    const currentStep = storySteps[storySteps.length - 1]
    const isEnding = currentStep?.is_ending

    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={resetAdventure}
                        className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer flex items-center gap-1 dark:text-gray-400"
                    >
                        <RotateCcw className="w-4 h-4" /> New Adventure
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPinyin(!showPinyin)}
                            className="bg-white rounded-xl shadow-sm border px-3 py-1.5 text-sm font-medium cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50 dark:bg-surface-card"
                        >
                            {showPinyin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            Pinyin
                        </button>
                        <button
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="bg-white rounded-xl shadow-sm border px-3 py-1.5 text-sm font-medium cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50 dark:bg-surface-card"
                        >
                            {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            EN
                        </button>
                        <div className="bg-success-50 rounded-xl border border-success-200 px-3 py-1.5 text-sm font-bold text-success-700 dark:bg-success-950/30 dark:border-success-800 dark:text-success-300">
                            Step {stepNumber}/5
                        </div>
                    </div>
                </div>

                {/* Step progress */}
                <div className="flex gap-1.5 mb-6">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full transition-colors ${s <= stepNumber ? 'bg-success-500' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Story paragraphs */}
                <div className="space-y-4 mb-6">
                    {storySteps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx === storySteps.length - 1 ? 0.2 : 0 }}
                        >
                            <div className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5  dark:bg-surface-card${idx === storySteps.length - 1 ? 'border-success-200 ring-1 ring-success-100' : 'border-gray-100'
                                }`}>
                                {/* Audio button */}
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => playParagraph(step.paragraph)}
                                        className="text-gray-400 hover:text-success-600 cursor-pointer transition-colors dark:text-gray-500"
                                    >
                                        {isPlaying && idx === storySteps.length - 1 ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Volume2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Chinese text */}
                                <p className="text-xl sm:text-2xl font-chinese leading-relaxed text-gray-900 mb-2 dark:text-gray-50">
                                    {step.paragraph}
                                </p>

                                {/* Pinyin */}
                                <AnimatePresence>{showPinyin && step.paragraph_pinyin && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-success-600 text-sm mb-1 dark:text-success-400"
                                    >
                                        {step.paragraph_pinyin}
                                    </motion.p>
                                )}</AnimatePresence>

                                {/* Translation */}
                                <AnimatePresence>{showTranslation && step.paragraph_english && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-gray-500 text-sm italic dark:text-gray-400"
                                    >
                                        {step.paragraph_english}
                                    </motion.p>
                                )}</AnimatePresence>

                                {/* Setting for first step */}
                                {idx === 0 && step.setting && (
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 dark:text-gray-500"><MapPin className="w-3 h-3" /> {step.setting}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Streaming paragraph — shown while AI is generating */}
                {loading && streamingText !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-success-200 ring-1 ring-success-100 p-4 sm:p-5 mb-4 dark:bg-surface-card dark:border-success-800">
                            <p className="text-xl sm:text-2xl font-chinese leading-relaxed text-gray-900 dark:text-gray-50">
                                {streamingText}
                                <span className="inline-block w-0.5 h-6 bg-success-500 ml-0.5 animate-pulse align-middle">▊</span>
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Choices or Ending */}
                {loading && streamingText === null ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="lg" />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Writing the next chapter...</span>
                    </div>
                ) : loading ? (
                    /* streaming in progress — choices will appear after done */
                    null
                ) : isEnding ? (
                    /* Story Ending */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl shadow-xl border border-amber-200 p-6 text-center dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800">
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-50">Adventure Complete!</h3>
                            {currentStep.moral && (
                                <p className="text-gray-700 italic mb-4 dark:text-gray-300">"{currentStep.moral}"</p>
                            )}
                            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">You completed {stepNumber} steps in this adventure!</p>
                            <button
                                onClick={resetAdventure}
                                className="bg-success-600 hover:bg-success-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors flex items-center gap-2 mx-auto"
                            >
                                <Map className="w-5 h-5" /> Start New Adventure
                            </button>
                        </div>
                    </motion.div>
                ) : currentStep?.choices?.length > 0 ? (
                    /* Choice buttons */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:bg-surface-card dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-success-600 dark:text-success-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-50">What do you do?</h3>
                            </div>
                            <div className="space-y-3">
                                {currentStep.choices.map((choice) => (
                                    <button
                                        key={choice.id}
                                        onClick={() => handleChoice(choice)}
                                        disabled={loading}
                                        className="w-full text-left bg-gray-50 hover:bg-success-50 border-2 border-gray-100 hover:border-success-300 rounded-2xl p-4 cursor-pointer transition-all disabled:opacity-50 group dark:bg-gray-800/50 dark:border-gray-800"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 bg-success-100 text-success-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-success-200 dark:bg-success-900/40 dark:text-success-300">
                                                {choice.id}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-lg font-chinese text-gray-900 dark:text-gray-50">{choice.text}</p>
                                                {showPinyin && choice.text_pinyin && (
                                                    <p className="text-sm text-success-600 mt-0.5 dark:text-success-400">{choice.text_pinyin}</p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">{choice.text_english}</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-success-500 flex-shrink-0 mt-1" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </div>
    )
}



