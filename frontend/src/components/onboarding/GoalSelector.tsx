import { useState } from 'react'
import { motion } from 'framer-motion'
import MascotCharacter from './MascotCharacter'
import { Clock, BookMarked, Trophy, Calendar } from 'lucide-react'
import type { Goals } from '@/types'

interface GoalSelectorProps {
  initialGoals?: Goals
  onNext: (goals: Goals) => void
}

const GoalSelector = ({ initialGoals, onNext }: GoalSelectorProps) => {
  const [goals, setGoals] = useState<Goals>({
    daily_time_minutes: initialGoals?.daily_time_minutes || 15,
    daily_words: initialGoals?.daily_words || 10,
    target_hsk_level: initialGoals?.target_hsk_level || 3,
    weekly_xp: initialGoals?.weekly_xp || 300
  })

  const handleSubmit = () => {
    onNext(goals)
  }

  return (
    <div className="flex flex-col items-center px-4 max-w-4xl mx-auto">
      {/* Mascot */}
      <MascotCharacter
        mood="thoughtful"
        message="Let's set some goals to keep you motivated! You can always change these later."
        size="md"
      />

      {/* Title */}
      <h2 className="mt-8 text-2xl font-bold text-gray-900 text-center">
        What are your learning goals?
      </h2>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
        {/* Daily Time Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Daily Practice Time</h3>
          </div>

          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={goals.daily_time_minutes}
            onChange={(e) =>
              setGoals({ ...goals, daily_time_minutes: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />

          <div className="mt-3 text-center">
            <span className="text-3xl font-bold text-primary-600">
              {goals.daily_time_minutes}
            </span>
            <span className="ml-2 text-gray-600">minutes/day</span>
          </div>
        </motion.div>

        {/* Daily Words Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <BookMarked className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">New Words Daily</h3>
          </div>

          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={goals.daily_words}
            onChange={(e) =>
              setGoals({ ...goals, daily_words: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />

          <div className="mt-3 text-center">
            <span className="text-3xl font-bold text-primary-600">
              {goals.daily_words}
            </span>
            <span className="ml-2 text-gray-600">words/day</span>
          </div>
        </motion.div>

        {/* Target HSK Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Target HSK Level</h3>
          </div>

          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => setGoals({ ...goals, target_hsk_level: level })}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  goals.target_hsk_level === level
                    ? 'bg-primary-600 text-white scale-110 shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-center text-gray-600">
            HSK {goals.target_hsk_level} - {getLevelDescription(goals.target_hsk_level || 3)}
          </p>
        </motion.div>

        {/* Weekly XP Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Weekly XP Target</h3>
          </div>

          <div className="flex gap-2 mt-4">
            {[100, 300, 500, 1000].map((xp) => (
              <button
                key={xp}
                onClick={() => setGoals({ ...goals, weekly_xp: xp })}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  goals.weekly_xp === xp
                    ? 'bg-primary-600 text-white scale-105 shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {xp}
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-center text-gray-600">
            {getXPDescription(goals.weekly_xp || 300)}
          </p>
        </motion.div>
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleSubmit}
        className="mt-12 btn-primary text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        Continue
      </motion.button>
    </div>
  )
}

function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Beginner (150 words)',
    2: 'Elementary (300 words)',
    3: 'Intermediate (600 words)',
    4: 'Upper Intermediate (1200 words)',
    5: 'Advanced (2500 words)',
    6: 'Mastery (5000+ words)'
  }
  return descriptions[level] || ''
}

function getXPDescription(xp: number): string {
  const descriptions: Record<number, string> = {
    100: 'Casual learner - ~15 min/day',
    300: 'Regular practice - ~30 min/day',
    500: 'Dedicated student - ~1 hour/day',
    1000: 'Intensive learning - ~2 hours/day'
  }
  return descriptions[xp] || ''
}

export default GoalSelector
