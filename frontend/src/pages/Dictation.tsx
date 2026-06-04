import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dictationApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
    Headphones,
    Play,
    Pause,
    CheckCircle,
    Eye,
    RotateCcw,
    ArrowRight,
    Zap,
    Target,
    Volume2,
    Send
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import BlurText from '@/components/animations/BlurText'
import { getVoiceName } from '@/utils/voicePreference'
import { API_URL } from '@/lib/env'

interface DictationSentence {
    text: string
    pinyin: string
    english_hint: string
    story_id: number
    story_title: string
}

export default function Dictation() {
    const [hskLevel, setHskLevel] = useState(1)
    const [sentences, setSentences] = useState<DictationSentence[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userInput, setUserInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [score, setScore] = useState(0)
    const [totalAttempted, setTotalAttempted] = useState(0)
    const [streak, setStreak] = useState(0)
    const [sessionStarted, setSessionStarted] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const currentSentence = sentences[currentIndex]

    const loadSentences = async () => {
        setLoading(true)
        try {
            const data = await dictationApi.getSentences(hskLevel, 10)
            setSentences(data)
            setCurrentIndex(0)
            setUserInput('')
            setShowResult(false)
            setShowHint(false)
            setScore(0)
            setTotalAttempted(0)
            setStreak(0)
            setSessionStarted(true)
        } catch (error: any) {
            if (error.response?.status === 404) {
                toast.error(`No stories available for HSK ${hskLevel}. Generate some stories first!`)
            } else {
                toast.error('Failed to load sentences')
            }
        } finally {
            setLoading(false)
        }
    }

    const playAudio = async () => {
        if (!currentSentence || isPlaying) return
        setIsPlaying(true)

        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                const response = await axios.post(
                    `${API_URL}/tts/synthesize`,
                    { text: currentSentence.text, language: 'cmn-CN', voice_name: getVoiceName(), speaking_rate: 0.75 },
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
        const utterance = new SpeechSynthesisUtterance(currentSentence.text)
        utterance.lang = 'zh-CN'
        utterance.rate = 0.7
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
    }

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        window.speechSynthesis.cancel()
        setIsPlaying(false)
    }

    const compareCharacters = (userText: string, correctText: string) => {
        const result: { char: string; correct: boolean; expected: string }[] = []
        const maxLen = Math.max(userText.length, correctText.length)

        for (let i = 0; i < maxLen; i++) {
            const userChar = userText[i] || ''
            const correctChar = correctText[i] || ''
            result.push({
                char: userChar || '·',
                correct: userChar === correctChar,
                expected: correctChar,
            })
        }
        return result
    }

    const handleSubmit = () => {
        if (!currentSentence || !userInput.trim()) return
        setShowResult(true)
        setTotalAttempted(prev => prev + 1)

        // Calculate accuracy
        const cleanInput = userInput.replace(/\s/g, '')
        const cleanExpected = currentSentence.text.replace(/\s/g, '')
        let correctCount = 0
        const maxLen = Math.max(cleanInput.length, cleanExpected.length)
        for (let i = 0; i < maxLen; i++) {
            if (cleanInput[i] === cleanExpected[i]) correctCount++
        }
        const accuracy = maxLen > 0 ? Math.round((correctCount / maxLen) * 100) : 0

        if (accuracy >= 80) {
            setScore(prev => prev + 1)
            setStreak(prev => prev + 1)
            if (accuracy === 100) toast.success('Perfect! 完美！')
            else toast.success(`Great! ${accuracy}% accurate!`)
        } else {
            setStreak(0)
            toast(`${accuracy}% — keep practicing!`, { icon: '✎' })
        }
    }

    const handleNext = () => {
        if (currentIndex < sentences.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setUserInput('')
            setShowResult(false)
            setShowHint(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            toast.success(`Session complete! Score: ${score}/${totalAttempted}`)
            setSessionStarted(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (showResult) handleNext()
            else handleSubmit()
        }
    }

    // Mode selection screen
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
                            <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-600" />
                            <BlurText
                                as="h1"
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900"
                                wordDelay={0.08}
                            >
                                Dictation 听写
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600">
                            Listen to sentences, then type what you hear
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
                                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Session Summary if completed */}
                    {totalAttempted > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl shadow-xl border border-cyan-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-5 h-5 text-cyan-600" />
                                    <h3 className="font-semibold text-gray-900">Last Session Results</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-cyan-700">{score}/{totalAttempted}</p>
                                        <p className="text-xs text-gray-600">Correct</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-cyan-700">{totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%</p>
                                        <p className="text-xs text-gray-600">Accuracy</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-cyan-700">{streak}</p>
                                        <p className="text-xs text-gray-600">Best Streak</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <button
                            onClick={loadSentences}
                            disabled={loading}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Headphones className="w-6 h-6" />}
                            Start Dictation Session
                        </button>
                    </motion.div>

                    {/* How it works */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">How it works</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Volume2 className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">1. Listen</p>
                                        <p className="text-sm text-gray-600">Play the audio of a real sentence from stories</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Send className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">2. Type</p>
                                        <p className="text-sm text-gray-600">Write the Chinese characters you heard</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">3. Check</p>
                                        <p className="text-sm text-gray-600">See character-by-character feedback</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!currentSentence) {
        return (
            <div className="min-h-screen py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-gray-600">No sentences available</p>
                    <button onClick={() => setSessionStarted(false)} className="mt-4 text-cyan-600 hover:underline cursor-pointer">
                        Go back
                    </button>
                </div>
            </div>
        )
    }

    const comparison = showResult ? compareCharacters(userInput.replace(/\s/g, ''), currentSentence.text.replace(/\s/g, '')) : []

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
                            <Target className="w-4 h-4 text-cyan-600" />
                            <span className="font-bold text-gray-900">{currentIndex + 1}/{sentences.length}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-gray-900">{score} pts</span>
                        </div>
                        {streak >= 2 && (
                            <div className="bg-orange-50 rounded-xl border border-orange-200 px-3 py-1.5">
                                <span className="text-sm font-bold text-orange-600 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {streak} streak</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                        animate={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Audio Player Card */}
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500 mb-2">From: {currentSentence.story_title}</p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={isPlaying ? stopAudio : playAudio}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg ${isPlaying
                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                                        }`}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-white" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white ml-1" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                {isPlaying ? 'Playing...' : 'Click to play the sentence'}
                            </p>
                        </div>

                        {/* English hint toggle */}
                        <div className="text-center mb-4">
                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer flex items-center gap-1 mx-auto"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                {showHint ? 'Hide hint' : 'Show English hint'}
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-gray-600 italic mt-2"
                                    >
                                        {currentSentence.english_hint || 'No translation available'}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input */}
                        {!showResult ? (
                            <div className="space-y-4">
                                <input
                                    ref={inputRef}
                                    id="dictation-answer"
                                    name="dictation-answer"
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type the Chinese characters you heard..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg font-chinese text-center focus:border-cyan-500 focus:outline-none transition-colors"
                                    autoFocus
                                    lang="zh-CN"
                                />
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={playAudio}
                                        disabled={isPlaying}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Replay
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!userInput.trim()}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-6 py-2.5 font-semibold cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        Check
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Result comparison */
                            <div className="space-y-4">
                                {/* Character-by-character diff */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500 mb-2">Your answer:</p>
                                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                                        {comparison.map((item, i) => (
                                            <span
                                                key={i}
                                                className={`text-2xl font-chinese px-1 py-0.5 rounded ${item.correct
                                                    ? 'text-green-700 bg-green-100'
                                                    : 'text-red-700 bg-red-100'
                                                    }`}
                                                title={item.correct ? 'Correct!' : `Expected: ${item.expected}`}
                                            >
                                                {item.char}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-2">Correct answer:</p>
                                    <p className="text-2xl font-chinese text-center text-gray-900 mb-2">{currentSentence.text}</p>
                                    {currentSentence.pinyin && (
                                        <p className="text-center text-cyan-600">{currentSentence.pinyin}</p>
                                    )}
                                    {currentSentence.english_hint && (
                                        <p className="text-center text-gray-500 text-sm mt-1">{currentSentence.english_hint}</p>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={playAudio}
                                        disabled={isPlaying}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 font-medium cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        Listen again
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-6 py-2.5 font-semibold cursor-pointer transition-colors flex items-center gap-2"
                                    >
                                        {currentIndex < sentences.length - 1 ? (
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
