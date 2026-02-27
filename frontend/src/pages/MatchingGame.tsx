import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vocabularyApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HanziWord } from '@/types'
import {
    Grid3X3,
    Trophy,
    RotateCcw,
    Clock,
    Zap,
    Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import BlurText from '@/components/animations/BlurText'

interface Card {
    id: number
    content: string
    type: 'chinese' | 'english'
    pairId: number
    flipped: boolean
    matched: boolean
}

function createCards(words: HanziWord[]): Card[] {
    const selected = [...words].sort(() => Math.random() - 0.5).slice(0, 6)
    const cards: Card[] = []
    selected.forEach((word, i) => {
        cards.push({ id: i * 2, content: word.simplified, type: 'chinese', pairId: i, flipped: false, matched: false })
        cards.push({ id: i * 2 + 1, content: word.english, type: 'english', pairId: i, flipped: false, matched: false })
    })
    return cards.sort(() => Math.random() - 0.5)
}

export default function MatchingGame() {
    const [hskLevel, setHskLevel] = useState(1)
    const [cards, setCards] = useState<Card[]>([])
    const [flippedIds, setFlippedIds] = useState<number[]>([])
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [moves, setMoves] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(0)
    const [bestTime, setBestTime] = useState<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const lockRef = useRef(false)

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    const startGame = async () => {
        setLoading(true)
        try {
            const words = await vocabularyApi.getByHSKLevel(hskLevel)
            if (words.length < 6) {
                toast.error('Need at least 6 words for the matching game.')
                return
            }
            const newCards = createCards(words)
            setCards(newCards)
            setFlippedIds([])
            setMatchedPairs(0)
            setMoves(0)
            setTimer(0)
            setGameFinished(false)
            setGameStarted(true)
            lockRef.current = false
            timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
        } catch {
            toast.error('Failed to load vocabulary')
        } finally {
            setLoading(false)
        }
    }

    const handleCardClick = (cardId: number) => {
        if (lockRef.current) return
        const card = cards.find(c => c.id === cardId)
        if (!card || card.flipped || card.matched) return
        if (flippedIds.length >= 2) return

        const newCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c)
        setCards(newCards)
        const newFlipped = [...flippedIds, cardId]
        setFlippedIds(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1)
            lockRef.current = true
            const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!)

            if (first.pairId === second.pairId) {
                setTimeout(() => {
                    setCards(prev => prev.map(c => c.pairId === first.pairId ? { ...c, matched: true } : c))
                    setFlippedIds([])
                    lockRef.current = false
                    const newMatched = matchedPairs + 1
                    setMatchedPairs(newMatched)
                    if (newMatched === 6) {
                        if (timerRef.current) clearInterval(timerRef.current)
                        setGameFinished(true)
                        setGameStarted(false)
                        toast.success('All pairs matched!')
                    }
                }, 500)
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
                    setFlippedIds([])
                    lockRef.current = false
                }, 800)
            }
        }
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    // Landing
    if (!gameStarted && !gameFinished) {
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" />
                            <BlurText as="h1" className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900" wordDelay={0.08}>
                                Matching Game
                            </BlurText>
                        </div>
                        <p className="text-base sm:text-lg text-gray-600">Match Chinese characters with their English meanings</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Select HSK Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button key={level} onClick={() => setHskLevel(level)}
                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${hskLevel === level ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {bestTime !== null && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                            <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 text-center">
                                <Star className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-700">Best time: <span className="font-bold text-rose-700">{formatTime(bestTime)}</span></p>
                            </div>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center">
                        <button onClick={startGame} disabled={loading}
                            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                            {loading ? <LoadingSpinner size="sm" /> : <Grid3X3 className="w-6 h-6" />}
                            Start Game
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Finished
    if (gameFinished) {
        if (bestTime === null || timer < bestTime) setBestTime(timer)
        return (
            <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl shadow-xl border border-rose-200 p-6 sm:p-8 text-center">
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Matched!</h2>
                            <div className="grid grid-cols-2 gap-4 mt-4 max-w-xs mx-auto">
                                <div className="bg-white/80 rounded-xl p-3">
                                    <Clock className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-rose-700">{formatTime(timer)}</p>
                                    <p className="text-xs text-gray-600">Time</p>
                                </div>
                                <div className="bg-white/80 rounded-xl p-3">
                                    <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-amber-700">{moves}</p>
                                    <p className="text-xs text-gray-600">Moves</p>
                                </div>
                            </div>
                            <button onClick={startGame}
                                className="mt-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-6 py-3 font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                                <RotateCcw className="w-5 h-5" /> Play Again
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Active game
    return (
        <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setGameStarted(false); setGameFinished(false) }}
                        className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-gray-900">{moves} moves</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border px-3 py-1.5 flex items-center gap-1.5 font-mono">
                            <Clock className="w-4 h-4 text-rose-500" />
                            <span className="font-bold text-gray-900">{formatTime(timer)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
                    <p className="text-center text-sm text-gray-500 mb-4">{matchedPairs}/6 pairs found</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <AnimatePresence>
                            {cards.map(card => (
                                <motion.button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    whileTap={{ scale: 0.95 }}
                                    className={`aspect-square rounded-xl sm:rounded-2xl font-medium cursor-pointer transition-all text-center flex items-center justify-center p-2 ${card.matched ? 'bg-green-100 border-2 border-green-300 text-green-800'
                                            : card.flipped ? 'bg-rose-100 border-2 border-rose-300 text-rose-800'
                                                : 'bg-gray-100 hover:bg-rose-50 border-2 border-gray-200 hover:border-rose-200 text-transparent'
                                        }`}>
                                    <span className={`${card.type === 'chinese' ? 'text-2xl sm:text-3xl font-chinese' : 'text-xs sm:text-sm'}`}>
                                        {card.flipped || card.matched ? card.content : '?'}
                                    </span>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
