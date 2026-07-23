import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sttApi, vocabularyApi } from '@/services/api'
import { Skeleton, SessionSkeleton } from '@/components/ui/Skeleton'
import {
    Mic,
    MicOff,
    Volume2,
    RotateCcw,
    ArrowRight,
    CheckCircle,
    Target,
    Zap,
    Award,
    Eye,
    EyeOff,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Brain
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'
import { fetchTTSAudio } from '@/utils/ttsHelper'
import { useTranslation } from 'react-i18next'

type PracticeMode = 'vocabulary' | 'pronunciation'

interface PracticeWord {
    id: number
    simplified: string
    pinyin: string
    english: string
}

const NEUTRAL_TONE_EXAMPLES = [
    { char: '吗', pinyin: 'ma', meaning: 'question particle', example: '你好吗？' },
    { char: '呢', pinyin: 'ne', meaning: 'question particle', example: '你呢？' },
    { char: '的', pinyin: 'de', meaning: 'possessive particle', example: '我的书' },
    { char: '了', pinyin: 'le', meaning: 'completion particle', example: '吃了' },
    { char: '着', pinyin: 'zhe', meaning: 'progressive particle', example: '走着' },
    { char: '们', pinyin: 'men', meaning: 'plural suffix', example: '我们, 你们' },
]

const NEUTRAL_TONE_COMPOUNDS = [
    { word: '爸爸', pinyin: 'bà·ba', meaning: 'father' },
    { word: '妈妈', pinyin: 'mā·ma', meaning: 'mother' },
    { word: '哥哥', pinyin: 'gē·ge', meaning: 'older brother' },
    { word: '姐姐', pinyin: 'jiě·jie', meaning: 'older sister' },
    { word: '弟弟', pinyin: 'dì·di', meaning: 'younger brother' },
    { word: '妹妹', pinyin: 'mèi·mei', meaning: 'younger sister' },
    { word: '东西', pinyin: 'dōng·xi', meaning: 'things / stuff' },
    { word: '名字', pinyin: 'míng·zi', meaning: 'name' },
    { word: '桌子', pinyin: 'zhuō·zi', meaning: 'table' },
    { word: '椅子', pinyin: 'yǐ·zi', meaning: 'chair' },
]

export default function SpeakingPractice() {
    const { t } = useTranslation()
    const [hskLevel, setHskLevel] = useState(1)
    const [words, setWords] = useState<PracticeWord[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState<{ is_correct: boolean; accuracy_score: number; feedback: string; transcript?: string; confidence?: number } | null>(null)
    const [score, setScore] = useState(0)
    const [totalAttempted, setTotalAttempted] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('vocabulary')
    const [hintRevealed, setHintRevealed] = useState(false)
    const [usedHint, setUsedHint] = useState(false)
    const [showNeutralGuide, setShowNeutralGuide] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const currentWord = words[currentIndex]

    const loadWords = async () => {
        setLoading(true)
        try {
            const data = await vocabularyApi.getByHSKLevel(hskLevel)
            const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10)
            setWords(shuffled)
            setCurrentIndex(0)
            setScore(0)
            setTotalAttempted(0)
            setShowResult(false)
            setResult(null)
            setHintRevealed(false)
            setUsedHint(false)
            setSessionStarted(true)
        } catch {
            toast.error(t('speaking.toasts.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const playWord = async () => {
        if (!currentWord || isPlaying) return
        setIsPlaying(true)

        try {
            const audio = await fetchTTSAudio({ text: currentWord.simplified, speakingRate: 0.7 })
            audioRef.current = audio
            audio.onended = () => setIsPlaying(false)
            audio.onerror = () => setIsPlaying(false)
            await audio.play()
        } catch {
            setIsPlaying(false)
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

            chunksRef.current = []
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop())
                const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
                await processAudio(blob)
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch {
            toast.error(t('speaking.toasts.micDenied'))
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const processAudio = async (blob: Blob) => {
        setIsProcessing(true)
        try {
            const buffer = await blob.arrayBuffer()
            const base64 = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )

            const response = await sttApi.recognize(base64, currentWord.simplified)
            setResult(response)
            setShowResult(true)
            setTotalAttempted(prev => prev + 1)

            if (response.is_correct) {
                setScore(prev => prev + (usedHint ? 0 : 1))
                toast.success(response.feedback)
            } else {
                toast(response.feedback, { icon: '✎' })
            }
        } catch (err) {
            const e = err as { response?: { data?: { detail?: string } } }
            const msg = e.response?.data?.detail || t('speaking.toasts.sttFailed')
            toast.error(msg)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setShowResult(false)
            setResult(null)
            setHintRevealed(false)
            setUsedHint(false)
        } else {
            toast.success(t('speaking.toasts.sessionComplete', { score, total: totalAttempted }))
            setSessionStarted(false)
        }
    }

    const handleRetry = () => {
        setShowResult(false)
        setResult(null)
    }

    const handleRevealHint = () => {
        setHintRevealed(true)
        setUsedHint(true)
    }

    // Keyboard: Space = rekam / berhenti; setelah hasil, Enter = lanjut.
    // Diabaikan saat memproses audio & saat fokus di input.
    useEffect(() => {
        if (!sessionStarted) return
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return
            if (isProcessing) return
            if (showResult) {
                if (e.key === 'Enter') { e.preventDefault(); handleNext() }
                return
            }
            if (e.key === ' ') {
                e.preventDefault()
                if (isRecording) stopRecording()
                else startRecording()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStarted, isProcessing, showResult, isRecording, currentIndex, words.length])

    // Preparing the session (words + audio) — skeleton of the upcoming exercise
    if (loading && !sessionStarted) {
        return <SessionSkeleton options={2} />
    }

    // Landing screen
    if (!sessionStarted) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 dark:text-rose-400" />
                            <BlurText
                                as="h1"
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50"
                                wordDelay={0.08}
                            >
                                {t('speaking.title')}
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            {t('speaking.subtitle')}
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
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 dark:text-gray-50">{t('speaking.selectLevel')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Neutral Tone Guide */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden dark:bg-surface-card dark:border-amber-900/40">
                            <button
                                onClick={() => setShowNeutralGuide(prev => !prev)}
                                className="w-full flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-amber-900/40">
                                        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-gray-50">轻声 {t('speaking.neutralTitle')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('speaking.neutralSubtitle')}</p>
                                    </div>
                                </div>
                                {showNeutralGuide
                                    ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 dark:text-gray-500" />
                                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 dark:text-gray-500" />
                                }
                            </button>

                            <AnimatePresence>
                                {showNeutralGuide && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 sm:px-6 pb-6 space-y-5 border-t border-amber-100 dark:border-amber-900/40">
                                            <p className="text-sm text-gray-600 mt-4 dark:text-gray-400">
                                                {t('speaking.neutralIntro')}
                                            </p>

                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400">{t('speaking.commonParticles')}</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {NEUTRAL_TONE_EXAMPLES.map(item => (
                                                        <div key={item.char} className="bg-amber-50 rounded-xl px-3 py-2 dark:bg-amber-950/30">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-chinese text-gray-900 dark:text-gray-50">{item.char}</span>
                                                                <div>
                                                                    <p className="text-xs text-amber-700 font-medium dark:text-amber-300">·{item.pinyin}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.meaning}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1 font-chinese dark:text-gray-400">{item.example}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400">{t('speaking.compoundWords')}</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {NEUTRAL_TONE_COMPOUNDS.map(item => (
                                                        <div key={item.word} className="bg-orange-50 rounded-xl px-3 py-2 dark:bg-orange-950/30">
                                                            <p className="text-xl font-chinese text-gray-900 dark:text-gray-50">{item.word}</p>
                                                            <p className="text-xs text-orange-700 font-medium dark:text-orange-300">{item.pinyin}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.meaning}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Previous results */}
                    {totalAttempted > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl shadow-xl border border-rose-200 p-4 sm:p-6 dark:from-rose-950/30 dark:to-pink-950/30 dark:border-rose-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">{t('speaking.lastSession')}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{score}/{totalAttempted}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('speaking.correct')}</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('speaking.accuracy')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Start */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <button
                            onClick={loadWords}
                            disabled={loading}
                            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                        >
                            <Mic className="w-6 h-6" />
                            {t('speaking.start')}
                        </button>
                    </motion.div>

                    {/* How it works */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 dark:border-gray-800 dark:from-rose-950/30 dark:to-orange-950/30">
                            <h4 className="font-semibold text-gray-900 mb-3 dark:text-gray-50">{t('speaking.howItWorks')}</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-rose-900/40">
                                        <Volume2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">{t('speaking.step1')}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('speaking.step1Desc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-pink-900/40">
                                        <Mic className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">{t('speaking.step2')}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('speaking.step2Desc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-success-900/40">
                                        <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-50">{t('speaking.step3')}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('speaking.step3Desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (loading || !currentWord) {
        return <SessionSkeleton options={2} />
    }

    const isVocabMode = practiceMode === 'vocabulary'

    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <button
                        onClick={() => setSessionStarted(false)}
                        className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        {t('speaking.back')}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5 dark:bg-surface-card">
                            <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span className="font-bold text-gray-900 dark:text-gray-50">{currentIndex + 1}/{words.length}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5 dark:bg-surface-card">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-gray-900 dark:text-gray-50">{t('speaking.pts', { n: score })}</span>
                        </div>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="mb-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 dark:bg-surface-card dark:border-gray-800">
                        <button
                            onClick={() => { setPracticeMode('vocabulary'); setShowResult(false); setResult(null); setHintRevealed(false); setUsedHint(false) }}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer transition-all ${isVocabMode
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <Brain className="w-4 h-4" />
                            {t('speaking.vocabMode')}
                        </button>
                        <button
                            onClick={() => { setPracticeMode('pronunciation'); setShowResult(false); setResult(null); setHintRevealed(false); setUsedHint(false) }}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer transition-all ${!isVocabMode
                                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <Volume2 className="w-4 h-4" />
                            {t('speaking.pronMode')}
                        </button>
                    </div>
                </div>

                {/* Mode badge */}
                <div className="mb-4 flex items-center gap-2">
                    {isVocabMode ? (
                        <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full dark:bg-violet-900/40 dark:text-violet-300">
                            <Brain className="w-3.5 h-3.5" />
                            {t('speaking.vocabBadge')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full dark:bg-rose-900/40 dark:text-rose-300">
                            <Volume2 className="w-3.5 h-3.5" />
                            {t('speaking.pronBadge')}
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
                    <motion.div
                        className={`h-2.5 rounded-full ${isVocabMode
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                            }`}
                        animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Word Card */}
                <motion.div
                    key={`${currentIndex}-${practiceMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center dark:bg-surface-card dark:border-gray-800">

                        {/* VOCABULARY CHALLENGE MODE */}
                        {isVocabMode ? (
                            <div>
                                <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-3">{t('speaking.whatWord')}</p>

                                {/* English meaning — shown prominently */}
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 dark:text-gray-50">{currentWord.english}</p>
                                <p className="text-sm text-gray-400 mb-5 dark:text-gray-500">{t('speaking.whatMeaning')}</p>

                                {/* Hint reveal */}
                                {!showResult && (
                                    <div className="mb-5">
                                        {hintRevealed ? (
                                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 dark:bg-amber-950/30 dark:border-amber-800">
                                                <Eye className="w-4 h-4 text-amber-500" />
                                                <span className="text-amber-700 font-medium text-sm dark:text-amber-300">{t('speaking.hintLabel')} </span>
                                                <span className="text-lg text-rose-600 font-medium dark:text-rose-400">{currentWord.pinyin}</span>
                                                <span className="text-xs text-amber-500">{t('speaking.noPoints')}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleRevealHint}
                                                className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-2xl px-4 py-2 text-sm font-medium cursor-pointer transition-colors dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40"
                                            >
                                                <Lightbulb className="w-4 h-4" />
                                                {t('speaking.revealHint')}
                                                <EyeOff className="w-4 h-4 opacity-50" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* After result: show character + pinyin */}
                                {showResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-5"
                                    >
                                        <div className="bg-violet-50 border border-violet-200 rounded-2xl px-6 py-4 inline-block dark:bg-violet-950/30 dark:border-violet-800">
                                            <p className="text-5xl sm:text-6xl font-chinese text-gray-900 mb-1 dark:text-gray-50">{currentWord.simplified}</p>
                                            <p className="text-xl text-violet-600 dark:text-violet-400">{currentWord.pinyin}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            /* PRONUNCIATION CHECK MODE */
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-3">{t('speaking.pronounceThis')}</p>
                                <p className="text-5xl sm:text-6xl font-chinese text-gray-900 mb-3 dark:text-gray-50">{currentWord.simplified}</p>
                                <p className="text-xl text-rose-600 mb-1 dark:text-rose-400">{currentWord.pinyin}</p>
                                <p className="text-gray-500 dark:text-gray-400">{currentWord.english}</p>
                            </div>
                        )}

                        {/* Listen button */}
                        <button
                            onClick={playWord}
                            disabled={isPlaying}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2 mx-auto mb-6 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <Volume2 className="w-4 h-4" />
                            {isPlaying ? t('speaking.playing') : t('speaking.listen')}
                        </button>

                        {/* Recording section */}
                        {!showResult ? (
                            <div className="space-y-4">
                                {isProcessing ? (
                                    <div className="space-y-3 py-4 max-w-sm mx-auto">
                                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                                        <Skeleton className="h-4 w-3/4 mx-auto" />
                                        <Skeleton className="h-4 w-1/2 mx-auto" />
                                        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                            {isVocabMode ? t('speaking.checkingVocab') : t('speaking.analyzing')}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg mx-auto ${isRecording
                                                ? 'bg-error-500 hover:bg-error-600 animate-pulse'
                                                : isVocabMode
                                                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                                                    : 'bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
                                                }`}
                                        >
                                            {isRecording ? (
                                                <MicOff className="w-10 h-10 text-white" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-white" />
                                            )}
                                        </button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 flex-wrap">
                                            {isRecording ? t('speaking.recording') : t('speaking.clickRecord')}
                                            <span className="hidden sm:inline-flex items-center gap-1 text-gray-300 dark:text-gray-600">
                                                ·
                                                <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-current text-[10px] leading-none font-sans">Space</kbd>
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Results */
                            <div className="space-y-4">
                                <div className={`rounded-2xl p-5 ${result?.is_correct ? 'bg-success-50 border border-green-200 dark:bg-success-950/30 dark:border-green-800' : 'bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'}`}>

                                    {/* Score circle */}
                                    <div className="flex justify-center mb-3">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${result?.is_correct ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                                            {result?.accuracy_score}%
                                        </div>
                                    </div>

                                    {/* Vocabulary + Tone breakdown for vocab mode */}
                                    {isVocabMode && (
                                        <div className="flex justify-center gap-4 mb-3">
                                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${result?.is_correct ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300' : 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300'}`}>
                                                {result?.is_correct ? '✅' : '❌'}
                                                {t('speaking.vocabLabel')} {result?.is_correct ? t('speaking.correctWord') : t('speaking.wrongWord')}
                                            </div>
                                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${(result?.accuracy_score ?? 0) >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                🎵 {t('speaking.toneLabel')} {(result?.accuracy_score ?? 0) >= 70 ? t('speaking.tonePerfect') : t('speaking.toneNeedsWork')}
                                            </div>
                                        </div>
                                    )}

                                    {usedHint && (
                                        <p className="text-center text-xs text-amber-600 mb-2 dark:text-amber-400">{t('speaking.hintUsed')}</p>
                                    )}

                                    <p className="text-center font-medium text-gray-900 mb-1 dark:text-gray-50">{result?.feedback}</p>

                                    {result?.transcript && (
                                        <div className="mt-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('speaking.whatWeHeard')}</p>
                                            <p className="text-lg font-chinese text-gray-800 dark:text-gray-200">{result.transcript}</p>
                                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('speaking.confidence', { n: result.confidence })}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2 dark:bg-gray-800 dark:text-gray-300"
                                    >
                                        <RotateCcw className="w-4 h-4" /> {t('speaking.tryAgain')}
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className={`text-white rounded-xl px-6 py-2.5 font-semibold cursor-pointer transition-colors flex items-center gap-2 ${isVocabMode
                                            ? 'bg-violet-600 hover:bg-violet-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                            }`}
                                    >
                                        {currentIndex < words.length - 1 ? (
                                            <>{t('speaking.next')} <ArrowRight className="w-4 h-4" /></>
                                        ) : (
                                            <>{t('speaking.finish')} <CheckCircle className="w-4 h-4" /></>
                                        )}
                                        <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-0.5 rounded border border-white/40 text-[11px] leading-none font-sans">↵</kbd>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
