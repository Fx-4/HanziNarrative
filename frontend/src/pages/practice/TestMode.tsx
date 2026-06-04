import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  ArrowRight, CheckCircle, XCircle, Trophy, Target,
  Flame, Dumbbell, Zap, Rocket, Star, Sparkles, Gem, BookOpen
} from 'lucide-react'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type QuestionType = 'recognition' | 'meaning' | 'pinyin'

export interface Question {
  word: HanziWord
  type: QuestionType
  options: string[]
  correctAnswer: number
}

// â”€â”€â”€ Giphy meme component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GIPHY_KEY = '1rcSsQCZN5FuSwxfwyihbQCC4SuC6nDQ'

type MemeData = { caption: string; query: string }

const TenorMeme = ({ caption, query }: MemeData) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setGifUrl(null)
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=10&rating=pg-13`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const results: { images?: { fixed_height?: { url?: string } } }[] = data?.data ?? []
        if (results.length > 0) {
          const pick = results[Math.floor(Math.random() * results.length)]
          setGifUrl(pick?.images?.fixed_height?.url ?? null)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query])

  return (
    <div className="w-[260px] mx-auto rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl select-none bg-gray-900">
      <div className="bg-black px-3 py-1.5">
        <p className="text-white text-xs font-black uppercase text-center tracking-wide" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000' }}>
          {caption}
        </p>
      </div>
      <div className="relative flex items-center justify-center bg-gray-900" style={{ minHeight: 180 }}>
        {loading && (
          <div className="flex items-center justify-center w-full h-44">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin opacity-50" />
          </div>
        )}
        {gifUrl && (
          <img
            src={gifUrl}
            alt="meme"
            className="w-full object-contain"
            style={{ maxHeight: 220, display: loading ? 'none' : 'block' }}
            onLoad={() => setLoading(false)}
          />
        )}
        {!loading && !gifUrl && (
          <div className="text-gray-500 text-sm p-4 text-center">ðŸ˜¢ no meme loaded</div>
        )}
      </div>
    </div>
  )
}

// â”€â”€â”€ Motivational messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOTIVATIONAL_MESSAGES = [
  { Icon: Flame, iconClass: 'text-orange-500', title: "You're on fire!", message: 'Keep up the amazing work! Your Chinese is getting better with every answer.', color: 'from-orange-400 to-error-500', meme: { caption: 'me studying chinese at 3am', query: 'kung fu panda studying' } },
  { Icon: Dumbbell, iconClass: 'text-purple-500', title: 'Beast mode activated!', message: "You're crushing it! Remember, every character you learn makes you stronger.", color: 'from-purple-400 to-pink-500', meme: { caption: 'my brain memorizing hsk vocab', query: 'kung fu panda training' } },
  { Icon: Zap, iconClass: 'text-yellow-500', title: 'Power up!', message: 'Your brain is leveling up! Take a deep breath and keep going.', color: 'from-yellow-400 to-orange-500', meme: { caption: 'learning chinese characters like', query: 'mulan warrior training' } },
  { Icon: Rocket, iconClass: 'text-blue-500', title: 'To the moon!', message: 'Your progress is out of this world! The Chinese language is yours to conquer.', color: 'from-blue-400 to-purple-500', meme: { caption: 'me after passing hsk', query: 'chinese new year celebration fireworks' } },
  { Icon: Target, iconClass: 'text-success-500', title: 'Right on target!', message: "Your focus is incredible! Keep that energy going - you got this!", color: 'from-success-400 to-blue-500', meme: { caption: 'chinese vocab test vs me', query: 'kung fu panda i am not afraid' } },
  { Icon: Star, iconClass: 'text-yellow-400', title: 'Superstar alert!', message: "You're absolutely killing it! Every question brings you closer to fluency.", color: 'from-yellow-400 to-pink-500', meme: { caption: 'nailed every hsk question', query: 'mulan triumph victory win' } },
  { Icon: Sparkles, iconClass: 'text-cyan-500', title: 'Shining bright!', message: 'Your dedication is inspiring! Keep shining and learning!', color: 'from-cyan-400 to-blue-500', meme: { caption: 'almost fluent in chinese', query: 'chinese lantern festival glowing beautiful' } },
  { Icon: Gem, iconClass: 'text-primary-500', title: 'Diamond in the making!', message: "Pressure makes diamonds, and you're forming into something brilliant!", color: 'from-primary-400 to-purple-500', meme: { caption: 'hsk grind never stops', query: 'kung fu panda hard work discipline' } },
  { Icon: Trophy, iconClass: 'text-yellow-500', title: 'W after W!', message: "You're built different. HSK characters can't stop you fr.", color: 'from-yellow-500 to-orange-400', meme: { caption: 'getting 5 hsk questions right', query: 'mulan i ll make a man out of you' } },
  { Icon: BookOpen, iconClass: 'text-blue-400', title: 'When the character clicks!', message: "That moment when Chinese finally makes sense? You're living it.", color: 'from-blue-400 to-cyan-500', meme: { caption: 'when i finally read a chinese character', query: 'panda excited happy surprise reaction' } },
  { Icon: Flame, iconClass: 'text-error-500', title: 'Lowkey a Chinese genius rn', message: 'The way your brain is eating up these characters? Unreal.', color: 'from-error-400 to-orange-500', meme: { caption: 'my brain after learning 100 hanzi', query: 'chinese dragon powerful flying' } },
  { Icon: Zap, iconClass: 'text-pink-500', title: 'Slaying the HSK!', message: "You're literally slaying this test. Keep the energy up!", color: 'from-pink-400 to-purple-500', meme: { caption: 'me vs hsk vocabulary', query: 'mulan sword fight battle fierce' } },
  { Icon: Rocket, iconClass: 'text-success-400', title: 'Speedrunning Chinese', message: "You're moving so fast through these characters. Absolute unit.", color: 'from-success-400 to-teal-500', meme: { caption: 'speedrunning hsk1 to hsk6', query: 'kung fu panda running fast dodge' } },
  { Icon: Star, iconClass: 'text-orange-400', title: 'Your Chinese teacher rn', message: "Genuinely proud of you. Keep going, you're so close!", color: 'from-orange-400 to-pink-500', meme: { caption: 'my chinese teacher watching me study', query: 'kung fu panda shifu proud teacher' } },
  { Icon: Dumbbell, iconClass: 'text-teal-500', title: 'Swole brain achieved', message: "Every 5 questions = one more Chinese brain muscle. You're jacked.", color: 'from-teal-400 to-blue-500', meme: { caption: 'brain gains from hsk vocab', query: 'kung fu panda strong power level up' } },
  { Icon: Sparkles, iconClass: 'text-yellow-300', title: 'Main character energy', message: "Every Chinese fluency story needs a hero. That's you.", color: 'from-yellow-300 to-orange-400', meme: { caption: 'me walking into china speaking chinese', query: 'mulan confident hero walk' } },
  { Icon: Target, iconClass: 'text-error-400', title: 'HSK? More like easy-SK', message: 'You make this look way too easy. Respect.', color: 'from-error-400 to-pink-500', meme: { caption: 'hsk exam after i studied', query: 'panda happy easy chill relaxed' } },
  { Icon: Gem, iconClass: 'text-cyan-400', title: 'Chinese vocab = unlocked', message: "Imagine knowing this much Chinese. Oh wait, that's you.", color: 'from-cyan-400 to-primary-500', meme: { caption: 'knowing chinese in public', query: 'chinese martial arts cool impressive' } },
  { Icon: Flame, iconClass: 'text-amber-500', title: 'Bro is cooking fr', message: "You're in the zone. Every character is clicking. Don't stop!", color: 'from-amber-400 to-error-500', meme: { caption: 'me locked in on hsk study', query: 'kung fu panda focus concentrate meditation' } },
  { Icon: Rocket, iconClass: 'text-violet-500', title: 'Non-Chinese speakers could never', message: "Look at you reading hanzi like it's nothing. Legendary.", color: 'from-violet-400 to-purple-600', meme: { caption: 'people who never studied chinese', query: 'mulan disguise secret identity funny' } },
  { Icon: Trophy, iconClass: 'text-lime-500', title: 'HSK grind = locked in', message: "The grind never stops for real ones. You're locked in.", color: 'from-lime-400 to-success-500', meme: { caption: 'me after 5 correct hsk answers', query: 'kung fu panda victory celebrate champion' } },
  { Icon: Zap, iconClass: 'text-sky-400', title: 'Ate those HSK questions!', message: 'You absolutely demolished those 5 questions. Zero crumbs. Keep going!', color: 'from-sky-400 to-blue-500', meme: { caption: 'me eating hsk questions for breakfast', query: 'kung fu panda eating dumpling food' } },
  { Icon: BookOpen, iconClass: 'text-rose-400', title: 'Sleep is for after HSK', message: 'Just kidding, sleep is important. But first â€” 5 more questions.', color: 'from-rose-400 to-error-500', meme: { caption: 'me choosing chinese study over sleep', query: 'panda tired sleepy exhausted funny' } },
  { Icon: Star, iconClass: 'text-purple-400', title: 'One weird trick to learn Chinese', message: "Just keep answering 5 questions at a time. You're doing it!", color: 'from-purple-400 to-violet-500', meme: { caption: 'language teachers hate this student', query: 'kung fu panda secret ingredient scroll' } },
  { Icon: Sparkles, iconClass: 'text-success-400', title: 'æ±‰å­—? No problem!', message: "Look at you reading Chinese characters like it's nothing. Respect.", color: 'from-success-400 to-success-500', meme: { caption: 'me reading hanzi like its easy', query: 'chinese new year dragon dance happy' } },
]

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TestModeProps {
  questions: Question[]
  currentQuestionIndex: number
  selectedAnswer: number | null
  score: number
  testComplete: boolean
  showMotivationalBreak: boolean
  userAnswers: number[]
  loading: boolean
  onAnswerSelect: (index: number) => void
  onTryAgain: () => void
  onBack: () => void
  onContinueFromBreak: () => void
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TestMode({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  score,
  testComplete,
  showMotivationalBreak,
  userAnswers,
  loading,
  onAnswerSelect,
  onTryAgain,
  onBack,
  onContinueFromBreak,
}: TestModeProps) {

  if (loading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // â”€â”€ Motivational break screen â”€â”€
  if (showMotivationalBreak) {
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    const questionsCompleted = currentQuestionIndex + 1
    const questionsRemaining = questions.length - questionsCompleted

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${randomMessage.color} opacity-10 dark:opacity-20`} />
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className="relative z-10">
            <div className="flex justify-center mb-6">
              <randomMessage.Icon className={`w-20 h-20 ${randomMessage.iconClass}`} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{randomMessage.title}</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{randomMessage.message}</p>
            <div className="mb-6">
              <TenorMeme caption={randomMessage.meme.caption} query={randomMessage.meme.query} />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{questionsCompleted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600">â€¢</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600">â€¢</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{questionsRemaining}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">To go</div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <button
                onClick={onContinueFromBreak}
                className="bg-primary-600 text-white rounded-2xl px-8 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer mx-auto"
              >
                Let's Keep Going! <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // â”€â”€ Test complete / results screen â”€â”€
  if (testComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
            <div className="mb-8">
              {passed ? (
                <Trophy className="w-24 h-24 mx-auto text-yellow-500 dark:text-yellow-400" />
              ) : (
                <Target className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {passed ? 'Congratulations!' : 'Good Effort!'}
            </h2>
            <div className="text-5xl font-extrabold text-primary-600 dark:text-primary-400 mb-6">{percentage}%</div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
              You got {score} out of {questions.length} correct
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBack}
                className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 font-semibold hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                Back to Menu
              </button>
              <button
                onClick={onTryAgain}
                className="bg-primary-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>

        {/* Answer Review */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Answer Review</h3>
          <div className="space-y-4">
            {questions.map((q, qi) => {
              const userAnswer = userAnswers[qi]
              const isCorrect = userAnswer === q.correctAnswer
              return (
                <div
                  key={qi}
                  className={`rounded-2xl border-2 p-4 ${isCorrect ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-950/20' : 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/20'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-success-500 dark:text-success-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-500 dark:text-error-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {q.type === 'recognition' && 'Character Recognition'}
                        {q.type === 'meaning' && 'Meaning'}
                        {q.type === 'pinyin' && 'Pinyin'}
                      </span>
                      <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                        {q.type === 'recognition' && `What character is "${q.word.pinyin}" (${q.word.english})?`}
                        {q.type === 'meaning' && `What does "${q.word.simplified}" mean?`}
                        {q.type === 'pinyin' && `What is the pinyin for "${q.word.simplified}"?`}
                      </p>
                    </div>
                  </div>
                  <div className="ml-8 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Correct:</span>
                      <span className={`text-sm font-semibold text-success-700 dark:text-success-400 ${q.type === 'recognition' ? 'text-2xl font-chinese' : ''}`}>
                        {q.options[q.correctAnswer]}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Your answer:</span>
                        <span className={`text-sm font-semibold text-error-600 dark:text-error-400 ${q.type === 'recognition' ? 'text-2xl font-chinese' : ''}`}>
                          {q.options[userAnswer]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // â”€â”€ Active quiz â”€â”€
  const question = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            â† Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Score: {score}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="mb-8">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 mb-4">
                {question.type === 'recognition' && 'Character Recognition'}
                {question.type === 'meaning' && 'Meaning'}
                {question.type === 'pinyin' && 'Pinyin'}
              </span>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {question.type === 'recognition' && `What character is "${question.word.pinyin}" (${question.word.english})?`}
                {question.type === 'meaning' && `What does "${question.word.simplified}" mean?`}
                {question.type === 'pinyin' && `What is the pinyin for "${question.word.simplified}"?`}
              </h3>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === question.correctAnswer
                const showResult = selectedAnswer !== null

                return (
                  <button
                    key={index}
                    onClick={() => onAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      showResult && isCorrect
                        ? 'border-success-500 bg-success-50 dark:bg-success-950/30'
                        : showResult && isSelected && !isCorrect
                        ? 'border-error-500 bg-error-50 dark:bg-error-950/30'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-lg text-gray-900 dark:text-gray-100 ${question.type === 'recognition' ? 'text-4xl font-chinese' : ''}`}>
                        {option}
                      </span>
                      {showResult && isCorrect && <CheckCircle className="w-6 h-6 text-success-500 dark:text-success-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-error-500 dark:text-error-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}



