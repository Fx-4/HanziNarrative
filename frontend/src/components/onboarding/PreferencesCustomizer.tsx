import { useState } from 'react'
import { motion } from 'framer-motion'
import MascotCharacter from './MascotCharacter'
import { Eye, Volume2, BookText, Bell, Clock } from 'lucide-react'
import type { Preferences } from '@/types'

interface PreferencesCustomizerProps {
  initialPreferences?: Preferences
  onNext: (preferences: Preferences) => void
}

const PreferencesCustomizer = ({ initialPreferences, onNext }: PreferencesCustomizerProps) => {
  const [preferences, setPreferences] = useState<Preferences>({
    learning_style: initialPreferences?.learning_style || 'visual',
    difficulty_preference: initialPreferences?.difficulty_preference || 'medium',
    reminder_enabled: initialPreferences?.reminder_enabled || false,
    reminder_time: initialPreferences?.reminder_time || '09:00',
    show_pinyin_by_default: initialPreferences?.show_pinyin_by_default ?? true
  })

  const handleSubmit = () => {
    onNext(preferences)
  }

  const learningStyles = [
    { id: 'visual', icon: <Eye className="w-6 h-6" />, label: 'Visual', description: 'Learn through images and characters' },
    { id: 'auditory', icon: <Volume2 className="w-6 h-6" />, label: 'Auditory', description: 'Focus on listening and pronunciation' },
    { id: 'reading', icon: <BookText className="w-6 h-6" />, label: 'Reading', description: 'Emphasis on text and stories' }
  ]

  const difficultyLevels = [
    { id: 'easy', label: 'Relaxed', description: 'Take it slow and steady' },
    { id: 'medium', label: 'Balanced', description: 'Steady progress' },
    { id: 'hard', label: 'Challenge', description: 'Push your limits' }
  ]

  return (
    <div className="flex flex-col items-center px-4 max-w-4xl mx-auto">
      {/* Mascot */}
      <MascotCharacter
        mood="happy"
        message="Almost done! Let's customize your learning experience."
        size="md"
      />

      {/* Title */}
      <h2 className="mt-8 text-2xl font-bold text-gray-900 text-center">
        Customize Your Experience
      </h2>

      <div className="w-full space-y-8 mt-8">
        {/* Learning Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Learning Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setPreferences({ ...preferences, learning_style: style.id })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  preferences.learning_style === style.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-200'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`${preferences.learning_style === style.id ? 'text-primary-600' : 'text-gray-600'}`}>
                    {style.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900">{style.label}</h4>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Difficulty Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Difficulty Preference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setPreferences({ ...preferences, difficulty_preference: level.id })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  preferences.difficulty_preference === level.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-200'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-1">{level.label}</h4>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Daily Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Reminders</h3>
                <p className="text-sm text-gray-600">Get notified to practice every day</p>
              </div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, reminder_enabled: !preferences.reminder_enabled })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                preferences.reminder_enabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  preferences.reminder_enabled ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {preferences.reminder_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-3 pl-8"
            >
              <Clock className="w-5 h-5 text-gray-600" />
              <input
                type="time"
                value={preferences.reminder_time}
                onChange={(e) => setPreferences({ ...preferences, reminder_time: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Show Pinyin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Show Pinyin by Default</h3>
            <p className="text-sm text-gray-600">Display romanization with Chinese characters</p>
          </div>
            <button
              onClick={() => setPreferences({ ...preferences, show_pinyin_by_default: !preferences.show_pinyin_by_default })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
              preferences.show_pinyin_by_default ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                preferences.show_pinyin_by_default ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
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
        Complete Setup
      </motion.button>
    </div>
  )
}

export default PreferencesCustomizer
