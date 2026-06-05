import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  BookOpen, PenLine, PenTool, Target, BarChart3,
  ArrowRight, Sparkles, GraduationCap, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import DailyChallengeCard from '@/components/DailyChallengeCard'

// Feature data
const FEATURES = [
  {
    Icon: BookOpen,
    title: 'Interactive Stories',
    desc: 'Read engaging stories with clickable words that reveal Pinyin, meaning, and illustrations.',
    bg: 'bg-primary-600', shadow: 'shadow-primary-500/20',
  },
  {
    Icon: Target,
    title: 'HSK Focused',
    desc: 'Content organized by HSK levels 1–6, from everyday beginner vocabulary to advanced topics.',
    bg: 'bg-success-600', shadow: 'shadow-success-500/20',
  },
  {
    Icon: BarChart3,
    title: 'Track Progress',
    desc: 'Save words, review with flashcards, and watch your mastery grow over time.',
    bg: 'bg-violet-600', shadow: 'shadow-violet-500/20',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Choose Your Level',
    desc: 'Select stories matching your HSK level or challenge yourself with something harder.',
  },
  {
    n: '2',
    title: 'Read & Click',
    desc: 'Tap any character to instantly see its pronunciation, English meaning, and an image.',
  },
  {
    n: '3',
    title: 'Review & Master',
    desc: 'Save words to your personal collection and reinforce them with spaced-repetition review.',
  },
]

const TOOLS = [
  {
    href: '/stories',
    Icon: BookOpen,
    label: 'Stories',
    desc: 'Interactive Chinese stories with clickable word lookups',
    accent: 'indigo',
    cta: 'Start Reading',
  },
  {
    href: '/writing',
    Icon: PenLine,
    label: 'Writing',
    desc: 'Stroke order guidance and real-time character feedback',
    accent: 'violet',
    cta: 'Practice Writing',
  },
  {
    href: '/sentence-builder',
    Icon: PenTool,
    label: 'Sentences',
    desc: 'Arrange words into correct Chinese sentences to master grammar',
    accent: 'emerald',
    cta: 'Build Sentences',
  },
]

const accentMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: 'bg-primary-600', text: 'text-primary-600', border: 'border-primary-200', light: 'bg-primary-50' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
  emerald: { bg: 'bg-success-600', text: 'text-success-600', border: 'border-success-200', light: 'bg-success-50' },
}

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="text-center py-16 sm:py-20">

        {/* Decorative character */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30"
        >
          <span className="text-white text-4xl sm:text-5xl font-bold font-chinese">汉</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
        >
          Learn HSK Through
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-violet-600">
            Immersive Stories
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg text-gray-500 mb-8 max-w-2xl mx-auto"
        >
          Click any Chinese word to see its Pinyin, English meaning, and an illustrative image.
          Transform rote memorization into an intuitive, story-driven experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/stories"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Start Reading
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Sign Up Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* ── Daily Challenge ──────────────────────────────────────────────── */}
      {isAuthenticated && (
        <section className="mb-8">
          <DailyChallengeCard />
        </section>
      )}

      {/* ── Feature Cards ───────────────────────────────────────────────── */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc, bg, shadow }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`${bg} rounded-2xl p-5 text-white shadow-lg ${shadow}`}
            >
              <Icon className="w-7 h-7 mb-3 opacity-90" />
              <h3 className="font-extrabold text-base mb-1">{title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            How It Works
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">Three simple steps to Chinese fluency</p>

          <div className="space-y-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-lg shadow-primary-500/20">
                  {n}
                </div>
                <div className="pt-1">
                  <h3 className="font-extrabold text-gray-900 text-base mb-0.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Learning Tools ───────────────────────────────────────────────── */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            Learning Tools
          </h2>
          <p className="text-sm text-gray-400">Everything you need to master Chinese</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {TOOLS.map(({ href, Icon, label, desc, accent, cta }, i) => {
            const a = accentMap[accent]
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={href}
                  className={`flex flex-col h-full bg-white rounded-2xl border ${a.border} hover:shadow-lg transition-shadow p-5 group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${a.light} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${a.text}`} />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1">{label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-3">{desc}</p>
                  <span className={`text-xs font-semibold ${a.text} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                    {cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-3xl p-8 text-center text-white shadow-2xl shadow-primary-500/25"
        >
          <Zap className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-extrabold mb-2">Ready to start?</h2>
          <p className="text-primary-100 text-sm mb-6">Create a free account and begin your Chinese journey today.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

    </div>
  )
}

