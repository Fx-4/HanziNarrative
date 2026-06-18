import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { storiesApi, dailyChallengeApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WritingCanvas from '@/components/writing/WritingCanvas'
import { HanziWord, AttemptResult } from '@/types'
import {
    Lock,
    Unlock,
    BookOpen,
    PenTool,
    ArrowRight,
    CheckCircle,
    Trophy,
    X,
    Volume2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'
import { fetchTTSAudio } from '@/utils/ttsHelper'

interface Story {
    id: number
    title: string
    title_pinyin?: string
    content: string
    content_pinyin?: string
    content_english?: string
    difficulty_level?: number
    key_vocabulary?: { simplified: string; pinyin: string; english: string }[]
}

export default function StoryChallenge() {
    const [searchParams] = useSearchParams()
    const [hskLevel, setHskLevel] = useState(1)
    const [stories, setStories] = useState<{ id: number; title: string; title_pinyin?: string; is_published: boolean; difficulty_level?: number; key_vocabulary?: { simplified: string }[] }[]>([])
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [loading, setLoading] = useState(false)
    const [hiddenWords, setHiddenWords] = useState<Set<string>>(new Set())
    const [unlockedWords, setUnlockedWords] = useState<Set<string>>(new Set())
    const [writingChar, setWritingChar] = useState<HanziWord | null>(null)
    const [writingWord, setWritingWord] = useState('')
    const [writingCharIndex, setWritingCharIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isDailyChallenge, setIsDailyChallenge] = useState(false)
    const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false)

    useEffect(() => {
        const dailyStoryId = searchParams.get('daily')
        if (dailyStoryId) {
            setIsDailyChallenge(true)
            selectStory(parseInt(dailyStoryId, 10))
        } else {
            loadStories()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hskLevel])

    const loadStories = async () => {
        setLoading(true)
        try {
            const data = await storiesApi.getAll(hskLevel)
            setStories(data.filter((s: { is_published: boolean }) => s.is_published))
        } catch {
            console.warn('[StoryChallenge] Could not load stories (server might be waking up)');
            // Suppress toast for background initial load failure
        } finally {
            setLoading(false)
        }
    }

    const selectStory = async (storyId: number) => {
        setLoading(true)
        try {
            const data = await storiesApi.getById(storyId)

            // Fetch story words via API, or extract from content
            let vocab: { simplified: string; pinyin: string; english: string }[] = []
            try {
                const words = await storiesApi.getStoryWords(storyId)
                vocab = words.map((w: { simplified: string; pinyin: string; english: string }) => ({ simplified: w.simplified, pinyin: w.pinyin, english: w.english }))
            } catch {
                // No associated words — extract 2-char substrings from content as fallback
            }

            // If no words, create simple ones from story content
            if (vocab.length === 0) {
                const content = data.content
                const seen = new Set<string>()
                for (let i = 0; i < content.length - 1; i++) {
                    const pair = content.substring(i, i + 2)
                    if (/^[\u4e00-\u9fff]{2}$/.test(pair) && !seen.has(pair)) {
                        seen.add(pair)
                        vocab.push({ simplified: pair, pinyin: '', english: '' })
                    }
                }
            }

            const wordsToHide = vocab
                .filter(v => v.simplified.length <= 2)
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(5, Math.max(3, vocab.length)))
                .map(v => v.simplified)

                // Store vocab on the data object for later use
                ; (data as Story & { _vocab?: typeof vocab })._vocab = vocab
            setSelectedStory(data)
            setHiddenWords(new Set(wordsToHide))
            setUnlockedWords(new Set())
        } catch {
            console.warn('[StoryChallenge] Could not load story details (server might be waking up)');
            toast.error('Failed to load story')
        } finally {
            setLoading(false)
        }
    }

    const openWritingChallenge = (word: string) => {
        if (unlockedWords.has(word)) return

        // Find vocab data for this word
        const vocabItem = (selectedStory as Story & { _vocab?: { simplified: string; pinyin: string; english: string }[] })?._vocab?.find((v) => v.simplified === word)

        setWritingWord(word)
        setWritingCharIndex(0)

        // Create HanziWord for the first character of the word
        const char = word[0]
        setWritingChar({
            id: 0,
            simplified: char,
            traditional: char,
            pinyin: vocabItem?.pinyin || '',
            english: vocabItem?.english || '',
            hsk_level: hskLevel,
        })
    }

    const handleWritingComplete = (result: AttemptResult) => {
        if (result.accuracy >= 60) {
            // Move to next character in the word
            const nextIndex = writingCharIndex + 1
            if (nextIndex < writingWord.length) {
                setWritingCharIndex(nextIndex)
                const char = writingWord[nextIndex]
                const vocabItem = (selectedStory as Story & { _vocab?: { simplified: string; pinyin: string; english: string }[] })?._vocab?.find((v) => v.simplified === writingWord)
                setWritingChar({
                    id: 0,
                    simplified: char,
                    traditional: char,
                    pinyin: vocabItem?.pinyin || '',
                    english: vocabItem?.english || '',
                    hsk_level: hskLevel,
                })
            } else {
                // Word fully written!
                setUnlockedWords(prev => new Set([...prev, writingWord]))
                setWritingChar(null)
                setWritingWord('')
                toast.success(`Unlocked: ${writingWord}`)
            }
        }
    }

    const playStory = async () => {
        if (!selectedStory || isPlaying) return
        setIsPlaying(true)
        const text = selectedStory.content.substring(0, 200)

        try {
            const audio = await fetchTTSAudio({ text, speakingRate: 0.8 })
            audio.onended = () => setIsPlaying(false)
            audio.onerror = () => setIsPlaying(false)
            await audio.play()
        } catch {
            setIsPlaying(false)
        }
    }

    const renderStoryWithBlanks = () => {
        if (!selectedStory) return null

        const content = selectedStory.content
        const elements: JSX.Element[] = []
        let i = 0

        while (i < content.length) {
            let matched = false

            // Check if current position starts a hidden word
            for (const word of hiddenWords) {
                if (content.substring(i, i + word.length) === word) {
                    const isUnlocked = unlockedWords.has(word)
                    elements.push(
                        <span
                            key={`word-${i}`}
                            onClick={() => !isUnlocked && openWritingChallenge(word)}
                            className={`inline-block mx-0.5 transition-all ${isUnlocked
                                ? 'text-success-700 font-bold bg-success-50 px-1 rounded'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 px-1 rounded cursor-pointer border-b-2 border-amber-300 border-dashed'
                                }`}
                            title={isUnlocked ? 'Unlocked!' : 'Click to write and unlock'}
                        >
                            {isUnlocked ? (
                                <span className="font-chinese text-2xl">{word}</span>
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    {Array.from(word).map((_, ci) => (
                                        <span key={ci} className="inline-block w-6 h-6 border-b-2 border-amber-400" />
                                    ))}
                                    <Lock className="w-3 h-3 text-amber-600 inline dark:text-amber-400" />
                                </span>
                            )}
                        </span>
                    )
                    i += word.length
                    matched = true
                    break
                }
            }

            if (!matched) {
                const char = content[i]
                const isChinese = /[\u4e00-\u9fff]/.test(char)
                elements.push(
                    <span key={`char-${i}`} className={`font-chinese ${isChinese ? 'text-2xl' : 'text-xl'}`}>
                        {char}
                    </span>
                )
                i++
            }
        }

        return elements
    }

    const allUnlocked = hiddenWords.size > 0 && hiddenWords.size === unlockedWords.size

    // Complete daily challenge when all words unlocked
    useEffect(() => {
        if (allUnlocked && isDailyChallenge && !dailyChallengeCompleted) {
            dailyChallengeApi.complete()
                .then(() => {
                    setDailyChallengeCompleted(true)
                    toast.success('Daily Challenge completed! +30 XP')
                })
                .catch(() => {
                    // Already completed or error — ignore
                })
        }
    }, [allUnlocked, isDailyChallenge, dailyChallengeCompleted])

    // Landing screen
    if (!selectedStory) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
                            <BlurText
                                as="h1"
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50"
                                wordDelay={0.08}
                            >
                                Unlock the Story
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            Write characters to reveal hidden words in stories
                        </p>
                    </motion.div>

                    {/* HSK Level Selector */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:bg-surface-card dark:border-gray-800">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 dark:text-gray-50">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level
                                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Story list */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        {loading ? (
                            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
                        ) : stories.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center dark:bg-surface-card dark:border-gray-800">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">No stories available for HSK {hskLevel}.</p>
                                <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">Generate some stories first!</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {stories.slice(0, 8).map((story, i) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.05 }}
                                    >
                                        <button
                                            onClick={() => selectStory(story.id)}
                                            className="w-full text-left bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:border-amber-300 hover:shadow-lg cursor-pointer transition-all group dark:bg-surface-card dark:border-gray-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:bg-amber-900/40">
                                                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-chinese text-lg text-gray-900 truncate dark:text-gray-50">{story.title}</p>
                                                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">{story.title_pinyin}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 dark:bg-amber-950/30 dark:text-amber-300">
                                                            HSK {story.difficulty_level}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            {story.key_vocabulary?.length || 0} vocab
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 mt-2" />
                                            </div>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* How it works */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:border-gray-800 dark:from-amber-950/30 dark:to-yellow-950/30">
                            <h4 className="font-semibold text-gray-900 mb-3 dark:text-gray-50">How it works</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-amber-900/40">
                                        <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">1. Read</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Read the story with hidden vocabulary words</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-yellow-900/40">
                                        <PenTool className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">2. Write</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Draw each character to unlock the word</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-success-900/40">
                                        <Unlock className="w-4 h-4 text-success-600 dark:text-success-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">3. Unlock</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Reveal the hidden words and complete the story</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Story challenge view
    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <button
                        onClick={() => setSelectedStory(null)}
                        className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer dark:text-gray-400"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={playStory}
                            disabled={isPlaying}
                            className="bg-white rounded-xl shadow-sm border px-3 py-1.5 text-sm font-medium cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:bg-surface-card"
                        >
                            <Volume2 className="w-3.5 h-3.5" />
                            {isPlaying ? 'Playing...' : 'Listen'}
                        </button>
                        <div className="bg-amber-50 rounded-xl border border-amber-200 px-3 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                            {unlockedWords.size}/{hiddenWords.size} unlocked
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
                    <motion.div
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2.5 rounded-full"
                        animate={{ width: `${hiddenWords.size > 0 ? (unlockedWords.size / hiddenWords.size) * 100 : 0}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Story title */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <h2 className="text-2xl font-chinese text-gray-900 mb-1 dark:text-gray-50">{selectedStory.title}</h2>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{selectedStory.title_pinyin}</p>
                </motion.div>

                {/* Story content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 dark:bg-surface-card dark:border-gray-800">
                        <div className="leading-[3rem] select-none">
                            {renderStoryWithBlanks()}
                        </div>

                        {/* Hint for hidden words */}
                        {!allUnlocked && (
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 mb-2 flex items-center gap-1 dark:text-gray-400">
                                    <Lock className="w-3.5 h-3.5" /> Click a blank to write and unlock:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(hiddenWords).map(word => {
                                        const isUnlocked = unlockedWords.has(word)
                                        const vocabItem = selectedStory.key_vocabulary?.find(v => v.simplified === word)
                                        return (
                                            <button
                                                key={word}
                                                onClick={() => !isUnlocked && openWritingChallenge(word)}
                                                disabled={isUnlocked}
                                                className={`rounded-xl px-3 py-1.5 text-sm font-medium cursor-pointer transition-all ${isUnlocked
                                                    ? 'bg-success-50 text-success-700 border border-green-200'
                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                                    }`}
                                            >
                                                {isUnlocked ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> {word}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <PenTool className="w-3 h-3" />
                                                        {vocabItem?.english || '???'}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* All unlocked celebration */}
                <AnimatePresence>
                    {allUnlocked && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="bg-gradient-to-r from-success-50 to-emerald-50 rounded-3xl shadow-xl border border-green-200 p-6 text-center dark:from-success-950/30 dark:to-emerald-950/30 dark:border-green-800">
                                <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-50">Story Unlocked!</h3>
                                <p className="text-gray-600 mb-1 dark:text-gray-400">You wrote all {hiddenWords.size} hidden words correctly!</p>

                                {/* Translation reveal */}
                                <div className="mt-4 bg-white rounded-2xl p-4 text-left dark:bg-surface-card">
                                    <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">English translation:</p>
                                    <p className="text-gray-700 italic dark:text-gray-300">{selectedStory.content_english}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedStory(null)}
                                    className="mt-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <BookOpen className="w-5 h-5" /> Try Another Story
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Writing modal */}
            <AnimatePresence>
                {writingChar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setWritingChar(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 w-full max-w-sm dark:bg-surface-card"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                                        Write: <span className="text-amber-600 dark:text-amber-400">
                                            {writingWord} ({writingCharIndex + 1}/{writingWord.length})
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedStory?.key_vocabulary?.find(v => v.simplified === writingWord)?.english || ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWritingChar(null)}
                                    className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                                >
                                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </button>
                            </div>

                            <WritingCanvas
                                character={writingChar}
                                onComplete={handleWritingComplete}
                                mode="practice"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

