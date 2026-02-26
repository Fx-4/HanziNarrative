import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  Trophy,
  Zap,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle,
  Lock,
  Star,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Floating Chinese character background
// ---------------------------------------------------------------------------
const FLOATS = [
  { char: '汉', top: '8%',  left: '5%',  size: '6rem',  dur: 22, del: 0,  op: 0.06 },
  { char: '字', top: '20%', left: '90%', size: '5rem',  dur: 28, del: 3,  op: 0.05 },
  { char: '学', top: '40%', left: '3%',  size: '7rem',  dur: 35, del: 1,  op: 0.04 },
  { char: '习', top: '60%', left: '92%', size: '4.5rem',dur: 19, del: 5,  op: 0.07 },
  { char: '中', top: '75%', left: '8%',  size: '5.5rem',dur: 26, del: 2,  op: 0.05 },
  { char: '文', top: '85%', left: '85%', size: '5rem',  dur: 31, del: 8,  op: 0.06 },
  { char: '你', top: '12%', left: '50%', size: '4rem',  dur: 24, del: 6,  op: 0.04 },
  { char: '好', top: '50%', left: '47%', size: '7rem',  dur: 40, del: 14, op: 0.03 },
]

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: BookOpen,
    title: 'HSK 1–6 Vocabulary',
    desc: '1,500+ words organized by HSK level with pinyin, definitions, and example sentences.',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
  },
  {
    icon: Sparkles,
    title: 'AI-Generated Stories',
    desc: 'Gemini AI creates immersive stories tailored to your level so you learn vocabulary in context.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    desc: 'Earn XP, streak bonuses, and unlock achievement badges as you progress through levels.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    icon: Zap,
    title: 'Spaced Repetition',
    desc: 'Smart review scheduling (SRS) surfaces forgotten words at exactly the right moment.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    icon: Layers,
    title: 'Multiple Practice Modes',
    desc: 'Flashcards, typing drills, writing practice, quizzes, and sentence builder — all in one app.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    desc: 'Track your daily streak, XP gains, words mastered, and progress across every HSK level.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
  },
]

// ---------------------------------------------------------------------------
// Free vs Premium comparison
// ---------------------------------------------------------------------------
const FREE_FEATURES = [
  'Full HSK 1–6 vocabulary access',
  'AI-generated stories (5/month)',
  'Spaced repetition reviews',
  'Flashcards & typing practice',
  'Writing practice with stroke hints',
  'Gamification & leaderboard',
]

const PREMIUM_FEATURES = [
  'Unlimited AI stories',
  'Custom vocabulary sets',
  'Offline mode',
  'Audio pronunciation by native speakers',
  'Priority support',
  'Advanced analytics & exports',
]

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
const STATS = [
  { value: '1,536', label: 'HSK words' },
  { value: '6',     label: 'HSK levels' },
  { value: 'AI',    label: 'Powered stories' },
  { value: '100%',  label: 'Free to start' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">

      {/* ──────────────────────────────────────────────────────────────────
          NAVBAR
      ────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-bold font-chinese">汉</span>
            </div>
            <span className="text-lg font-bold tracking-tight">HanziNarrative</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Pricing</a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
          HERO
      ────────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-gray-950 dark:to-violet-950/20" />

        {/* Floating characters */}
        {FLOATS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none font-chinese font-bold text-indigo-900 dark:text-indigo-200"
            style={{ top: f.top, left: f.left, fontSize: f.size, opacity: f.op }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: f.dur, delay: f.del, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f.char}
          </motion.span>
        ))}

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered Chinese learning
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Master Chinese
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              through stories
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Learn all 1,536 HSK words with AI-generated narratives, spaced repetition,
            gamification, and more. Free forever — no credit card needed.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-colors text-base"
            >
              Start learning for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors text-base shadow-sm"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p
            className="mt-8 text-sm text-gray-500 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            No credit card · Free forever · HSK 1–6 included
          </motion.p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          STATS BAR
      ────────────────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          FEATURES
      ────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need to learn Chinese
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              From beginner HSK 1 to advanced HSK 6, all the tools in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  className={`rounded-2xl p-6 border border-gray-100 dark:border-gray-800 ${feat.bg}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white dark:bg-gray-900 shadow-sm`}>
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PRICING / FREE vs PREMIUM
      ────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Start for free. Upgrade when you're ready for the full experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Free plan */}
            <motion.div
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
                  Free forever
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Get started free
              </Link>
            </motion.div>

            {/* Premium plan */}
            <motion.div
              className="rounded-2xl border-2 border-indigo-500 bg-white dark:bg-gray-900 p-8 relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* Coming soon ribbon */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <Star className="w-3 h-3" />
                Coming soon
              </div>

              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
                  Premium
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$9</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-semibold rounded-xl cursor-not-allowed"
              >
                Coming soon
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          FINAL CTA
      ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/30"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <span className="text-white text-4xl font-bold font-chinese">学</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
            Join learners mastering Chinese with HanziNarrative. Free, no card needed.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-colors text-base"
          >
            Start learning for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          FOOTER
      ────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold font-chinese">汉</span>
            </div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">HanziNarrative</span>
          </div>
          <span>© {new Date().getFullYear()} HanziNarrative. Built for learners.</span>
          <div className="flex items-center gap-4">
            <Link to="/login"    className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
