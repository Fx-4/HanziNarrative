import { motion } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProgressIndicatorProps {
  currentStep: number   // internal step 2–5
  onBack?: () => void
  showBackButton?: boolean
}

const STEPS = [
  { key: 'goals' },
  { key: 'level' },
  { key: 'preferences' },
] as const

// Maps internal step numbers to visual progress (1–3)
function getVisualStep(currentStep: number): number {
  if (currentStep === 2) return 1
  if (currentStep === 3 || currentStep === 4) return 2
  if (currentStep === 5) return 3
  return 0
}

const ProgressIndicator = ({
  currentStep,
  onBack,
  showBackButton = true,
}: ProgressIndicatorProps) => {
  const { t } = useTranslation()
  const visual = getVisualStep(currentStep)

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        {/* Back button */}
        <div className="w-16">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('onboarding.back')}
            </button>
          )}
        </div>

        {/* Named step pills */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, idx) => {
            const stepVisual = idx + 1
            const isCompleted = stepVisual < visual
            const isCurrent   = stepVisual === visual

            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-primary-100 text-primary-600'
                      : isCurrent
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted
                    ? <Check className="w-3 h-3 shrink-0" />
                    : <span className="w-3 h-3 flex items-center justify-center font-bold text-[10px]">{stepVisual}</span>
                  }
                  {t(`onboarding.steps.${s.key}`)}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-3 transition-colors ${stepVisual < visual ? 'bg-primary-300' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(visual / 3) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default ProgressIndicator
