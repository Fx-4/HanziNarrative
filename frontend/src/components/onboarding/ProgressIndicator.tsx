import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  showBackButton?: boolean
}

const ProgressIndicator = ({
  currentStep,
  totalSteps,
  onBack,
  showBackButton = true
}: ProgressIndicatorProps) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      {/* Header with back button and step counter */}
      <div className="flex items-center justify-between mb-4">
        {/* Back button */}
        <div className="w-20">
          {showBackButton && currentStep > 1 && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {/* Step counter */}
        <div className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>

        {/* Spacer for balance */}
        <div className="w-20"></div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center"
            >
              <div
                className={`w-3 h-3 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-primary-600 scale-110'
                    : isCurrent
                    ? 'bg-primary-500 scale-125 ring-4 ring-primary-200'
                    : 'bg-gray-300'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressIndicator
