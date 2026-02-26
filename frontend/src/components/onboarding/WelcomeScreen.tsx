import { motion } from 'framer-motion'
import MascotCharacter from './MascotCharacter'
import { BookOpen, Target, TrendingUp } from 'lucide-react'

interface WelcomeScreenProps {
  onNext: () => void
}

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Interactive Learning',
      description: 'Learn Chinese through engaging stories and exercises'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Personalized Goals',
      description: 'Set your own pace and track your progress'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Adaptive System',
      description: 'Content that matches your skill level'
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      {/* Mascot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <MascotCharacter
          mood="excited"
          message="Welcome! I'm Lao Shi (老师), your guide on this Chinese learning journey!"
          size="lg"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-3xl font-bold text-gray-900 text-center"
      >
        Start Your Chinese Learning Journey
      </motion.h1>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex flex-col items-center text-center p-6 bg-primary-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full text-primary-600 mb-4 shadow-sm">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onNext}
        className="mt-12 btn-primary text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        Let's Get Started!
      </motion.button>
    </div>
  )
}

export default WelcomeScreen
