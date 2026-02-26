import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import MascotCharacter from './MascotCharacter'
import { Trophy, Target, Award, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CompletionScreenProps {
  determinedLevel: number
  xpEarned: number
  currentLevel: number
  leveledUp: boolean
  achievementUnlocked: boolean
  initialWordsCount: number
}

const CompletionScreen = ({
  determinedLevel,
  xpEarned,
  currentLevel,
  leveledUp,
  achievementUnlocked,
  initialWordsCount
}: CompletionScreenProps) => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/dashboard')
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] px-4">
      {/* Confetti */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
      />

      {/* Mascot */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1 }}
      >
        <MascotCharacter
          mood="celebrating"
          message="🎉 Congratulations! You're all set to start your Chinese learning journey!"
          size="lg"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-4xl font-bold text-gray-900 text-center"
      >
        You're All Set!
      </motion.h1>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full max-w-4xl"
      >
        {/* Starting Level */}
        <div className="p-6 bg-primary-600 rounded-2xl shadow-lg text-white">
          <Trophy className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Starting Level</p>
          <p className="text-3xl font-bold">HSK {determinedLevel}</p>
        </div>

        {/* XP Earned */}
        <div className="p-6 bg-primary-500 rounded-2xl shadow-lg text-white">
          <Award className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">XP Earned</p>
          <p className="text-3xl font-bold">{xpEarned}</p>
          {achievementUnlocked && (
            <p className="text-xs mt-1 opacity-90">+ Achievement!</p>
          )}
        </div>

        {/* Current Level */}
        <div className="p-6 bg-primary-700 rounded-2xl shadow-lg text-white">
          <TrendingUp className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Your Level</p>
          <p className="text-3xl font-bold">Level {currentLevel}</p>
          {leveledUp && (
            <p className="text-xs mt-1 opacity-90">Level Up! 🎉</p>
          )}
        </div>

        {/* Words Ready */}
        <div className="p-6 bg-primary-800 rounded-2xl shadow-lg text-white">
          <Target className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Words Ready</p>
          <p className="text-3xl font-bold">{initialWordsCount}</p>
          <p className="text-xs mt-1 opacity-90">to learn</p>
        </div>
      </motion.div>

      {/* Summary Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm max-w-2xl w-full"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Start learning with {initialWordsCount} words at HSK {determinedLevel}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Track your progress on the dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Earn XP and unlock achievements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Practice with interactive exercises and stories</span>
          </li>
        </ul>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={handleStart}
        className="mt-12 btn-primary text-xl px-16 py-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all"
      >
        Start Learning Now! 🚀
      </motion.button>
    </div>
  )
}

export default CompletionScreen
