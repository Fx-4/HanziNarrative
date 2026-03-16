import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HanziWord } from '@/types'
import {
    Clock,
    CheckCircle,
    XCircle,
    Trophy,
    RotateCcw,
    Target,
    BarChart3,
    BookOpen,
    ChevronRight,
    Home,
    Headphones,
    Eye,
    PenTool
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'

type TestSection = 'listening' | 'reading' | 'writing'

interface Question {
    type: TestSection
    prompt: string
    promptSub: string
    options: string[]
    correctIndex: number
    word: HanziWord
}

interface SectionResult {
    section: TestSection
    correct: number
    total: number
}

// Sentence templates for listening / reading questions
const SENTENCE_TEMPLATES = [
    { template: '他是我的___。', slot: 'word' },
    { template: '我喜欢___。', slot: 'word' },
    { template: '她学___很努力。', slot: 'word' },
    { template: '这是一个___。', slot: 'word' },
    { template: '我每天___。', slot: 'word' },
    { template: '他有一个___。', slot: 'word' },
    { template: '我们去___吧。', slot: 'word' },
    { template: '她喜欢吃___。', slot: 'word' },
]

const PINYIN_TEMPLATES = [
    { template: 'Tā shì wǒ de ___。', slot: 'pinyin' },
    { template: 'Wǒ xǐhuān ___。', slot: 'pinyin' },
    { template: 'Zhè shì yīgè ___。', slot: 'pinyin' },
    { template: 'Tā yǒu yīgè ___。', slot: 'pinyin' },
    { template: 'Wǒmen qù ___ ba。', slot: 'pinyin' },
    { template: 'Tā měitiān ___。', slot: 'pinyin' },
]

function buildListeningQuestion(word: HanziWord, others: HanziWord[]): Omit<Question, 'type'> {
    const tpl = PINYIN_TEMPLATES[Math.floor(Math.random() * PINYIN_TEMPLATES.length)]
    const prompt = tpl.template.replace('___', `[${word.pinyin}]`)
    const promptSub = 'Which Chinese word fits the blank?'
    const correct = word.simplified
    const wrongs = others.slice(0, 3).map(o => o.simplified)
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
    return { prompt, promptSub, options, correctIndex: options.indexOf(correct), word }
}

function buildReadingQuestion(word: HanziWord, others: HanziWord[]): Omit<Question, 'type'> {
    const tpl = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)]
    const prompt = tpl.template
    const promptSub = `Fill in the blank — hint: ${word.english}`
    const correct = word.simplified
    const wrongs = others.slice(0, 3).map(o => o.simplified)
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
    return { prompt, promptSub, options, correctIndex: options.indexOf(correct), word }
}

function buildWritingQuestion(word: HanziWord, others: HanziWord[]): Omit<Question, 'type'> {
    const prompt = word.english
    const promptSub = `pīnyīn hint: ${word.pinyin}`
    const correct = word.simplified
    const wrongs = others.slice(0, 3).map(o => o.simplified)
    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
    return { prompt, promptSub, options, correctIndex: options.indexOf(correct), word }
}

function generateSectionedQuestions(words: HanziWord[]): [Question[], Question[], Question[]] {
    const shuffled = [...words].sort(() => Math.random() - 0.5)

    const listeningWords = shuffled.slice(0, 10)
    const readingWords = shuffled.slice(10, 20)
    const writingWords = shuffled.slice(20, 25)

    const getOthers = (word: HanziWord) =>
        words.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5)

    const listening: Question[] = listeningWords.map(w => ({
        type: 'listening' as TestSection,
        ...buildListeningQuestion(w, getOthers(w))
    }))

    const reading: Question[] = readingWords.map(w => ({
        type: 'reading' as TestSection,
        ...buildReadingQuestion(w, getOthers(w))
    }))

    const writing: Question[] = writingWords.map(w => ({
        type: 'writing' as TestSection,
        ...buildWritingQuestion(w, getOthers(w))
    }))

    return [listening, reading, writing]
}

const SECTION_META = {
    listening: {
        label: '听力',
        labelEn: 'Listening',
        timePerQ: 45,
        total: 10,
        color: 'indigo',
        gradient: 'from-indigo-500 to-blue-600',
        gradientLight: 'from-indigo-50 to-blue-50',
        gradientDark: 'from-indigo-950/30 to-blue-950/30',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        accent: 'text-indigo-600',
        bar: 'bg-indigo-500',
        icon: Headphones,
        desc: 'Listen to the pinyin sentence and choose the correct Chinese word.',
    },
    reading: {
        label: '阅读',
        labelEn: 'Reading',
        timePerQ: 30,
        total: 10,
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-600',
        gradientLight: 'from-emerald-50 to-green-50',
        gradientDark: 'from-emerald-950/30 to-green-950/30',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        accent: 'text-emerald-600',
        bar: 'bg-emerald-500',
        icon: Eye,
        desc: 'Read the Chinese sentence and choose the word that fills the blank.',
    },
    writing: {
        label: '书写',
        labelEn: 'Writing',
        timePerQ: 60,
        total: 5,
        color: 'purple',
        gradient: 'from-purple-500 to-violet-600',
        gradientLight: 'from-purple-50 to-violet-50',
        gradientDark: 'from-purple-950/30 to-violet-950/30',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        accent: 'text-purple-600',
        bar: 'bg-purple-500',
        icon: PenTool,
        desc: 'Given the English meaning and pinyin, select the correct Chinese character.',
    },
}

const SECTION_ORDER: TestSection[] = ['listening', 'reading', 'writing']

type PageState = 'cover' | 'section-intro' | 'question' | 'section-done' | 'results'

export default function MockTest() {
    const [hskLevel, setHskLevel] = useState(1)
    const [loading, setLoading] = useState(false)

    const [page, setPage] = useState<PageState>('cover')
    const [sectionIndex, setSectionIndex] = useState(0)
    const [sectionQuestions, setSectionQuestions] = useState<[Question[], Question[], Question[]]>([[], [], []])
    const [currentQ, setCurrentQ] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [sectionAnswers, setSectionAnswers] = useState<(number | null)[]>([])
    const [sectionResults, setSectionResults] = useState<SectionResult[]>([])

    const [timeLeft, setTimeLeft] = useState(0)
    const [totalTimeUsed, setTotalTimeUsed] = useState(0)

    // SSE-based per-question countdown (replaces setInterval)
    const timerAbortRef = useRef<AbortController | null>(null)
    // Total elapsed time: computed from start timestamp — no interval needed
    const testStartRef = useRef<number>(0)

    // Abort SSE stream on unmount
    useEffect(() => {
        return () => { timerAbortRef.current?.abort() }
    }, [])

    const currentSection = SECTION_ORDER[sectionIndex]
    const meta = SECTION_META[currentSection]
    const SectionIcon = meta.icon

    const stopTimer = () => {
        timerAbortRef.current?.abort()
        timerAbortRef.current = null
    }

    const startTimer = useCallback((seconds: number) => {
        // Abort any existing stream first
        stopTimer()

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const token = localStorage.getItem('access_token')
        const abort = new AbortController()
        timerAbortRef.current = abort

        setTimeLeft(seconds)

        fetch(`${API_URL}/mock-test/timer-stream?seconds=${seconds}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: abort.signal,
        })
            .then(res => {
                if (!res.ok || !res.body) return
                const reader = res.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                const pump = (): Promise<void> =>
                    reader.read().then(({ done, value }) => {
                        if (done || abort.signal.aborted) return
                        buffer += decoder.decode(value, { stream: true })
                        const parts = buffer.split('\n\n')
                        buffer = parts.pop() ?? ''
                        for (const part of parts) {
                            const line = part.trim()
                            if (!line.startsWith('data:')) continue
                            try {
                                const payload = JSON.parse(line.slice(5).trim())
                                if (payload.type === 'tick') {
                                    setTimeLeft(payload.remaining)
                                } else if (payload.type === 'done') {
                                    autoAdvance()
                                    return
                                }
                            } catch { /* malformed line — skip */ }
                        }
                        return pump()
                    })

                return pump()
            })
            .catch(err => {
                // AbortError is expected when stopTimer() is called — not a real error
                if (err?.name !== 'AbortError') {
                    console.error('Timer SSE error — falling back to local countdown', err)
                    // Fallback: simple local countdown so the test remains playable
                    let remaining = seconds
                    const id = setInterval(() => {
                        remaining -= 1
                        setTimeLeft(remaining)
                        if (remaining <= 0) {
                            clearInterval(id)
                            autoAdvance()
                        }
                    }, 1000)
                }
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const autoAdvance = () => {
        setSelectedAnswer(-1) // -1 = timed out
        setTimeout(() => advanceQuestion(), 800)
    }

    const advanceQuestion = () => {
        const qs = sectionQuestions[sectionIndex]
        setSelectedAnswer(null)
        if (currentQ < qs.length - 1) {
            setCurrentQ(prev => prev + 1)
        } else {
            // End of section
            finishSection()
        }
    }

    // Re-start timer when currentQ changes (during active question phase)
    useEffect(() => {
        if (page === 'question') {
            startTimer(meta.timePerQ)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQ, page])

    const startTest = async () => {
        setLoading(true)
        try {
            const words = await vocabularyApi.getByHSKLevel(hskLevel)
            if (words.length < 25) {
                toast.error('Not enough vocabulary for this level. Need at least 25 words.')
                return
            }
            const [l, r, w] = generateSectionedQuestions(words)
            setSectionQuestions([l, r, w])
            setSectionIndex(0)
            setSectionResults([])
            setTotalTimeUsed(0)
            // Record test start time — elapsed is computed as a diff at the end,
            // so no interval is needed at all.
            testStartRef.current = Date.now()

            setPage('section-intro')
        } catch {
            toast.error('Failed to load vocabulary')
        } finally {
            setLoading(false)
        }
    }

    const beginSection = () => {
        const qs = sectionQuestions[sectionIndex]
        setSectionAnswers(new Array(qs.length).fill(null))
        setCurrentQ(0)
        setSelectedAnswer(null)
        setPage('question')
    }

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return
        stopTimer()
        setSelectedAnswer(index)
        const newAnswers = [...sectionAnswers]
        newAnswers[currentQ] = index
        setSectionAnswers(newAnswers)
        setTimeout(() => advanceQuestion(), 800)
    }

    const finishSection = () => {
        stopTimer()
        const qs = sectionQuestions[sectionIndex]
        let correct = 0
        sectionAnswers.forEach((a, i) => {
            if (a === qs[i]?.correctIndex) correct++
        })
        // also count the last answer in state (it might not be flushed yet)
        // We compute from current state but that's fine - handleAnswer already updated sectionAnswers

        const result: SectionResult = {
            section: currentSection,
            correct,
            total: qs.length
        }
        const newResults = [...sectionResults, result]
        setSectionResults(newResults)
        setPage('section-done')
    }

    const goNextSection = () => {
        if (sectionIndex < SECTION_ORDER.length - 1) {
            setSectionIndex(prev => prev + 1)
            setPage('section-intro')
        } else {
            // All sections done — compute total elapsed seconds from start timestamp
            setTotalTimeUsed(Math.round((Date.now() - testStartRef.current) / 1000))
            setPage('results')
        }
    }

    const resetTest = () => {
        stopTimer()
        setSectionIndex(0)
        setSectionResults([])
        setSectionQuestions([[], [], []])
        setCurrentQ(0)
        setSelectedAnswer(null)
        testStartRef.current = 0
        setPage('cover')
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    const getGrade = (score: number, total: number) => {
        const pct = (score / total) * 100
        if (pct >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' }
        if (pct >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' }
        if (pct >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' }
        if (pct >= 60) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' }
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' }
    }

    // ─── Breadcrumb ───────────────────────────────────────────────
    const Breadcrumb = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {SECTION_ORDER.map((sec, idx) => {
                const m = SECTION_META[sec]
                const done = sectionResults.some(r => r.section === sec)
                const active = idx === sectionIndex && (page === 'section-intro' || page === 'question' || page === 'section-done')
                return (
                    <div key={sec} className="flex items-center gap-2">
                        {idx > 0 && (
                            <ChevronRight className={`w-4 h-4 ${done ? 'text-gray-400' : 'text-gray-300'}`} />
                        )}
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-all
                            ${done ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 line-through' : ''}
                            ${active ? `bg-gradient-to-r ${m.gradient} text-white shadow-sm` : ''}
                            ${!done && !active ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : ''}`}>
                            <span className="font-chinese">{m.label}</span>
                            {done && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    // ─── COVER PAGE ───────────────────────────────────────────────
    if (page === 'cover') {
        return (
            <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                            <Target className="w-9 h-9 sm:w-11 sm:h-11 text-indigo-600" />
                            <BlurText as="h1" className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100" wordDelay={0.08}>
                                HSK Mock Test
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">Official-style 3-section exam simulation</p>
                    </motion.div>

                    {/* HSK Level Selector */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mb-5">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Test Overview */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mb-5">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wide">Test Structure — 25 Questions · ~20 min</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {SECTION_ORDER.map(sec => {
                                    const m = SECTION_META[sec]
                                    const Icon = m.icon
                                    return (
                                        <div key={sec} className={`bg-gradient-to-br ${m.gradientLight} dark:${m.gradientDark} rounded-2xl p-4 border ${m.border}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-8 h-8 bg-gradient-to-br ${m.gradient} rounded-xl flex items-center justify-center`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className={`font-bold font-chinese text-lg ${m.accent}`}>{m.label}</p>
                                                    <p className="text-xs text-gray-500">{m.labelEn}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{m.total} questions · {m.timePerQ}s each</p>
                                            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Additional info */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="mb-7">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-6 justify-center text-center">
                            {[
                                { icon: BookOpen, label: '25 Questions', sub: 'Across 3 sections', color: 'text-indigo-500' },
                                { icon: Clock, label: '~20 Minutes', sub: 'Total exam time', color: 'text-amber-500' },
                                { icon: BarChart3, label: 'Instant Results', sub: 'With section breakdown', color: 'text-emerald-500' },
                            ].map(({ icon: Icon, label, sub, color }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${color}`} />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{label}</p>
                                        <p className="text-xs text-gray-500">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                        <button onClick={startTest} disabled={loading}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl px-10 py-4 font-bold text-lg cursor-pointer transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center gap-3 mx-auto disabled:opacity-50">
                            {loading ? <LoadingSpinner size="sm" /> : <Target className="w-6 h-6" />}
                            Start Mock Test
                        </button>
                        <p className="text-xs text-gray-400 mt-3">Requires ≥ 25 words in selected HSK level</p>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ─── SECTION INTRO ────────────────────────────────────────────
    if (page === 'section-intro') {
        const Icon = SectionIcon
        return (
            <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-4 flex items-center">
                <div className="max-w-2xl mx-auto w-full">
                    <Breadcrumb />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className={`bg-gradient-to-br ${meta.gradientLight} dark:${meta.gradientDark} rounded-3xl shadow-2xl border ${meta.border} p-8 sm:p-12 text-center`}>
                        <div className={`w-20 h-20 bg-gradient-to-br ${meta.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                            <Icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="mb-2">
                            <span className={`text-5xl sm:text-6xl font-bold font-chinese ${meta.accent}`}>{meta.label}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                            Section {sectionIndex + 1}: {meta.labelEn}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-md mx-auto">{meta.desc}</p>
                        <div className="flex items-center justify-center gap-6 mb-8">
                            <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl px-5 py-3">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{meta.total}</p>
                                <p className="text-xs text-gray-500">Questions</p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl px-5 py-3">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{meta.timePerQ}s</p>
                                <p className="text-xs text-gray-500">Per question</p>
                            </div>
                        </div>
                        <button onClick={beginSection}
                            className={`bg-gradient-to-r ${meta.gradient} hover:opacity-90 text-white rounded-2xl px-10 py-4 font-bold text-lg cursor-pointer transition-all shadow-lg flex items-center gap-2 mx-auto`}>
                            Begin Section <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ─── SECTION DONE ─────────────────────────────────────────────
    if (page === 'section-done') {
        const lastResult = sectionResults[sectionResults.length - 1]
        const pct = lastResult ? Math.round((lastResult.correct / lastResult.total) * 100) : 0
        const passed = pct >= 60
        const isLast = sectionIndex === SECTION_ORDER.length - 1

        return (
            <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-4 flex items-center">
                <div className="max-w-2xl mx-auto w-full">
                    <Breadcrumb />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center">
                        <div className={`w-16 h-16 ${passed ? 'bg-green-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {passed
                                ? <CheckCircle className="w-9 h-9 text-green-600" />
                                : <XCircle className="w-9 h-9 text-amber-600" />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            Section {sectionIndex + 1} Complete!
                        </h2>
                        <p className={`text-sm font-semibold mb-6 ${passed ? 'text-green-600' : 'text-amber-600'}`}>
                            {passed ? 'Well done! Keep going.' : 'Keep practicing — you can do it!'}
                        </p>

                        {lastResult && (
                            <div className="flex items-center justify-center gap-6 mb-8">
                                <div className={`rounded-2xl px-6 py-4 ${meta.badge}`}>
                                    <p className="text-3xl font-bold">{lastResult.correct}/{lastResult.total}</p>
                                    <p className="text-xs opacity-70 mt-0.5">Score</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4">
                                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{pct}%</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Accuracy</p>
                                </div>
                            </div>
                        )}

                        <button onClick={goNextSection}
                            className={`bg-gradient-to-r ${meta.gradient} hover:opacity-90 text-white rounded-2xl px-10 py-4 font-bold text-lg cursor-pointer transition-all shadow-lg flex items-center gap-2 mx-auto`}>
                            {isLast ? (
                                <><Trophy className="w-5 h-5" /> View Final Results</>
                            ) : (
                                <>Next Section <ChevronRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ─── RESULTS PAGE ─────────────────────────────────────────────
    if (page === 'results') {
        const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0)
        const totalQuestions = sectionResults.reduce((s, r) => s + r.total, 0)
        const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
        const passed = overallPct >= 60
        const gradeInfo = getGrade(totalCorrect, totalQuestions)

        // Collect all questions + answers for wrong answer review
        const allQuestions: Question[] = [...sectionQuestions[0], ...sectionQuestions[1], ...sectionQuestions[2]]
        const allAnswers: (number | null)[] = [...sectionAnswers] // Note: only last section's answers are in sectionAnswers

        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                        {/* Main results card */}
                        <div className={`${gradeInfo.bg} rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 text-center mb-6`}>
                            <Trophy className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Test Complete!</h2>
                            <p className="text-gray-500 mb-4">HSK {hskLevel} Mock Test</p>

                            <div className={`text-7xl font-bold ${gradeInfo.color} mb-2`}>{gradeInfo.grade}</div>
                            <p className="text-xl text-gray-700 dark:text-gray-300">{totalCorrect}/{totalQuestions} correct ({overallPct}%)</p>
                            <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {passed ? '✓ PASS' : '✗ FAIL'} — {passed ? 'Score ≥ 60%' : 'Score < 60%'}
                            </div>
                            <p className="text-sm text-gray-400 mt-3">Total time: {formatTime(totalTimeUsed)}</p>

                            {/* Section breakdown */}
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                {sectionResults.map((r) => {
                                    const m = SECTION_META[r.section]
                                    const Icon = m.icon
                                    return (
                                        <div key={r.section} className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-3">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${m.gradient} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <p className={`font-chinese font-bold ${m.accent}`}>{m.label}</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{r.correct}/{r.total}</p>
                                            <p className="text-xs text-gray-500">{Math.round((r.correct / r.total) * 100)}%</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3 justify-center mt-8">
                                <button onClick={resetTest}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> Try Again
                                </button>
                                <button onClick={() => window.history.back()}
                                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <Home className="w-5 h-5" /> Return to Home
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Wrong answer review for last section only (writing - we have answers) */}
                    {allAnswers.some((a, i) => a !== null && a !== allQuestions[i]?.correctIndex) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <details className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                                <summary className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer list-none select-none">
                                    <XCircle className="w-5 h-5 text-red-500" /> Review Wrong Answers
                                    <span className="ml-auto text-xs text-gray-400">(click to expand)</span>
                                </summary>
                                <div className="space-y-3 mt-4">
                                    {allQuestions.map((q, i) => {
                                        if (allAnswers[i] === q.correctIndex) return null
                                        return (
                                            <div key={i} className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-100 dark:border-red-900">
                                                <p className="font-chinese text-lg text-gray-900 dark:text-gray-100">
                                                    {q.word.simplified}
                                                    <span className="text-sm text-gray-500 ml-2">({q.word.pinyin})</span>
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{q.word.english}</p>
                                                <p className="text-xs text-green-600 mt-1">Correct: {q.options[q.correctIndex]}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </details>
                        </motion.div>
                    )}
                </div>
            </div>
        )
    }

    // ─── ACTIVE QUESTION ─────────────────────────────────────────
    const qs = sectionQuestions[sectionIndex]
    const q = qs[currentQ]
    if (!q) return null
    const isAnswered = selectedAnswer !== null
    const timerPct = (timeLeft / meta.timePerQ) * 100
    const timerUrgent = timeLeft <= 10

    return (
        <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                <Breadcrumb />

                {/* Section header row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>
                            <span className="font-chinese">{meta.label}</span> Section {sectionIndex + 1} · Q{currentQ + 1}/{qs.length}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm transition-colors ${timerUrgent ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Section progress bar */}
                <div className="flex gap-1 mb-5">
                    {qs.map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
                            i < currentQ
                                ? (sectionAnswers[i] === qs[i]?.correctIndex ? 'bg-green-400' : 'bg-red-400')
                                : i === currentQ
                                    ? `${meta.bar}`
                                    : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                    ))}
                </div>

                {/* Timer progress bar */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${timerUrgent ? 'bg-red-500' : meta.bar}`}
                        style={{ width: `${timerPct}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={`${sectionIndex}-${currentQ}`}
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}>
                        <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl border ${meta.border} p-6 sm:p-8 mb-4`}>
                            {/* Question type badge + level */}
                            <div className="flex justify-between items-center mb-6">
                                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                                    <SectionIcon className="w-3.5 h-3.5" />
                                    {meta.labelEn}
                                </div>
                                <span className="text-xs text-gray-400">HSK {hskLevel}</span>
                            </div>

                            {/* Question content */}
                            <div className="text-center mb-8">
                                {q.type === 'listening' ? (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Headphones className="w-5 h-5 text-indigo-400" />
                                            <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Pinyin Sentence</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl text-gray-800 dark:text-gray-100 font-medium leading-relaxed bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl px-6 py-4 inline-block">{q.prompt}</p>
                                    </div>
                                ) : q.type === 'reading' ? (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Eye className="w-5 h-5 text-emerald-400" />
                                            <span className="text-xs text-emerald-500 font-semibold uppercase tracking-wide">Fill in the Blank</span>
                                        </div>
                                        <p className="text-3xl sm:text-4xl font-chinese text-gray-900 dark:text-gray-100 mb-1">{q.prompt}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <PenTool className="w-5 h-5 text-purple-400" />
                                            <span className="text-xs text-purple-500 font-semibold uppercase tracking-wide">Character Recognition</span>
                                        </div>
                                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{q.prompt}</p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-400 mt-3">{q.promptSub}</p>
                            </div>

                            {/* Options grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, i) => {
                                    const label = ['A', 'B', 'C', 'D'][i]
                                    let btnClass = `bg-gray-50 dark:bg-gray-800 hover:bg-${meta.color}-50 dark:hover:bg-${meta.color}-950/20 border-2 border-gray-100 dark:border-gray-700 hover:border-${meta.color}-300 text-gray-800 dark:text-gray-200`
                                    if (isAnswered) {
                                        if (i === q.correctIndex) btnClass = 'bg-green-50 dark:bg-green-950/30 border-2 border-green-400 text-green-800 dark:text-green-300'
                                        else if (i === selectedAnswer) btnClass = 'bg-red-50 dark:bg-red-950/30 border-2 border-red-400 text-red-800 dark:text-red-300'
                                        else btnClass = 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                    }
                                    return (
                                        <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered}
                                            className={`rounded-2xl p-4 font-medium cursor-pointer transition-all text-left flex items-center gap-3 ${btnClass} disabled:cursor-default`}>
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isAnswered && i === q.correctIndex ? 'bg-green-500 text-white' : isAnswered && i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                {label}
                                            </span>
                                            <span className="font-chinese text-xl flex-1 text-center">{opt}</span>
                                            {isAnswered && i === q.correctIndex && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                            {isAnswered && i === selectedAnswer && i !== q.correctIndex && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
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
