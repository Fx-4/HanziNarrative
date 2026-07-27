import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { SessionSkeleton } from '@/components/ui/Skeleton'
import { HanziWord } from '@/types'
import { fetchTTSAudio } from '@/utils/ttsHelper'
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
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
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
                toast.error(t('toneTrainer.toasts.notEnough'))
                return
            }
            const qs = generateToneQuestions(words)
            if (qs.length === 0) {
                toast.error(t('toneTrainer.toasts.noWords'))
                return
            }
            setQuestions(qs)
            setCurrentQ(0)
            setScore(0)
            setSelected(null)
            setSessionStarted(true)
        } catch {
            toast.error(t('toneTrainer.toasts.loadFailed'))
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

        try {
            const audio = await fetchTTSAudio({ text, speakingRate: 0.75 })
            audioRef.current = audio
            audio.onended = () => setIsPlaying(false)
            // Soal hanya menampilkan karakter + arti; pinyin baru dibuka setelah
            // menjawab, jadi nadanya memang harus didengar. Kalau audio gagal diam-diam,
            // user tinggal menebak buta di antara 4 nada tanpa tahu apa yang salah.
            audio.onerror = () => {
                setIsPlaying(false)
                toast.error(t('toneTrainer.toasts.audioFailed'))
            }
            await audio.play()
        } catch {
            setIsPlaying(false)
            toast.error(t('toneTrainer.toasts.audioFailed'))
        }
    }

    // Keyboard: tekan 1-4 untuk memilih nada (hanya sebelum menjawab).
    useEffect(() => {
        if (!sessionStarted || selected !== null) return
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return
            if (['1', '2', '3', '4'].includes(e.key)) handleAnswer(Number(e.key))
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStarted, selected, currentQ, questions])

    // Generating the session — skeleton of the upcoming exercise
    if (loading) {
        return <SessionSkeleton />
    }

    // Landing
    if (!sessionStarted && questions.length === 0) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Music className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600 dark:text-teal-400" />
                            <BlurText as="h1" className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100" wordDelay={0.08}>
                                {t('toneTrainer.title')}
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{t('toneTrainer.subtitle')}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('toneTrainer.selectLevel')}</h3>
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
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('toneTrainer.fourTones')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <p className="text-2xl font-bold text-teal-700 mb-1 dark:text-teal-300">{t('toneTrainer.toneN', { n })}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t(`toneTrainer.tones.${n}`)}</p>
                                        <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">ma{TONE_MARKS[n]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                        <button onClick={startSession} disabled={loading}
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                            <Music className="w-6 h-6" />
                            {t('toneTrainer.start')}
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
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('toneTrainer.sessionComplete')}</h2>
                            <p className="text-xl text-gray-700 dark:text-gray-300">{t('toneTrainer.result', { score, total: questions.length, pct })}</p>
                            <div className="flex justify-center gap-3 mt-6">
                                <button onClick={() => { setQuestions([]); setSessionStarted(false) }}
                                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> {t('toneTrainer.newSession')}
                                </button>
                                <button onClick={startSession}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5" /> {t('toneTrainer.continue')}
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
                        <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">{currentQ + 1}/{questions.length}</span>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 px-3 py-1.5 text-sm font-bold text-teal-700 dark:text-teal-400">
                        {t('toneTrainer.correctCount', { score })}
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                    <motion.div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                        animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <p className="text-6xl font-chinese text-gray-900 dark:text-gray-100 mb-2">{q.word.simplified}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{q.word.english}</p>
                            <button onClick={() => playWord(q.word.simplified)}
                                className="mt-2 text-teal-600 hover:text-teal-700 cursor-pointer inline-flex items-center gap-1 text-sm dark:text-teal-400 dark:hover:text-teal-300">
                                <Volume2 className="w-4 h-4" /> {t('toneTrainer.listen')}
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">{t('toneTrainer.whichTone')}</p>

                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map(tone => {
                                let btnClass = 'bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 border-2 border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 text-gray-800 dark:text-gray-200'
                                if (selected !== null) {
                                    if (tone === q.correctTone) btnClass = 'bg-success-50 border-2 border-green-400 dark:bg-success-950/30 dark:border-green-800 text-success-800 dark:text-success-300'
                                    else if (tone === selected) btnClass = 'bg-error-50 border-2 border-error-400 dark:bg-error-950/30 dark:border-error-800 text-error-800 dark:text-error-300'
                                    else btnClass = 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                }
                                return (
                                    <button key={tone} onClick={() => handleAnswer(tone)} disabled={selected !== null}
                                        className={`relative rounded-2xl p-4 font-medium cursor-pointer transition-all text-center ${btnClass} disabled:cursor-default`}>
                                        {selected === null && (
                                            <kbd className="hidden sm:inline-flex items-center justify-center absolute top-2 right-2.5 h-4 min-w-[16px] px-1 rounded border border-current text-[10px] leading-none opacity-40 font-sans">{tone}</kbd>
                                        )}
                                        <p className="text-lg font-bold">{t('toneTrainer.toneN', { n: tone })}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t(`toneTrainer.tones.${tone}`)}</p>
                                        {selected !== null && tone === q.correctTone && <CheckCircle className="w-4 h-4 text-success-600 mx-auto mt-1 dark:text-success-400" />}
                                        {selected !== null && tone === selected && tone !== q.correctTone && <XCircle className="w-4 h-4 text-error-500 mx-auto mt-1" />}
                                    </button>
                                )
                            })}
                        </div>

                        {selected !== null && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                                <p className="text-lg text-teal-700 font-medium dark:text-teal-300">{q.word.pinyin}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
