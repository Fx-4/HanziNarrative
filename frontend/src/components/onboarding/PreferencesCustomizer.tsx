import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Volume2, BookText, Bell, Clock, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Preferences } from '@/types'

interface PreferencesCustomizerProps {
  initialPreferences?: Preferences
  onNext: (preferences: Preferences) => void
}

const LEARNING_STYLES = [
  { id: 'visual',   Icon: Eye,      color: 'text-sky-500',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  { id: 'auditory', Icon: Volume2,  color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'reading',  Icon: BookText, color: 'text-emerald-500',bg: 'bg-emerald-50',border: 'border-emerald-200' },
] as const

const DIFFICULTIES = [
  { id: 'easy' },
  { id: 'medium' },
  { id: 'hard' },
] as const

const PreferencesCustomizer = ({ initialPreferences, onNext }: PreferencesCustomizerProps) => {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState<Preferences>({
    learning_style:        initialPreferences?.learning_style        || 'visual',
    difficulty_preference: initialPreferences?.difficulty_preference || 'medium',
    reminder_enabled:      initialPreferences?.reminder_enabled      || false,
    reminder_time:         initialPreferences?.reminder_time         || '09:00',
    show_pinyin_by_default: initialPreferences?.show_pinyin_by_default ?? true,
  })

  return (
    <div className="flex flex-col items-center px-2 max-w-3xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          {t('onboarding.preferences.title')}
        </h2>
        <p className="text-gray-500 text-sm">{t('onboarding.preferences.subtitle')}</p>
      </motion.div>

      <div className="w-full space-y-6">
        {/* Learning style */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('onboarding.preferences.learningStyle')}</p>
          <div className="grid grid-cols-3 gap-3">
            {LEARNING_STYLES.map(({ id, Icon, color, bg, border }) => (
              <button
                key={id}
                onClick={() => setPrefs({ ...prefs, learning_style: id })}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  prefs.learning_style === id
                    ? `${bg} ${border} shadow-sm`
                    : 'bg-white dark:bg-surface-elevated border-gray-200 dark:border-surface-border hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${prefs.learning_style === id ? bg : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${prefs.learning_style === id ? color : 'text-gray-400'}`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t(`onboarding.preferences.styles.${id}.label`)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`onboarding.preferences.styles.${id}.desc`)}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Difficulty */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('onboarding.preferences.difficulty')}</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(({ id }) => (
              <button
                key={id}
                onClick={() => setPrefs({ ...prefs, difficulty_preference: id })}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  prefs.difficulty_preference === id
                    ? 'bg-primary-50 border-primary-300 shadow-sm'
                    : 'bg-white dark:bg-surface-elevated border-gray-200 dark:border-surface-border hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <p className={`font-semibold text-sm ${prefs.difficulty_preference === id ? 'text-primary-700' : 'text-gray-900'}`}>{t(`onboarding.preferences.difficulties.${id}.label`)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`onboarding.preferences.difficulties.${id}.desc`)}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Show pinyin */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-xl border border-gray-200 dark:border-surface-border">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{t('onboarding.preferences.showPinyin')}</p>
              <p className="text-xs text-gray-500">{t('onboarding.preferences.showPinyinDesc')}</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, show_pinyin_by_default: !prefs.show_pinyin_by_default })}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${prefs.show_pinyin_by_default ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.show_pinyin_by_default ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Reminders */}
          <div className="p-4 bg-gray-50 dark:bg-surface-elevated rounded-xl border border-gray-200 dark:border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('onboarding.preferences.reminders')}</p>
                  <p className="text-xs text-gray-500">{t('onboarding.preferences.remindersDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => setPrefs({ ...prefs, reminder_enabled: !prefs.reminder_enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${prefs.reminder_enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.reminder_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {prefs.reminder_enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 pl-6"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={prefs.reminder_time}
                  onChange={(e) => setPrefs({ ...prefs, reminder_time: e.target.value })}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:outline-none bg-white"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Complete button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => onNext(prefs)}
        className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-colors"
      >
        {t('onboarding.preferences.complete')}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

export default PreferencesCustomizer
