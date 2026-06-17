import { motion } from 'framer-motion'
import { GraduationCap, PlayCircle, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LevelSelectorProps {
  onTakeAssessment: () => void
  onSkipAssessment: () => void
}

const LevelSelector = ({ onTakeAssessment, onSkipAssessment }: LevelSelectorProps) => {
  const { t } = useTranslation()
  const testBenefits = t('onboarding.level.testBenefits', { returnObjects: true }) as string[]
  const scratchBenefits = t('onboarding.level.scratchBenefits', { returnObjects: true }) as string[]
  return (
    <div className="flex flex-col items-center px-2 max-w-3xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          {t('onboarding.level.title')}
        </h2>
        <p className="text-gray-500 text-sm">
          {t('onboarding.level.subtitle')}
        </p>
      </motion.div>

      {/* Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">

        {/* Take Assessment */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={onTakeAssessment}
          className="group relative p-6 bg-primary-50 border-2 border-primary-200 rounded-2xl text-left hover:border-primary-400 hover:shadow-lg transition-all"
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-5 px-3 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full shadow">
            {t('onboarding.level.recommended')}
          </div>

          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-primary-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('onboarding.level.testTitle')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('onboarding.level.testMeta')}</p>

          <ul className="space-y-1.5 text-sm text-gray-700">
            {testBenefits.map(b => (
              <li key={b} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg text-center group-hover:bg-primary-700 transition-colors">
            {t('onboarding.level.startTest')}
          </div>
        </motion.button>

        {/* Start from Scratch */}
        <motion.button
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onSkipAssessment}
          className="group p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl text-left hover:border-gray-400 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('onboarding.level.scratchTitle')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('onboarding.level.scratchMeta')}</p>

          <ul className="space-y-1.5 text-sm text-gray-700">
            {scratchBenefits.map(b => (
              <li key={b} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-5 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg text-center group-hover:bg-gray-300 transition-colors">
            {t('onboarding.level.skipToHsk1')}
          </div>
        </motion.button>
      </div>
    </div>
  )
}

export default LevelSelector
