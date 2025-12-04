import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import {
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  Target,
  Zap
} from 'lucide-react'

interface WritingFeedbackProps {
  accuracy: number
  timeTaken: number
  mistakes: number
  totalStrokes: number
  previousAccuracy?: number
  isNewRecord?: boolean
}

export default function WritingFeedback({
  accuracy,
  timeTaken,
  mistakes,
  totalStrokes,
  previousAccuracy,
  isNewRecord = false
}: WritingFeedbackProps) {
  const getAccuracyLevel = () => {
    if (accuracy >= 95) return { level: 'perfect', color: 'emerald', message: 'Perfect! Outstanding work!' }
    if (accuracy >= 85) return { level: 'excellent', color: 'green', message: 'Excellent! Great job!' }
    if (accuracy >= 70) return { level: 'good', color: 'blue', message: 'Good work! Keep it up!' }
    if (accuracy >= 50) return { level: 'okay', color: 'yellow', message: 'Not bad! Practice more!' }
    return { level: 'needs-work', color: 'orange', message: 'Keep practicing!' }
  }

  const getSpeedRating = () => {
    const timePerStroke = timeTaken / totalStrokes
    if (timePerStroke < 1) return { rating: 'fast', icon: Zap, message: 'Lightning fast!' }
    if (timePerStroke < 2) return { rating: 'good', icon: TrendingUp, message: 'Good pace!' }
    if (timePerStroke < 3) return { rating: 'steady', icon: Clock, message: 'Steady progress!' }
    return { rating: 'slow', icon: Clock, message: 'Take your time!' }
  }

  const feedbackLevel = getAccuracyLevel()
  const speedRating = getSpeedRating()
  const improvement = previousAccuracy !== undefined ? accuracy - previousAccuracy : 0

  const cardColorClasses = {
    emerald: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300',
    green: 'bg-gradient-to-br from-green-50 to-lime-50 border-green-300',
    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300',
    yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300',
    orange: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
  }

  const iconColorClasses = {
    emerald: 'text-emerald-600 bg-emerald-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  const SpeedIcon = speedRating.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className={`p-6 ${cardColorClasses[feedbackLevel.color as keyof typeof cardColorClasses]}`}>
        {/* Main Feedback */}
        <div className="flex items-start gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`p-3 rounded-full ${iconColorClasses[feedbackLevel.color as keyof typeof iconColorClasses]}`}
          >
            {accuracy >= 70 ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </motion.div>

          <div className="flex-1">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {feedbackLevel.message}
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-sm text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Accuracy: <strong>{accuracy}%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time: <strong>{timeTaken.toFixed(1)}s</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <SpeedIcon className="w-4 h-4" />
                <span>{speedRating.message}</span>
              </div>
            </motion.div>
          </div>

          {isNewRecord && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
            >
              <div className="p-2 bg-yellow-100 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-300"
        >
          <div>
            <div className="text-xs text-gray-600 mb-1">Strokes</div>
            <div className="text-xl font-bold text-gray-900">{totalStrokes}</div>
          </div>

          <div>
            <div className="text-xs text-gray-600 mb-1">Mistakes</div>
            <div className="text-xl font-bold text-gray-900">{mistakes}</div>
          </div>

          <div>
            <div className="text-xs text-gray-600 mb-1">Speed</div>
            <div className="text-xl font-bold text-gray-900">
              {(timeTaken / totalStrokes).toFixed(1)}s/stroke
            </div>
          </div>

          {improvement !== 0 && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Improvement</div>
              <div className={`text-xl font-bold ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {improvement > 0 ? '+' : ''}{improvement}%
              </div>
            </div>
          )}
        </motion.div>

        {/* Tips based on performance */}
        {accuracy < 70 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 p-3 bg-white/50 rounded-lg"
          >
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> {mistakes > 3
                ? "Watch the stroke order animation carefully before trying again."
                : "Try to slow down and focus on accuracy rather than speed."}
            </p>
          </motion.div>
        )}

        {isNewRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <p className="text-sm font-semibold text-yellow-900">
              🏆 New Personal Record! Keep up the great work!
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
