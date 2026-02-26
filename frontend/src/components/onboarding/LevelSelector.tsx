import { motion } from 'framer-motion'
import MascotCharacter from './MascotCharacter'
import { GraduationCap, PlayCircle } from 'lucide-react'

interface LevelSelectorProps {
  onTakeAssessment: () => void
  onSkipAssessment: () => void
}

const LevelSelector = ({ onTakeAssessment, onSkipAssessment }: LevelSelectorProps) => {
  return (
    <div className="flex flex-col items-center px-4 max-w-4xl mx-auto">
      {/* Mascot */}
      <MascotCharacter
        mood="thoughtful"
        message="How should we determine your starting level?"
        size="md"
      />

      {/* Title */}
      <h2 className="mt-8 text-2xl font-bold text-gray-900 text-center">
        Choose Your Path
      </h2>

      {/* Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-3xl">
        {/* Take Assessment Option */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onTakeAssessment}
          className="group relative p-8 bg-primary-50 border-2 border-primary-200 rounded-2xl shadow-lg hover:shadow-2xl hover:border-primary-400 transition-all transform hover:scale-105"
        >
          {/* Recommended Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-md">
            Recommended
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Take Quick Test
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              ~5 minutes
            </p>

            {/* Benefits */}
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Personalized placement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Adaptive difficulty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Earn XP while testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Start at your true level</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="mt-6 px-6 py-2 bg-white rounded-full text-primary-600 font-semibold group-hover:bg-primary-600 group-hover:text-white transition-colors">
              Start Test
            </div>
          </div>
        </motion.button>

        {/* Skip to HSK 1 Option */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onSkipAssessment}
          className="group relative p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl hover:border-gray-400 transition-all transform hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-8 h-8" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Start from Scratch
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              Begin with HSK 1
            </p>

            {/* Benefits */}
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                <span>No pressure, no testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                <span>Start from the basics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                <span>Build strong foundation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                <span>Perfect for beginners</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="mt-6 px-6 py-2 bg-white rounded-full text-gray-600 font-semibold group-hover:bg-gray-600 group-hover:text-white transition-colors">
              Skip to HSK 1
            </div>
          </div>
        </motion.button>
      </div>

      {/* Helper Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm text-gray-600 text-center max-w-xl"
      >
        Don't worry! You can always adjust your level later in your profile settings.
      </motion.p>
    </div>
  )
}

export default LevelSelector
