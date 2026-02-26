import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Zap, ArrowRight } from 'lucide-react'

interface WelcomeScreenProps {
  onNext: () => void
}

const FEATURES = [
  {
    icon: BookOpen,
    title: 'HSK 1–6 Vocabulary',
    desc: '1,536 words with pinyin and example sentences.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Sparkles,
    title: 'AI-Generated Stories',
    desc: 'Gemini AI writes stories tailored to your level.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: Zap,
    title: 'Spaced Repetition',
    desc: 'Smart scheduling surfaces words at the right moment.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
]

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {/* Logo badge */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.7 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-8"
      >
        <span className="text-white text-4xl font-bold font-chinese">学</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4"
      >
        Welcome to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
          HanziNarrative
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed"
      >
        Let's set up your personalized Chinese learning experience. It only takes a minute.
      </motion.p>

      {/* Feature chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-2xl"
      >
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className={`${f.bg} rounded-2xl p-4 border border-gray-100 text-left`}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <Icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          )
        })}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        onClick={onNext}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors text-base"
      >
        Let's Get Started
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

export default WelcomeScreen
