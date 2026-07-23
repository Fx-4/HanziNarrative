import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storiesApi } from '@/services/api'
import { SessionSkeleton } from '@/components/ui/Skeleton'
import {
    BookOpen,
    CheckCircle,
    XCircle,
    ArrowRight,
    Trophy,
    RotateCcw,
    Target,
    Lightbulb
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'

interface BlankQuestion {
    sentence: string
    blankWord: string
    context: string          // full sentence with blank shown as ____
    options: string[]
    correctIndex: number
    storyTitle: string
}

function extractQuestions(stories: { content: string; title_english?: string; title: string }[]): BlankQuestion[] {
    const questions: BlankQuestion[] = []

    for (const story of stories) {
        // Split content into sentences
        const sentences = story.content
            .split(/[。！？]/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length >= 4 && s.length <= 30)

        for (const sentence of sentences) {
            // Find 2-char Chinese word candidates in the sentence
            const candidates: string[] = []
            for (let i = 0; i < sentence.length - 1; i++) {
                const pair = sentence.substring(i, i + 2)
                if (/^[\u4e00-\u9fff]{2}$/.test(pair)) {
                    // Skip if it overlaps with previous candidate
                    if (candidates.length === 0 || !candidates[candidates.length - 1].includes(pair[0])) {
                        candidates.push(pair)
                    }
                }
            }

            if (candidates.length < 2) continue

            // Pick a random word to blank out
            const blankWord = candidates[Math.floor(Math.random() * candidates.length)]
            const context = sentence.replace(blankWord, '____')

            // Generate wrong options from other candidates in other sentences
            const otherWords = stories
                .flatMap((s: { content: string }) => {
                    const words: string[] = []
                    for (let i = 0; i < s.content.length - 1; i++) {
                        const p = s.content.substring(i, i + 2)
                        if (/^[\u4e00-\u9fff]{2}$/.test(p) && p !== blankWord && !words.includes(p)) {
                            words.push(p)
                        }
                    }
                    return words
                })
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)

            if (otherWords.length < 3) continue

            const options = [blankWord, ...otherWords].sort(() => Math.random() - 0.5)
            questions.push({
                sentence,
                blankWord,
                context,
                options,
                correctIndex: options.indexOf(blankWord),
                storyTitle: story.title_english || story.title,
            })
        }
    }

    return questions.sort(() => Math.random() - 0.5).slice(0, 15)
}

export default function FillBlank() {
    const [hskLevel, setHskLevel] = useState(1)
    const [questions, setQuestions] = useState<BlankQuestion[]>([])
    const [currentQ, setCurrentQ] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [started, setStarted] = useState(false)
    const [loading, setLoading] = useState(false)

    const startSession = async () => {
        setLoading(true)
        try {
            const stories = await storiesApi.getAll(hskLevel)
            const published = stories.filter((s: { is_published: boolean }) => s.is_published)
            if (published.length === 0) {
                toast.error('No stories available for this level.')
                return
            }
            const qs = extractQuestions(published)
            if (qs.length < 3) {
                toast.error('Not enough content to generate questions.')
                return
            }
            setQuestions(qs)
            setCurrentQ(0)
            setScore(0)
            setSelected(null)
            setStarted(true)
        } catch {
            toast.error('Failed to load stories')
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (index: number) => {
        if (selected !== null) return
        setSelected(index)
        if (index === questions[currentQ].correctIndex) {
            setScore(prev => prev + 1)
        }
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1)
                setSelected(null)
            } else {
                setStarted(false)
            }
        }, 1200)
    }

    // Keyboard: tekan 1-4 untuk memilih opsi (hanya sebelum menjawab).
    useEffect(() => {
        if (!started || selected !== null) return
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return
            const q = questions[currentQ]
            if (!q) return
            if (['1', '2', '3', '4'].includes(e.key)) {
                const idx = Number(e.key) - 1
                if (idx < q.options.length) handleAnswer(idx)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, selected, currentQ, questions])

    // Generating questions — skeleton of the upcoming exercise
    if (loading) {
        return <SessionSkeleton />
    }

    // Landing
    if (!started && questions.length === 0) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
                            <BlurText as="h1" className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100" wordDelay={0.08}>
                                Fill in the Blank
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Read story sentences and choose the missing word</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How It Works</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-amber-900/40"><BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                                    <div><p className="font-medium text-gray-900 dark:text-gray-100">Read</p><p className="text-sm text-gray-600 dark:text-gray-400">See a sentence from a real story</p></div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-orange-900/40"><Target className="w-4 h-4 text-orange-600 dark:text-orange-400" /></div>
                                    <div><p className="font-medium text-gray-900 dark:text-gray-100">Choose</p><p className="text-sm text-gray-600 dark:text-gray-400">Pick the missing word from 4 options</p></div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-success-900/40"><CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" /></div>
                                    <div><p className="font-medium text-gray-900 dark:text-gray-100">Learn</p><p className="text-sm text-gray-600 dark:text-gray-400">Build reading comprehension skills</p></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                        <button onClick={startSession} disabled={loading}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                            <Lightbulb className="w-6 h-6" />
                            Start Reading
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Results
    if (!started && questions.length > 0) {
        const pct = Math.round((score / questions.length) * 100)
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl shadow-xl border border-amber-200 dark:border-amber-800 p-6 sm:p-8 text-center">
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Reading Complete!</h2>
                            <p className="text-xl text-gray-700 dark:text-gray-300">{score}/{questions.length} correct ({pct}%)</p>
                            <div className="flex justify-center gap-3 mt-6">
                                <button onClick={() => { setQuestions([]); setStarted(false) }}
                                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> New Session
                                </button>
                                <button onClick={startSession}
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5" /> Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Active question
    const q = questions[currentQ]
    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">{currentQ + 1}/{questions.length}</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 px-3 py-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
                        {score} correct
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                    <motion.div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                        animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                            <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" /> From: {q.storyTitle}
                            </div>

                            <div className="text-center mb-8">
                                <p className="text-2xl sm:text-3xl font-chinese text-gray-900 dark:text-gray-100 leading-relaxed">
                                    {q.context.split('____').map((part, i, arr) => (
                                        <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && (
                                                <span className={`inline-block min-w-[3em] mx-1 border-b-4 ${selected !== null
                                                    ? selected === q.correctIndex ? 'border-green-400' : 'border-error-400'
                                                    : 'border-amber-300'
                                                    } text-center`}>
                                                    {selected !== null ? (
                                                        <span className="text-success-700 font-bold dark:text-success-300">{q.blankWord}</span>
                                                    ) : (
                                                        <span className="text-amber-400 text-lg">?</span>
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, i) => {
                                    let btnClass = 'bg-gray-50 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-2 border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 text-gray-800 dark:text-gray-200'
                                    if (selected !== null) {
                                        if (i === q.correctIndex) btnClass = 'bg-success-50 border-2 border-green-400 dark:bg-success-950/30 dark:border-green-800 text-success-800 dark:text-success-300'
                                        else if (i === selected) btnClass = 'bg-error-50 border-2 border-error-400 dark:bg-error-950/30 dark:border-error-800 text-error-800 dark:text-error-300'
                                        else btnClass = 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                    }
                                    return (
                                        <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                                            className={`relative rounded-2xl p-4 font-medium cursor-pointer transition-all text-center ${btnClass} disabled:cursor-default`}>
                                            {selected === null && (
                                                <kbd className="hidden sm:inline-flex items-center justify-center absolute top-2 right-2.5 h-4 min-w-[16px] px-1 rounded border border-current text-[10px] leading-none opacity-40 font-sans">{i + 1}</kbd>
                                            )}
                                            <span className="text-2xl font-chinese">{opt}</span>
                                            {selected !== null && i === q.correctIndex && <CheckCircle className="w-4 h-4 text-success-600 mx-auto mt-1 dark:text-success-400" />}
                                            {selected !== null && i === selected && i !== q.correctIndex && <XCircle className="w-4 h-4 text-error-500 mx-auto mt-1" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
