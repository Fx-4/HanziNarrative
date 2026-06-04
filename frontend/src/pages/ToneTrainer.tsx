import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HanziWord } from '@/types'
import axios from 'axios'
import { getVoiceName } from '@/utils/voicePreference'
import { API_URL } from '@/lib/env'
import {
    Music,
    CheckCircle,
    XCircle,
    ArrowRight,
    Trophy,
    RotateCcw,
    Target,
    Volume2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'

const TONE_LABELS: Record<number, string> = {
    1: 'First (flat)',
    2: 'Second (rising)',
    3: 'Third (dip)',
    4: 'Fourth (falling)',
    5: 'Neutral',
}

const TONE_MARKS: Record<number, string> = {
    1: '\u0304', // macron
    2: '\u0301', // acute
    3: '\u030C', // caron
    4: '\u0300', // grave
    5: '',
}

function extractTone(pinyin: string): number {
    if (/[āēīōūǖ]/.test(pinyin)) return 1
    if (/[áéíóúǘ]/.test(pinyin)) return 2
    if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3
    if (/[àèìòùǜ]/.test(pinyin)) return 4
    return 5
}

function getFirstSyllableTone(pinyin: string): number {
    // Get tone of first syllable
    const parts = pinyin.split(/\s+/)
    return extractTone(parts[0] || pinyin)
}

interface ToneQuestion {
    word: HanziWord
    correctTone: number
    options: number[]
}

function generateToneQuestions(words: HanziWord[]): ToneQuestion[] {
    const questions: ToneQuestion[] = []
    const filtered = words.filter(w => {
        const tone = getFirstSyllableTone(w.pinyin)
        return tone >= 1 && tone <= 4
    })

    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 15)

    for (const word of shuffled) {
        const correctTone = getFirstSyllableTone(word.pinyin)
        const options = [1, 2, 3, 4]
        questions.push({ word, correctTone, options })
    }
    return questions
}

export default function ToneTrainer() {
    const [hskLevel, setHskLevel] = useState(1)
    const [questions, setQuestions] = useState<ToneQuestion[]>([])
    const [currentQ, setCurrentQ] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const startSession = async () => {
        setLoading(true)
        try {
            const words = await vocabularyApi.getByHSKLevel(hskLevel)
            if (words.length < 8) {
                toast.error('Not enough vocabulary for tone practice.')
                return
            }
            const qs = generateToneQuestions(words)
            if (qs.length === 0) {
                toast.error('No suitable words found.')
                return
            }
            setQuestions(qs)
            setCurrentQ(0)
            setScore(0)
            setSelected(null)
            setSessionStarted(true)
        } catch {
            toast.error('Failed to load vocabulary')
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (tone: number) => {
        if (selected !== null) return
        setSelected(tone)
        if (tone === questions[currentQ].correctTone) {
            setScore(prev => prev + 1)
        }
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1)
                setSelected(null)
            } else {
                setSessionStarted(false)
            }
        }, 1200)
    }

    const playWord = async (text: string) => {
        if (isPlaying) return
        setIsPlaying(true)

        // Try Google Cloud TTS first
        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                const response = await axios.post(
                    `${API_URL}/tts/synthesize`,
                    { text, language: 'cmn-CN', voice_name: getVoiceName(), speaking_rate: 0.75 },
                    { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
                )
                const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }))
                const audio = new Audio(url)
                audioRef.current = audio
                audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
                audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
                await audio.play()
                return
            } catch {
                // fall through to browser TTS
            }
        }

        // Browser TTS fallback
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-CN'
        utterance.rate = 0.7
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
    }

    // Landing
    if (!sessionStarted && questions.length === 0) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Music className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
                            <BlurText as="h1" className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100" wordDelay={0.08}>
                                Tone Trainer
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Identify the correct tone for each character</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">The Four Tones</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(t => (
                                    <div key={t} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
                                        <p className="text-2xl font-bold text-teal-700 mb-1">Tone {t}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{TONE_LABELS[t]}</p>
                                        <p className="text-lg text-gray-800 mt-1">ma{TONE_MARKS[t]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                        <button onClick={startSession} disabled={loading}
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                            {loading ? <LoadingSpinner size="sm" /> : <Music className="w-6 h-6" />}
                            Start Practice
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Results
    if (!sessionStarted && questions.length > 0) {
        const pct = Math.round((score / questions.length) * 100)
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-3xl shadow-xl border border-teal-200 dark:border-teal-800 p-6 sm:p-8 text-center">
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session Complete!</h2>
                            <p className="text-xl text-gray-700">{score}/{questions.length} correct ({pct}%)</p>
                            <div className="flex justify-center gap-3 mt-6">
                                <button onClick={() => { setQuestions([]); setSessionStarted(false) }}
                                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> New Session
                                </button>
                                <button onClick={startSession}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5" /> Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Active
    const q = questions[currentQ]
    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-teal-600" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">{currentQ + 1}/{questions.length}</span>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 px-3 py-1.5 text-sm font-bold text-teal-700 dark:text-teal-400">
                        {score} correct
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <motion.div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                        animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <p className="text-6xl font-chinese text-gray-900 dark:text-gray-100 mb-2">{q.word.simplified}</p>
                            <p className="text-sm text-gray-500">{q.word.english}</p>
                            <button onClick={() => playWord(q.word.simplified)}
                                className="mt-2 text-teal-600 hover:text-teal-700 cursor-pointer inline-flex items-center gap-1 text-sm">
                                <Volume2 className="w-4 h-4" /> Listen
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600 mb-4">What tone is the first syllable?</p>

                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map(tone => {
                                let btnClass = 'bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 border-2 border-gray-100 dark:border-gray-700 hover:border-teal-300 text-gray-800 dark:text-gray-200'
                                if (selected !== null) {
                                    if (tone === q.correctTone) btnClass = 'bg-green-50 border-2 border-green-400 text-green-800'
                                    else if (tone === selected) btnClass = 'bg-red-50 border-2 border-red-400 text-red-800'
                                    else btnClass = 'bg-gray-50 border-2 border-gray-100 text-gray-400'
                                }
                                return (
                                    <button key={tone} onClick={() => handleAnswer(tone)} disabled={selected !== null}
                                        className={`rounded-2xl p-4 font-medium cursor-pointer transition-all text-center ${btnClass} disabled:cursor-default`}>
                                        <p className="text-lg font-bold">Tone {tone}</p>
                                        <p className="text-sm text-gray-500">{TONE_LABELS[tone]}</p>
                                        {selected !== null && tone === q.correctTone && <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />}
                                        {selected !== null && tone === selected && tone !== q.correctTone && <XCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />}
                                    </button>
                                )
                            })}
                        </div>

                        {selected !== null && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                                <p className="text-lg text-teal-700 font-medium">{q.word.pinyin}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
