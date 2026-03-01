import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { sttApi, vocabularyApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
    Mic,
    MicOff,
    Volume2,
    RotateCcw,
    ArrowRight,
    CheckCircle,
    Target,
    Zap,
    Award

} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import BlurText from '@/components/animations/BlurText'
import { getVoiceName } from '@/utils/voicePreference'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface PracticeWord {
    id: number
    simplified: string
    pinyin: string
    english: string
}

export default function SpeakingPractice() {
    const [hskLevel, setHskLevel] = useState(1)
    const [words, setWords] = useState<PracticeWord[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [score, setScore] = useState(0)
    const [totalAttempted, setTotalAttempted] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const currentWord = words[currentIndex]

    const loadWords = async () => {
        setLoading(true)
        try {
            const data = await vocabularyApi.getByHSKLevel(hskLevel)
            // Shuffle and take 10
            const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10)
            setWords(shuffled)
            setCurrentIndex(0)
            setScore(0)
            setTotalAttempted(0)
            setShowResult(false)
            setResult(null)
            setSessionStarted(true)
        } catch {
            toast.error('Failed to load vocabulary')
        } finally {
            setLoading(false)
        }
    }

    const playWord = async () => {
        if (!currentWord || isPlaying) return
        setIsPlaying(true)

        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                const response = await axios.post(
                    `${API_URL}/tts/synthesize`,
                    { text: currentWord.simplified, language: 'cmn-CN', voice_name: getVoiceName(), speaking_rate: 0.7 },
                    { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
                )
                const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }))
                const audio = new Audio(url)
                audioRef.current = audio
                audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
                audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
                await audio.play()
                return
            } catch { /* fallback */ }
        }

        const utterance = new SpeechSynthesisUtterance(currentWord.simplified)
        utterance.lang = 'zh-CN'
        utterance.rate = 0.6
        utterance.onend = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
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
        } catch (err: any) {
            toast.error('Microphone access denied. Please allow microphone access.')
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
            // Convert blob to base64
            const buffer = await blob.arrayBuffer()
            const base64 = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )

            const response = await sttApi.recognize(base64, currentWord.simplified)
            setResult(response)
            setShowResult(true)
            setTotalAttempted(prev => prev + 1)

            if (response.is_correct) {
                setScore(prev => prev + 1)
                toast.success(response.feedback)
            } else {
                toast(response.feedback, { icon: '✎' })
            }
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Speech recognition failed'
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
        } else {
            toast.success(`Session complete! Score: ${score}/${totalAttempted}`)
            setSessionStarted(false)
        }
    }

    const handleRetry = () => {
        setShowResult(false)
        setResult(null)
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
                            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" />
                            <BlurText
                                as="h1"
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900"
                                wordDelay={0.08}
                            >
                                Speaking Practice
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600">
                            Practice your Mandarin pronunciation with AI feedback
                        </p>
                    </motion.div>

                    {/* HSK Level Selector */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Previous results */}
                    {totalAttempted > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl shadow-xl border border-rose-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="w-5 h-5 text-rose-600" />
                                    <h3 className="font-semibold text-gray-900">Last Session Results</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-rose-700">{score}/{totalAttempted}</p>
                                        <p className="text-xs text-gray-600">Correct</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-rose-700">{totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%</p>
                                        <p className="text-xs text-gray-600">Accuracy</p>
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
                            {loading ? <LoadingSpinner size="sm" /> : <Mic className="w-6 h-6" />}
                            Start Speaking Session
                        </button>
                    </motion.div>

                    {/* How it works */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">How it works</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Volume2 className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">1. Listen</p>
                                        <p className="text-sm text-gray-600">Hear how the word is pronounced</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mic className="w-4 h-4 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">2. Speak</p>
                                        <p className="text-sm text-gray-600">Record yourself saying the word</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">3. Check</p>
                                        <p className="text-sm text-gray-600">Get AI-powered pronunciation feedback</p>
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <button
                        onClick={() => setSessionStarted(false)}
                        className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-rose-600" />
                            <span className="font-bold text-gray-900">{currentIndex + 1}/{words.length}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-gray-900">{score} pts</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <motion.div
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-2.5 rounded-full"
                        animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Word Card */}
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
                        {/* Word display */}
                        <p className="text-5xl sm:text-6xl font-chinese text-gray-900 mb-3">{currentWord.simplified}</p>
                        <p className="text-xl text-rose-600 mb-1">{currentWord.pinyin}</p>
                        <p className="text-gray-500 mb-6">{currentWord.english}</p>

                        {/* Listen button */}
                        <button
                            onClick={playWord}
                            disabled={isPlaying}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2 mx-auto mb-6 disabled:opacity-50"
                        >
                            <Volume2 className="w-4 h-4" />
                            {isPlaying ? 'Playing...' : 'Listen first'}
                        </button>

                        {/* Recording section */}
                        {!showResult ? (
                            <div className="space-y-4">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-3 py-4">
                                        <LoadingSpinner size="lg" />
                                        <p className="text-gray-600">Analyzing your pronunciation...</p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg mx-auto ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                                : 'bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
                                                }`}
                                        >
                                            {isRecording ? (
                                                <MicOff className="w-10 h-10 text-white" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-white" />
                                            )}
                                        </button>
                                        <p className="text-sm text-gray-500">
                                            {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Results */
                            <div className="space-y-4">
                                <div className={`rounded-2xl p-5 ${result?.is_correct ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    {/* Score circle */}
                                    <div className="flex justify-center mb-3">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${result?.is_correct ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {result?.accuracy_score}%
                                        </div>
                                    </div>

                                    <p className="text-center font-medium text-gray-900 mb-1">{result?.feedback}</p>

                                    {result?.transcript && (
                                        <div className="mt-3 text-center">
                                            <p className="text-xs text-gray-500">What we heard:</p>
                                            <p className="text-lg font-chinese text-gray-800">{result.transcript}</p>
                                            <p className="text-xs text-gray-400 mt-1">Confidence: {result.confidence}%</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Try Again
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 py-2.5 font-semibold cursor-pointer transition-colors flex items-center gap-2"
                                    >
                                        {currentIndex < words.length - 1 ? (
                                            <>Next <ArrowRight className="w-4 h-4" /></>
                                        ) : (
                                            <>Finish <CheckCircle className="w-4 h-4" /></>
                                        )}
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
