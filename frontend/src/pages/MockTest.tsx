import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playTTS } from '@/utils/ttsHelper'
import { vocabularyApi } from '@/services/api'
import { SessionSkeleton } from '@/components/ui/Skeleton'
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
    PenTool,
    Volume2,
    Play
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { shuffle } from '@/utils/shuffle'
import { useTranslation } from 'react-i18next'
import BlurText from '@/components/animations/BlurText'

type TestSection = 'listening' | 'reading' | 'writing'

// Question subtypes — maps closely to real HSK skill areas
type QuestionSubtype =
    | 'listen-pinyin-pick-chinese'   // See pinyin sentence + hear target word → pick Chinese char
    | 'listen-chinese-pick-english'  // Hear Chinese word spoken → pick English meaning
    | 'read-fill-blank'              // Chinese sentence with ___ → pick Chinese word
    | 'read-match-meaning'           // See Chinese word → pick English meaning
    | 'write-pick-character'         // English meaning + pinyin hint → pick Chinese char
    | 'write-pick-pinyin'            // See Chinese character → pick correct pinyin

interface Question {
    type: TestSection
    subtype: QuestionSubtype
    prompt: string       // Main stimulus text
    promptSub: string    // Instruction or hint line
    audioText: string    // TTS text for listening questions (empty otherwise)
    options: string[]
    correctIndex: number
    word: HanziWord
}

interface SectionResult {
    section: TestSection
    correct: number
    total: number
}

// ── Sentence templates ────────────────────────────────────────────────────────
const SENTENCE_TEMPLATES = [
    '他是我的___。', '我喜欢___。', '她学___很努力。', '这是一个___。',
    '我每天___。', '他有一个___。', '我们去___吧。', '她喜欢吃___。',
    '我想学___。', '这个___很好。', '他在___工作。', '我的___很漂亮。',
    '我们需要___。', '她买了一个___。', '请问，___在哪里？',
    '今天的___很好吃。', '他给我一个___。', '我在___里看书。',
    '那个___很贵。', '我不喜欢___。', '他每天喝___。',
    '这是我的___朋友。', '她在___学习中文。', '我今天买了___。',
]

const PINYIN_TEMPLATES = [
    'Tā shì wǒ de ___.',
    'Wǒ xǐhuān ___.',
    'Zhè shì yīgè ___.',
    'Tā yǒu yīgè ___.',
    'Wǒmen qù ___ ba.',
    'Tā měitiān ___.',
    'Wǒ xiǎng xué ___.',
    'Tā gěi wǒ yīgè ___.',
    'Nàgè ___ hěn guì.',
    'Qǐngwèn, ___ zài nǎlǐ?',
    'Wǒ jīntiān mǎi le ___.',
    'Tā zài ___ xuéxí Zhōngwén.',
]

// ── Question builders ─────────────────────────────────────────────────────────
function buildListeningQuestion(word: HanziWord, others: HanziWord[], idx: number): Omit<Question, 'type'> {
    if (idx % 2 === 0) {
        // Subtype A: Pinyin sentence shown + Chinese word spoken → pick Chinese char
        const tpl = PINYIN_TEMPLATES[Math.floor(Math.random() * PINYIN_TEMPLATES.length)]
        const prompt = tpl.replace('___', `[${word.pinyin}]`)
        const promptSub = 'Listen to the word, then choose the correct Chinese character'
        const correct = word.simplified
        const wrongs = others.slice(0, 3).map(o => o.simplified)
        const options = shuffle([correct, ...wrongs])
        return {
            subtype: 'listen-pinyin-pick-chinese',
            prompt, promptSub,
            audioText: word.simplified,
            options, correctIndex: options.indexOf(correct), word,
        }
    } else {
        // Subtype B: Hear Chinese word spoken → pick English meaning (no visual hint)
        const promptSub = 'Listen carefully and choose the correct English meaning'
        const correct = word.english
        const wrongs = others.slice(0, 3).map(o => o.english)
        const options = shuffle([correct, ...wrongs])
        return {
            subtype: 'listen-chinese-pick-english',
            prompt: '',
            promptSub,
            audioText: word.simplified,
            options, correctIndex: options.indexOf(correct), word,
        }
    }
}

function buildReadingQuestion(word: HanziWord, others: HanziWord[], idx: number): Omit<Question, 'type'> {
    if (idx % 3 !== 1) {
        // Subtype A (majority): Chinese sentence with blank → pick correct Chinese word
        const tpl = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)]
        const prompt = tpl
        const promptSub = `Meaning of the missing word: "${word.english}"`
        const correct = word.simplified
        const wrongs = others.slice(0, 3).map(o => o.simplified)
        const options = shuffle([correct, ...wrongs])
        return {
            subtype: 'read-fill-blank',
            prompt, promptSub, audioText: '',
            options, correctIndex: options.indexOf(correct), word,
        }
    } else {
        // Subtype B: See Chinese word → pick English meaning
        const prompt = word.simplified
        const promptSub = 'Choose the correct English meaning for this word'
        const correct = word.english
        const wrongs = others.slice(0, 3).map(o => o.english)
        const options = shuffle([correct, ...wrongs])
        return {
            subtype: 'read-match-meaning',
            prompt, promptSub, audioText: '',
            options, correctIndex: options.indexOf(correct), word,
        }
    }
}

function buildWritingQuestion(word: HanziWord, others: HanziWord[], idx: number): Omit<Question, 'type'> {
    if (idx % 2 === 0) {
        // Subtype A: English meaning + pinyin hint → pick Chinese character
        const prompt = word.english
        const promptSub = `Pinyin: ${word.pinyin}`
        const correct = word.simplified
        const wrongs = others.slice(0, 3).map(o => o.simplified)
        const options = shuffle([correct, ...wrongs])
        return {
            subtype: 'write-pick-character',
            prompt, promptSub, audioText: '',
            options, correctIndex: options.indexOf(correct), word,
        }
    } else {
        // Subtype B: See Chinese character → pick correct pinyin
        const prompt = word.simplified
        const promptSub = 'Choose the correct pinyin pronunciation'
        const correct = word.pinyin
        const wrongs = others.slice(0, 3)
            .map(o => o.pinyin)
            .filter(p => p !== correct)
        // Ensure exactly 3 unique wrong options
        while (wrongs.length < 3) wrongs.push(others[wrongs.length + 3]?.pinyin ?? `x${wrongs.length}`)
        const options = shuffle([correct, ...wrongs.slice(0, 3)])
        return {
            subtype: 'write-pick-pinyin',
            prompt, promptSub, audioText: '',
            options, correctIndex: options.indexOf(correct), word,
        }
    }
}

function generateSectionedQuestions(words: HanziWord[]): [Question[], Question[], Question[]] {
    const shuffled = shuffle(words)
    const listeningWords = shuffled.slice(0, 10)
    const readingWords = shuffled.slice(10, 20)
    const writingWords = shuffled.slice(20, 25)
    const getOthers = (word: HanziWord) =>
        shuffle(words.filter(w => w.id !== word.id))

    const listening: Question[] = listeningWords.map((w, i) => ({
        type: 'listening' as TestSection,
        ...buildListeningQuestion(w, getOthers(w), i),
    }))
    const reading: Question[] = readingWords.map((w, i) => ({
        type: 'reading' as TestSection,
        ...buildReadingQuestion(w, getOthers(w), i),
    }))
    const writing: Question[] = writingWords.map((w, i) => ({
        type: 'writing' as TestSection,
        ...buildWritingQuestion(w, getOthers(w), i),
    }))
    return [listening, reading, writing]
}

// ── Section metadata ──────────────────────────────────────────────────────────
const SECTION_META = {
    listening: {
        label: '听力', timePerQ: 45, total: 10,
        color: 'indigo', gradient: 'from-primary-500 to-blue-600',
        gradientLight: 'from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30',
        gradientDark: 'from-primary-950/30 to-blue-950/30',
        badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
        border: 'border-primary-200 dark:border-primary-800',
        accent: 'text-primary-600 dark:text-primary-400', bar: 'bg-primary-500', icon: Headphones,
    },
    reading: {
        label: '阅读', timePerQ: 30, total: 10,
        color: 'emerald', gradient: 'from-success-500 to-success-600',
        gradientLight: 'from-success-50 to-success-50 dark:from-success-950/30 dark:to-success-950/30',
        gradientDark: 'from-success-950/30 to-success-950/30',
        badge: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
        border: 'border-success-200 dark:border-success-800',
        accent: 'text-success-600 dark:text-success-400', bar: 'bg-success-500', icon: Eye,
    },
    writing: {
        label: '书写', timePerQ: 60, total: 5,
        color: 'purple', gradient: 'from-purple-500 to-violet-600',
        gradientLight: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
        gradientDark: 'from-purple-950/30 to-violet-950/30',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        accent: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500', icon: PenTool,
    },
}

const SECTION_ORDER: TestSection[] = ['listening', 'reading', 'writing']

type PageState = 'cover' | 'section-intro' | 'question' | 'section-done' | 'results'

// ── Component ─────────────────────────────────────────────────────────────────
export default function MockTest() {
    const { t } = useTranslation()
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

    // TTS
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Track all answers across sections for result review
    const allAnswersRef = useRef<(number | null)[][]>([[], [], []])
    // Track current section answers via ref to avoid stale closure issues
    const answersRef = useRef<(number | null)[]>([])

    // Local countdown timer
    const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const testStartRef = useRef<number>(0)

    const currentSection = SECTION_ORDER[sectionIndex]
    const meta = SECTION_META[currentSection]
    const SectionIcon = meta.icon

    // Stop timer on unmount
    useEffect(() => {
        return () => {
            if (timerIdRef.current) clearInterval(timerIdRef.current)
        }
    }, [])

    // ── TTS helpers ───────────────────────────────────────────────────────────
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const stopSpeech = useCallback(() => {
        audioRef.current?.pause()
        audioRef.current = null
        setIsSpeaking(false)
    }, [])

    const speakText = useCallback(async (text: string) => {
        stopSpeech()
        setIsSpeaking(true)
        try {
            // playTTS already starts playback — don't call play() twice
            const audio = await playTTS({ text, speakingRate: 0.85, retries: 1 })
            audioRef.current = audio
            audio.onended = () => setIsSpeaking(false)
            audio.onerror = () => setIsSpeaking(false)
        } catch {
            // Last resort: browser speechSynthesis so listening questions never go silent
            try {
                const utter = new SpeechSynthesisUtterance(text)
                utter.lang = 'zh-CN'
                utter.onend = () => setIsSpeaking(false)
                utter.onerror = () => setIsSpeaking(false)
                speechSynthesis.cancel()
                speechSynthesis.speak(utter)
            } catch {
                setIsSpeaking(false)
            }
        }
    }, [stopSpeech])

    // Auto-play TTS for listening questions when question changes
    useEffect(() => {
        if (page !== 'question') return
        const q = sectionQuestions[sectionIndex]?.[currentQ]
        if (!q?.audioText || q.type !== 'listening') return
        const timer = setTimeout(() => speakText(q.audioText), 600)
        return () => {
            clearTimeout(timer)
            stopSpeech()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQ, sectionIndex, page])

    // ── Question countdown (local interval — reliable, no backend dependency) ──
    const stopTimer = () => {
        if (timerIdRef.current) {
            clearInterval(timerIdRef.current)
            timerIdRef.current = null
        }
    }

    const autoAdvance = () => {
        // Mark current question as timed-out (-1)
        answersRef.current[currentQ] = -1
        setSelectedAnswer(-1)
        setTimeout(() => advanceQuestion(), 800)
    }

    const advanceQuestion = () => {
        const qs = sectionQuestions[sectionIndex]
        setSelectedAnswer(null)
        if (currentQ < qs.length - 1) {
            setCurrentQ(prev => prev + 1)
        } else {
            finishSection()
        }
    }

    // Interval callbacks must see the LATEST autoAdvance (fresh state), not the
    // closure from the render that created the interval
    const autoAdvanceRef = useRef(autoAdvance)
    autoAdvanceRef.current = autoAdvance

    // (Re)start countdown when the question changes
    useEffect(() => {
        if (page !== 'question') return
        stopTimer()
        let remaining = meta.timePerQ
        setTimeLeft(remaining)
        const id = setInterval(() => {
            remaining -= 1
            setTimeLeft(remaining)
            if (remaining <= 0) {
                clearInterval(id)
                if (timerIdRef.current === id) timerIdRef.current = null
                autoAdvanceRef.current()
            }
        }, 1000)
        timerIdRef.current = id
        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQ, sectionIndex, page])

    // ── Test flow ─────────────────────────────────────────────────────────────
    const startTest = async () => {
        setLoading(true)
        try {
            const words = await vocabularyApi.getByHSKLevel(hskLevel)
            if (words.length < 25) {
                toast.error(t('mockTest.toasts.notEnough'))
                return
            }
            const [l, r, w] = generateSectionedQuestions(words)
            setSectionQuestions([l, r, w])
            setSectionIndex(0)
            setSectionResults([])
            setTotalTimeUsed(0)
            allAnswersRef.current = [[], [], []]
            testStartRef.current = Date.now()
            setPage('section-intro')
        } catch {
            toast.error(t('mockTest.toasts.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const beginSection = () => {
        const qs = sectionQuestions[sectionIndex]
        const blank = new Array(qs.length).fill(null) as (number | null)[]
        setSectionAnswers(blank)
        answersRef.current = [...blank]
        setCurrentQ(0)
        setSelectedAnswer(null)
        setPage('question')
    }

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return
        stopTimer()
        stopSpeech()
        // Update both ref (immediate) and state (for display)
        answersRef.current[currentQ] = index
        const newAnswers = [...sectionAnswers]
        newAnswers[currentQ] = index
        setSectionAnswers(newAnswers)
        setSelectedAnswer(index)
        setTimeout(() => advanceQuestion(), 800)
    }

    // Keyboard: 1-4 atau A-D memilih opsi (badge A/B/C/D di tiap opsi
    // sekaligus jadi petunjuk tombolnya). Hanya aktif di layar soal & sebelum menjawab.
    useEffect(() => {
        if (page !== 'question' || selectedAnswer !== null) return
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return
            const q = sectionQuestions[sectionIndex]?.[currentQ]
            if (!q) return
            let idx = -1
            if (['1', '2', '3', '4'].includes(e.key)) idx = Number(e.key) - 1
            else {
                const k = e.key.toLowerCase()
                if (['a', 'b', 'c', 'd'].includes(k)) idx = ['a', 'b', 'c', 'd'].indexOf(k)
            }
            if (idx >= 0 && idx < q.options.length) handleAnswer(idx)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, selectedAnswer, currentQ, sectionIndex, sectionQuestions])

    const finishSection = () => {
        stopTimer()
        stopSpeech()
        const qs = sectionQuestions[sectionIndex]
        const answers = answersRef.current
        // Persist for review
        allAnswersRef.current[sectionIndex] = [...answers]

        let correct = 0
        answers.forEach((a, i) => {
            if (a === qs[i]?.correctIndex) correct++
        })
        const result: SectionResult = { section: currentSection, correct, total: qs.length }
        setSectionResults(prev => [...prev, result])
        setPage('section-done')
    }

    const goNextSection = () => {
        if (sectionIndex < SECTION_ORDER.length - 1) {
            setSectionIndex(prev => prev + 1)
            setPage('section-intro')
        } else {
            setTotalTimeUsed(Math.round((Date.now() - testStartRef.current) / 1000))
            setPage('results')
        }
    }

    const resetTest = () => {
        stopTimer()
        stopSpeech()
        setSectionIndex(0)
        setSectionResults([])
        setSectionQuestions([[], [], []])
        setCurrentQ(0)
        setSelectedAnswer(null)
        allAnswersRef.current = [[], [], []]
        answersRef.current = []
        testStartRef.current = 0
        setPage('cover')
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    const getGrade = (score: number, total: number) => {
        const pct = (score / total) * 100
        if (pct >= 90) return { grade: 'A+', color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/30' }
        if (pct >= 80) return { grade: 'A', color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/30' }
        if (pct >= 70) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' }
        if (pct >= 60) return { grade: 'C', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' }
        return { grade: 'D', color: 'text-error-600 dark:text-error-400', bg: 'bg-error-50 dark:bg-error-950/30' }
    }

    // ── Breadcrumb ────────────────────────────────────────────────────────────
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
                            {done && <CheckCircle className="w-3.5 h-3.5 text-success-500" />}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    // Assembling the test — skeleton of the upcoming questions
    if (loading && page === 'cover') {
        return <SessionSkeleton />
    }

    // ── COVER PAGE ────────────────────────────────────────────────────────────
    if (page === 'cover') {
        return (
            <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                            <Target className="w-9 h-9 sm:w-11 sm:h-11 text-primary-600 dark:text-primary-400" />
                            <BlurText as="h1" className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100" wordDelay={0.08}>
                                HSK Mock Test
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">{t('mockTest.subtitle')}</p>
                    </motion.div>

                    {/* HSK Level Selector */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mb-5">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('mockTest.selectLevel')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Test Overview */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mb-5">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wide">{t('mockTest.structure')}</h4>
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
                                                    <p className="text-xs text-gray-500">{t(`mockTest.sections.${sec}.label`)}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{t('mockTest.questionsEach', { total: m.total, sec: m.timePerQ })}</p>
                                            <p className="text-xs text-gray-500 mt-1">{t(`mockTest.sections.${sec}.desc`)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* TTS notice */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className="mb-5">
                        <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            <p className="text-sm text-primary-700 dark:text-primary-300">
                                <strong>{t('mockTest.listeningLabel')}</strong> {t('mockTest.audioNotice')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Additional info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-7">
                        <div className="bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-6 justify-center text-center">
                            {[
                                { icon: BookOpen, label: t('mockTest.cardQuestions'), sub: t('mockTest.cardQuestionsSub'), color: 'text-primary-500' },
                                { icon: Clock, label: t('mockTest.cardMinutes'), sub: t('mockTest.cardMinutesSub'), color: 'text-amber-500' },
                                { icon: BarChart3, label: t('mockTest.cardResults'), sub: t('mockTest.cardResultsSub'), color: 'text-success-500' },
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
                            className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-2xl px-10 py-4 font-bold text-lg cursor-pointer transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900/30 flex items-center gap-3 mx-auto disabled:opacity-50">
                            <Target className="w-6 h-6" />
                            Start Mock Test
                        </button>
                        <p className="text-xs text-gray-400 mt-3">{t('mockTest.requirement')}</p>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ── SECTION INTRO ─────────────────────────────────────────────────────────
    if (page === 'section-intro') {
        const Icon = SectionIcon
        const subtypeDescriptions: Record<TestSection, string[]> = {
            listening: [
                'Listen to a Chinese word, then choose the correct Chinese character',
                'Hear a spoken word and match it to its English meaning',
            ],
            reading: [
                'Read a Chinese sentence and fill in the blank',
                'See a Chinese word and choose its English meaning',
            ],
            writing: [
                'Given the English meaning and pinyin, select the correct Chinese character',
                'See a Chinese character and choose the correct pinyin pronunciation',
            ],
        }
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
                            {t('mockTest.section')} {sectionIndex + 1}: {t(`mockTest.sections.${currentSection}.label`)}
                        </h2>

                        {/* Question types in this section */}
                        <div className="space-y-2 mb-6 text-left max-w-sm mx-auto">
                            {subtypeDescriptions[currentSection].map((desc, i) => (
                                <div key={i} className="flex items-start gap-2 bg-white/70 dark:bg-gray-800/50 rounded-xl px-4 py-2">
                                    <span className={`w-5 h-5 rounded-full ${meta.badge} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-6 mb-8">
                            <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl px-5 py-3">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{meta.total}</p>
                                <p className="text-xs text-gray-500">{t('mockTest.questions')}</p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl px-5 py-3">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{meta.timePerQ}s</p>
                                <p className="text-xs text-gray-500">{t('mockTest.perQuestion')}</p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl px-5 py-3">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">60%</p>
                                <p className="text-xs text-gray-500">{t('mockTest.passScore')}</p>
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

    // ── SECTION DONE ──────────────────────────────────────────────────────────
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
                        <div className={`w-16 h-16 ${passed ? 'bg-success-100 dark:bg-success-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {passed
                                ? <CheckCircle className="w-9 h-9 text-success-600 dark:text-success-400" />
                                : <XCircle className="w-9 h-9 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {t(`mockTest.sections.${currentSection}.label`)} {t('mockTest.sectionComplete')}
                        </h2>
                        <p className={`text-sm font-semibold mb-6 ${passed ? 'text-success-600 dark:text-success-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {passed ? t('mockTest.sectionPassed') : t('mockTest.sectionFailed')}
                        </p>

                        {lastResult && (
                            <div className="flex items-center justify-center gap-6 mb-8">
                                <div className={`rounded-2xl px-6 py-4 ${meta.badge}`}>
                                    <p className="text-3xl font-bold">{lastResult.correct}/{lastResult.total}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{t('mockTest.score')}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4">
                                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{pct}%</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{t('mockTest.accuracy')}</p>
                                </div>
                                <div className={`rounded-2xl px-6 py-4 ${passed ? 'bg-success-50 dark:bg-success-950/30' : 'bg-error-50 dark:bg-error-950/30'}`}>
                                    <p className={`text-3xl font-bold ${passed ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>{passed ? t('mockTest.pass') : t('mockTest.fail')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{t('mockTest.needed')}</p>
                                </div>
                            </div>
                        )}

                        <button onClick={goNextSection}
                            className={`bg-gradient-to-r ${meta.gradient} hover:opacity-90 text-white rounded-2xl px-10 py-4 font-bold text-lg cursor-pointer transition-all shadow-lg flex items-center gap-2 mx-auto`}>
                            {isLast ? (
                                <><Trophy className="w-5 h-5" /> {t('mockTest.viewFinal')}</>
                            ) : (
                                <>{t('mockTest.nextSection')} <ChevronRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ── RESULTS PAGE ──────────────────────────────────────────────────────────
    if (page === 'results') {
        const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0)
        const totalQuestions = sectionResults.reduce((s, r) => s + r.total, 0)
        const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
        // Real HSK: must pass ALL sections (≥ 60% each)
        const allSectionsPassed = sectionResults.every(r => (r.correct / r.total) >= 0.6)
        const gradeInfo = getGrade(totalCorrect, totalQuestions)

        const allQs = [...sectionQuestions[0], ...sectionQuestions[1], ...sectionQuestions[2]]
        const allAns = [
            ...allAnswersRef.current[0],
            ...allAnswersRef.current[1],
            ...allAnswersRef.current[2],
        ]

        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                        {/* Main results card */}
                        <div className={`${gradeInfo.bg} rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 text-center mb-6`}>
                            <Trophy className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t('mockTest.testComplete')}</h2>
                            <p className="text-gray-500 mb-4">HSK {hskLevel} Mock Test</p>

                            <div className={`text-7xl font-bold ${gradeInfo.color} mb-2`}>{gradeInfo.grade}</div>
                            <p className="text-xl text-gray-700 dark:text-gray-300">{totalCorrect}/{totalQuestions} correct ({overallPct}%)</p>
                            <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-bold ${allSectionsPassed ? 'bg-success-100 dark:bg-success-950/40 text-success-700 dark:text-success-300' : 'bg-error-100 dark:bg-error-950/40 text-error-700 dark:text-error-300'}`}>
                                {allSectionsPassed ? '✓ PASS' : '✗ FAIL'} — {allSectionsPassed ? 'All sections ≥ 60%' : 'Some sections below 60%'}
                            </div>
                            <p className="text-sm text-gray-400 mt-3">Total time: {formatTime(totalTimeUsed)}</p>

                            {/* Section breakdown */}
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                {sectionResults.map((r) => {
                                    const m = SECTION_META[r.section]
                                    const Icon = m.icon
                                    const secPct = Math.round((r.correct / r.total) * 100)
                                    const secPassed = secPct >= 60
                                    return (
                                        <div key={r.section} className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-3">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${m.gradient} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <p className={`font-chinese font-bold ${m.accent}`}>{m.label}</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{r.correct}/{r.total}</p>
                                            <p className="text-xs text-gray-500">{secPct}%</p>
                                            <span className={`text-xs font-semibold ${secPassed ? 'text-success-600 dark:text-success-400' : 'text-error-500'}`}>
                                                {secPassed ? '✓ Pass' : '✗ Fail'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3 justify-center mt-8">
                                <button onClick={resetTest}
                                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> Try Again
                                </button>
                                <button onClick={() => window.history.back()}
                                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <Home className="w-5 h-5" /> Return to Home
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Wrong answer review — all sections */}
                    {allAns.some((a, i) => a !== null && a !== allQs[i]?.correctIndex) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <details className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                                <summary className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer list-none select-none">
                                    <XCircle className="w-5 h-5 text-error-500" /> Review Wrong Answers
                                    <span className="ml-auto text-xs text-gray-400">(click to expand)</span>
                                </summary>
                                <div className="space-y-3 mt-4">
                                    {allQs.map((q, i) => {
                                        if (allAns[i] === q.correctIndex) return null
                                        const m = SECTION_META[q.type]
                                        return (
                                            <div key={i} className="bg-error-50 dark:bg-error-950/20 rounded-xl p-3 border border-error-100 dark:border-error-900">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badge}`}>{t(`mockTest.sections.${q.type}.label`)}</span>
                                                    {allAns[i] === -1 && <span className="text-xs text-amber-600 font-semibold dark:text-amber-400">{t('mockTest.timedOut')}</span>}
                                                </div>
                                                <p className="font-chinese text-lg text-gray-900 dark:text-gray-100">
                                                    {q.word.simplified}
                                                    <span className="text-sm text-gray-500 ml-2">({q.word.pinyin})</span>
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{q.word.english}</p>
                                                <p className="text-xs text-success-600 mt-1 dark:text-success-400">
                                                    Correct answer: <strong>{q.options[q.correctIndex]}</strong>
                                                </p>
                                                {allAns[i] !== null && allAns[i] !== -1 && allAns[i] !== q.correctIndex && (
                                                    <p className="text-xs text-error-500">
                                                        Your answer: <strong>{q.options[allAns[i] as number]}</strong>
                                                    </p>
                                                )}
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

    // ── ACTIVE QUESTION ───────────────────────────────────────────────────────
    const qs = sectionQuestions[sectionIndex]
    const q = qs[currentQ]
    if (!q) return null

    const isAnswered = selectedAnswer !== null
    const timerPct = (timeLeft / meta.timePerQ) * 100
    const timerUrgent = timeLeft <= 10

    // Determine if options are Chinese characters (use font-chinese + large text)
    const optionsAreChinese = q.subtype === 'listen-pinyin-pick-chinese' || q.subtype === 'read-fill-blank' || q.subtype === 'write-pick-character'
    const optionsAreEnglish = q.subtype === 'listen-chinese-pick-english' || q.subtype === 'read-match-meaning'
    const optionsArePinyin = q.subtype === 'write-pick-pinyin'

    return (
        <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                <Breadcrumb />

                {/* Section header row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>
                            <span className="font-chinese">{meta.label}</span> {t('mockTest.section')} {sectionIndex + 1} · Q{currentQ + 1}/{qs.length}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm transition-colors ${timerUrgent ? 'bg-error-100 dark:bg-error-950/30 text-error-700 dark:text-error-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Section progress dots */}
                <div className="flex gap-1 mb-4">
                    {qs.map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
                            i < currentQ
                                ? (sectionAnswers[i] === qs[i]?.correctIndex ? 'bg-success-400' : 'bg-error-400')
                                : i === currentQ
                                    ? `${meta.bar}`
                                    : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                    ))}
                </div>

                {/* Timer bar */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${timerUrgent ? 'bg-error-500' : meta.bar}`}
                        style={{ width: `${timerPct}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={`${sectionIndex}-${currentQ}`}
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}>
                        <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl border ${meta.border} p-6 sm:p-8 mb-4`}>
                            {/* Section badge + level */}
                            <div className="flex justify-between items-center mb-6">
                                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                                    <SectionIcon className="w-3.5 h-3.5" />
                                    {t(`mockTest.sections.${currentSection}.label`)}
                                </div>
                                <span className="text-xs text-gray-400">HSK {hskLevel}</span>
                            </div>

                            {/* ── Question stimulus area ── */}
                            <div className="text-center mb-8">

                                {/* LISTENING subtypes */}
                                {q.subtype === 'listen-pinyin-pick-chinese' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Headphones className="w-5 h-5 text-primary-400" />
                                            <span className="text-xs text-primary-500 font-semibold uppercase tracking-wide">{t('mockTest.types.pinyinSentence')}</span>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-100 font-medium leading-relaxed bg-primary-50 dark:bg-primary-950/20 rounded-2xl px-6 py-4 inline-block mb-3">
                                            {q.prompt}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <button
                                                onClick={() => speakText(q.audioText)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isSpeaking ? 'bg-primary-600 text-white animate-pulse' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200'}`}
                                            >
                                                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                {isSpeaking ? 'Playing…' : 'Play Again'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {q.subtype === 'listen-chinese-pick-english' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <Headphones className="w-5 h-5 text-primary-400" />
                                            <span className="text-xs text-primary-500 font-semibold uppercase tracking-wide">{t('mockTest.types.listening')}</span>
                                        </div>
                                        {/* Big audio button — don't show the Chinese word to force listening */}
                                        <button
                                            onClick={() => speakText(q.audioText)}
                                            aria-label={t('mockTest.playAudio')}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all shadow-lg ${isSpeaking ? 'bg-primary-600 text-white scale-110 animate-pulse' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 hover:bg-primary-200 hover:scale-105'}`}
                                        >
                                            {isSpeaking ? <Volume2 className="w-10 h-10" /> : <Play className="w-10 h-10" />}
                                        </button>
                                        <p className="text-sm text-gray-400">
                                            {isSpeaking ? 'Playing audio…' : 'Tap to hear the word'}
                                        </p>
                                        {/* Reveal Chinese after answering */}
                                        {isAnswered && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="font-chinese text-4xl text-gray-800 dark:text-gray-100 mt-3"
                                            >
                                                {q.word.simplified}
                                                <span className="text-base text-gray-500 ml-2">({q.word.pinyin})</span>
                                            </motion.p>
                                        )}
                                    </div>
                                )}

                                {/* READING subtypes */}
                                {q.subtype === 'read-fill-blank' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Eye className="w-5 h-5 text-success-400" />
                                            <span className="text-xs text-success-500 font-semibold uppercase tracking-wide">{t('mockTest.types.fillBlank')}</span>
                                        </div>
                                        <p className="text-3xl sm:text-4xl font-chinese text-gray-900 dark:text-gray-100 mb-1 leading-relaxed">{q.prompt}</p>
                                    </div>
                                )}

                                {q.subtype === 'read-match-meaning' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Eye className="w-5 h-5 text-success-400" />
                                            <span className="text-xs text-success-500 font-semibold uppercase tracking-wide">{t('mockTest.types.matchMeaning')}</span>
                                        </div>
                                        <p className="text-5xl sm:text-6xl font-chinese text-gray-900 dark:text-gray-100 mb-2">{q.prompt}</p>
                                        <p className="text-base text-gray-500">{q.word.pinyin}</p>
                                    </div>
                                )}

                                {/* WRITING subtypes */}
                                {q.subtype === 'write-pick-character' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <PenTool className="w-5 h-5 text-purple-400" />
                                            <span className="text-xs text-purple-500 font-semibold uppercase tracking-wide">{t('mockTest.types.charRecognition')}</span>
                                        </div>
                                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{q.prompt}</p>
                                    </div>
                                )}

                                {q.subtype === 'write-pick-pinyin' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <PenTool className="w-5 h-5 text-purple-400" />
                                            <span className="text-xs text-purple-500 font-semibold uppercase tracking-wide">{t('mockTest.types.pinyinSelection')}</span>
                                        </div>
                                        <p className="text-6xl sm:text-7xl font-chinese text-gray-900 dark:text-gray-100 mb-2">{q.prompt}</p>
                                        <p className="text-sm text-gray-500">{q.word.english}</p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-400 mt-3">{q.promptSub}</p>
                            </div>

                            {/* ── Options grid ── */}
                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, i) => {
                                    const label = ['A', 'B', 'C', 'D'][i]
                                    let btnClass = `bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-${meta.color}-300`
                                    if (isAnswered) {
                                        if (i === q.correctIndex) btnClass = 'bg-success-50 dark:bg-success-950/30 border-2 border-success-400 text-success-800 dark:text-success-300'
                                        else if (i === selectedAnswer) btnClass = 'bg-error-50 dark:bg-error-950/30 border-2 border-error-400 text-error-800 dark:text-error-300'
                                        else btnClass = 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                                    }
                                    return (
                                        <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered}
                                            className={`rounded-2xl p-4 font-medium cursor-pointer transition-all text-left flex items-center gap-3 ${btnClass} disabled:cursor-default`}>
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isAnswered && i === q.correctIndex ? 'bg-success-500 text-white' : isAnswered && i === selectedAnswer ? 'bg-error-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                {label}
                                            </span>
                                            <span className={`flex-1 text-center ${optionsAreChinese ? 'font-chinese text-xl' : optionsAreEnglish ? 'text-sm' : optionsArePinyin ? 'text-base font-medium' : 'text-base'}`}>
                                                {opt}
                                            </span>
                                            {isAnswered && i === q.correctIndex && <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0 dark:text-success-400" />}
                                            {isAnswered && i === selectedAnswer && i !== q.correctIndex && <XCircle className="w-4 h-4 text-error-500 flex-shrink-0" />}
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



