import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, BookMarked, Trophy, Zap, ArrowRight } from 'lucide-react'
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
    weekly_xp: initialGoals?.weekly_xp || 300,
  })

  const LEVEL_LABELS: Record<number, string> = {
    1: 'Beginner',
    2: 'Elementary',
    3: 'Intermediate',
    4: 'Upper-Int.',
    5: 'Advanced',
    6: 'Mastery',
  }

  const XP_LABELS: Record<number, string> = {
    100: 'Casual · ~15 min/day',
    300: 'Regular · ~30 min/day',
    500: 'Dedicated · ~1 hr/day',
    1000: 'Intensive · ~2 hr/day',
  }

  return (
    <div className="flex flex-col items-center px-2 max-w-3xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Set your learning goals
        </h2>
        <p className="text-gray-500 text-sm">You can change these anytime in your profile.</p>
      </motion.div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

        {/* Daily Time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-sky-500" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Daily Practice Time</span>
          </div>
          <input
            type="range" min="5" max="60" step="5"
            value={goals.daily_time_minutes}
            onChange={(e) => setGoals({ ...goals, daily_time_minutes: parseInt(e.target.value) })}
            className="w-full h-1.5 accent-indigo-600 rounded-full cursor-pointer"
          />
          <div className="mt-3 text-center">
            <span className="text-2xl font-extrabold text-indigo-600">{goals.daily_time_minutes}</span>
            <span className="ml-1.5 text-sm text-gray-500">min / day</span>
          </div>
        </motion.div>

        {/* Daily Words */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <BookMarked className="w-4.5 h-4.5 text-violet-500" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">New Words Daily</span>
          </div>
          <input
            type="range" min="5" max="50" step="5"
            value={goals.daily_words}
            onChange={(e) => setGoals({ ...goals, daily_words: parseInt(e.target.value) })}
            className="w-full h-1.5 accent-indigo-600 rounded-full cursor-pointer"
          />
          <div className="mt-3 text-center">
            <span className="text-2xl font-extrabold text-indigo-600">{goals.daily_words}</span>
            <span className="ml-1.5 text-sm text-gray-500">words / day</span>
          </div>
        </motion.div>

        {/* Target HSK Level */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Target HSK Level</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => setGoals({ ...goals, target_hsk_level: level })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  goals.target_hsk_level === level
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-center text-gray-400">
            HSK {goals.target_hsk_level} — {LEVEL_LABELS[goals.target_hsk_level || 3]}
          </p>
        </motion.div>

        {/* Weekly XP Target */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Weekly XP Target</span>
          </div>
          <div className="flex gap-1.5">
            {[100, 300, 500, 1000].map((xp) => (
              <button
                key={xp}
                onClick={() => setGoals({ ...goals, weekly_xp: xp })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  goals.weekly_xp === xp
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {xp}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-center text-gray-400">
            {XP_LABELS[goals.weekly_xp || 300]}
          </p>
        </motion.div>
      </div>

      {/* Continue */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        onClick={() => onNext(goals)}
        className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-colors"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

export default GoalSelector
