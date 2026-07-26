import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { Trophy, Target, Award, TrendingUp, ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
  initialWordsCount,
}: CompletionScreenProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const STATS = [
    { Icon: Trophy,     label: t('onboarding.completion.startingLevel'), value: `HSK ${determinedLevel}`, bg: 'bg-primary-600' },
    { Icon: Award,      label: t('onboarding.completion.xpEarned'),      value: `${xpEarned} XP`,         bg: 'bg-violet-600',  note: achievementUnlocked ? t('onboarding.completion.achievementUnlocked') : undefined },
    { Icon: TrendingUp, label: t('onboarding.completion.playerLevel'),   value: `Level ${currentLevel}`,  bg: 'bg-primary-500', note: leveledUp ? t('onboarding.completion.levelUp') : undefined },
    { Icon: Target,     label: t('onboarding.completion.wordsReady'),    value: `${initialWordsCount}`,   bg: 'bg-primary-700', note: t('onboarding.completion.toLearn') },
  ]

  const NEXT_STEPS = [
    t('onboarding.completion.next1', { words: initialWordsCount, level: determinedLevel }),
    t('onboarding.completion.next2'),
    t('onboarding.completion.next3'),
    t('onboarding.completion.next4'),
  ]

  return (
    <div className="relative flex flex-col items-center justify-center py-8 px-4 text-center">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={400}
        gravity={0.25}
      />

      {/* Hero badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30"
      >
        <span className="text-white text-5xl font-bold font-chinese">学</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-3"
      >
        {t('onboarding.completion.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-lg mb-10"
      >
        {t('onboarding.completion.subtitle')}
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8"
      >
        {STATS.map(({ Icon, label, value, bg, note }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-white shadow-lg`}>
            <Icon className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-xs opacity-75 mb-1">{label}</p>
            <p className="text-xl font-extrabold">{value}</p>
            {note && <p className="text-xs mt-1 opacity-75">{note}</p>}
          </div>
        ))}
      </motion.div>

      {/* What's next */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md text-left bg-gray-50 dark:bg-surface-elevated border border-gray-200 dark:border-surface-border rounded-2xl p-5 mb-8"
      >
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">{t('onboarding.completion.whatsNext')}</p>
        <ul className="space-y-2">
          {NEXT_STEPS.map(step => (
            <li key={step} className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              {step}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-xl shadow-primary-500/25 transition-colors text-base"
      >
        {t('onboarding.completion.cta')}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

export default CompletionScreen
