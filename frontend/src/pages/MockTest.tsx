import { useState, useEffect, useRef } from 'react'
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
    BookOpen
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'

interface Question {
    type: 'meaning' | 'pinyin' | 'character'
    prompt: string
    promptSub: string
    options: string[]
    correctIndex: number
    word: HanziWord
}

function generateQuestions(words: HanziWord[]): Question[] {
    const questions: Question[] = []
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    const pool = shuffled.slice(0, Math.min(20, shuffled.length))

    for (const word of pool) {
        const typeRand = Math.floor(Math.random() * 3)
        const type: Question['type'] = typeRand === 0 ? 'meaning' : typeRand === 1 ? 'pinyin' : 'character'
        const others = words.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3)

        let prompt = ''
        let promptSub = ''
        let correct = ''
        let wrongs: string[] = []

        if (type === 'meaning') {
            prompt = word.simplified
            promptSub = 'What does this mean?'
            correct = word.english
            wrongs = others.map(o => o.english)
        } else if (type === 'pinyin') {
            prompt = word.simplified
            promptSub = 'What is the pinyin?'
            correct = word.pinyin
            wrongs = others.map(o => o.pinyin)
        } else {
            prompt = word.english
            promptSub = 'Which character?'
            correct = word.simplified
            wrongs = others.map(o => o.simplified)
        }

        const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
        const correctIndex = options.indexOf(correct)
        questions.push({ type, prompt, promptSub, options, correctIndex, word })
    }
    return questions
}

export default function MockTest() {
    const [hskLevel, setHskLevel] = useState(1)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQ, setCurrentQ] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [answers, setAnswers] = useState<(number | null)[]>([])
    const [testStarted, setTestStarted] = useState(false)
    const [testFinished, setTestFinished] = useState(false)
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    useEffect(() => {
        if (testStarted && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!)
                        finishTest()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => { if (timerRef.current) clearInterval(timerRef.current) }
        }
    }, [testStarted])

    const startTest = async () => {
        setLoading(true)
        try {
            const words = await vocabularyApi.getByHSKLevel(hskLevel)
            if (words.length < 8) {
                toast.error('Not enough vocabulary. Need at least 8 words.')
                return
            }
            const qs = generateQuestions(words)
            setQuestions(qs)
            setCurrentQ(0)
            setSelectedAnswer(null)
            setAnswers(new Array(qs.length).fill(null))
            setTestFinished(false)
            const time = qs.length * 15
            setTimeLeft(time)
            setTotalTime(time)
            setTestStarted(true)
        } catch {
            toast.error('Failed to load vocabulary')
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return
        setSelectedAnswer(index)
        const newAnswers = [...answers]
        newAnswers[currentQ] = index
        setAnswers(newAnswers)
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1)
                setSelectedAnswer(null)
            } else {
                finishTest()
            }
        }, 1000)
    }

    const finishTest = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setTestFinished(true)
        setTestStarted(false)
    }

    const getScore = () => {
        let correct = 0
        answers.forEach((a, i) => {
            if (a === questions[i]?.correctIndex) correct++
        })
        return correct
    }

    const getGrade = (score: number, total: number) => {
        const pct = (score / total) * 100
        if (pct >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        if (pct >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' }
        if (pct >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' }
        if (pct >= 60) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-50' }
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' }
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    // Landing
    if (!testStarted && !testFinished) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                            <BlurText as="h1" className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900" wordDelay={0.08}>
                                HSK Mock Test
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600">Timed vocabulary test — no AI, instant results</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Test Format</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><BookOpen className="w-4 h-4 text-indigo-600" /></div>
                                    <div><p className="font-medium text-gray-900">20 Questions</p><p className="text-sm text-gray-600">Meaning, pinyin, character</p></div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-purple-600" /></div>
                                    <div><p className="font-medium text-gray-900">Timed</p><p className="text-sm text-gray-600">15 sec per question</p></div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><BarChart3 className="w-4 h-4 text-green-600" /></div>
                                    <div><p className="font-medium text-gray-900">Instant Results</p><p className="text-sm text-gray-600">Grade + wrong answer review</p></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                        <button onClick={startTest} disabled={loading}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                            {loading ? <LoadingSpinner size="sm" /> : <Target className="w-6 h-6" />}
                            Start Mock Test
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Results
    if (testFinished) {
        const score = getScore()
        const total = questions.length
        const pct = Math.round((score / total) * 100)
        const gradeInfo = getGrade(score, total)
        const timeUsed = totalTime - timeLeft
        const wrongQs = questions.filter((_q, i) => answers[i] !== _q.correctIndex)

        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className={`${gradeInfo.bg} rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 text-center mb-6`}>
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Complete!</h2>
                            <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>{gradeInfo.grade}</div>
                            <p className="text-xl text-gray-700">{score}/{total} correct ({pct}%)</p>
                            <p className="text-sm text-gray-500 mt-1">Time used: {formatTime(timeUsed)}</p>

                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="bg-white/80 rounded-xl p-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-green-700">{score}</p>
                                    <p className="text-xs text-gray-600">Correct</p>
                                </div>
                                <div className="bg-white/80 rounded-xl p-3">
                                    <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-red-600">{total - score}</p>
                                    <p className="text-xs text-gray-600">Wrong</p>
                                </div>
                                <div className="bg-white/80 rounded-xl p-3">
                                    <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-indigo-700">{formatTime(timeUsed)}</p>
                                    <p className="text-xs text-gray-600">Time</p>
                                </div>
                            </div>

                            <button onClick={() => { setTestFinished(false); setTestStarted(false) }}
                                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                <RotateCcw className="w-5 h-5" /> Try Again
                            </button>
                        </div>
                    </motion.div>

                    {wrongQs.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" /> Review Wrong Answers
                                </h3>
                                <div className="space-y-3">
                                    {wrongQs.map((q, i) => (
                                        <div key={i} className="bg-red-50 rounded-xl p-3 border border-red-100">
                                            <p className="font-chinese text-lg text-gray-900">{q.word.simplified} <span className="text-sm text-gray-500">({q.word.pinyin})</span></p>
                                            <p className="text-sm text-gray-700">{q.word.english}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        )
    }

    // Active test
    const q = questions[currentQ]
    const isAnswered = selectedAnswer !== null

    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <span className="font-bold text-gray-900">Q{currentQ + 1}/{questions.length}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold ${timeLeft < 30 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex gap-1 mb-6">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < currentQ ? (answers[i] === questions[i].correctIndex ? 'bg-green-400' : 'bg-red-400')
                                : i === currentQ ? 'bg-indigo-500' : 'bg-gray-200'
                            }`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${q.type === 'meaning' ? 'bg-blue-100 text-blue-700'
                                        : q.type === 'pinyin' ? 'bg-purple-100 text-purple-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {q.type === 'meaning' ? 'Meaning' : q.type === 'pinyin' ? 'Pinyin' : 'Character'}
                                </span>
                                <span className="text-xs text-gray-400">HSK {hskLevel}</span>
                            </div>

                            <div className="text-center mb-6">
                                <p className={`${q.type === 'character' ? 'text-xl' : 'text-5xl font-chinese'} text-gray-900 mb-2`}>{q.prompt}</p>
                                <p className="text-sm text-gray-500">{q.promptSub}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, i) => {
                                    let btnClass = 'bg-gray-50 hover:bg-indigo-50 border-2 border-gray-100 hover:border-indigo-300 text-gray-800'
                                    if (isAnswered) {
                                        if (i === q.correctIndex) btnClass = 'bg-green-50 border-2 border-green-400 text-green-800'
                                        else if (i === selectedAnswer) btnClass = 'bg-red-50 border-2 border-red-400 text-red-800'
                                        else btnClass = 'bg-gray-50 border-2 border-gray-100 text-gray-400'
                                    }
                                    return (
                                        <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered}
                                            className={`rounded-2xl p-4 font-medium cursor-pointer transition-all text-center ${btnClass} disabled:cursor-default`}>
                                            <span className={q.type === 'character' ? 'text-2xl font-chinese' : ''}>{opt}</span>
                                            {isAnswered && i === q.correctIndex && <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />}
                                            {isAnswered && i === selectedAnswer && i !== q.correctIndex && <XCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />}
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
