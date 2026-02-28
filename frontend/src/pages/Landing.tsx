import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Sparkles, Trophy, Zap, BarChart3, Layers,
  ArrowRight, CheckCircle, Lock, Star, Brain, Headphones,
  PenTool, Target, ChevronRight,
} from 'lucide-react'

// ─── Floating background chars ───────────────────────────────────────────────
const FLOATS = [
  { char: '汉', top: '8%',  left: '4%',  size: '7rem',  dur: 24, del: 0,  op: 0.07 },
  { char: '字', top: '18%', left: '91%', size: '5rem',  dur: 30, del: 3,  op: 0.05 },
  { char: '学', top: '42%', left: '2%',  size: '8rem',  dur: 36, del: 1,  op: 0.045 },
  { char: '习', top: '62%', left: '93%', size: '5rem',  dur: 20, del: 5,  op: 0.07 },
  { char: '中', top: '78%', left: '7%',  size: '6rem',  dur: 28, del: 2,  op: 0.055 },
  { char: '文', top: '87%', left: '86%', size: '5.5rem',dur: 32, del: 8,  op: 0.06 },
  { char: '你', top: '10%', left: '52%', size: '4.5rem',dur: 26, del: 6,  op: 0.04 },
  { char: '好', top: '52%', left: '48%', size: '8rem',  dur: 42, del: 14, op: 0.03 },
]

// ─── Story preview data ───────────────────────────────────────────────────────
const STORY_PREVIEW = {
  title: '在咖啡馆的一天',
  titleEn: 'A Day at the Café',
  hsk: 'HSK 2',
  paragraphs: [
    {
      text: '小明',
      meaning: 'Xiao Ming',
      highlight: true,
    },
  ],
  sentence: [
    { text: '小明', pinyin: 'Xiǎo Míng', meaning: 'Xiao Ming', highlight: true },
    { text: '去', pinyin: 'qù', meaning: 'go', highlight: false },
    { text: '咖啡馆', pinyin: 'kāfēiguǎn', meaning: 'café', highlight: true },
    { text: '喝', pinyin: 'hē', meaning: 'drink', highlight: false },
    { text: '咖啡', pinyin: 'kāfēi', meaning: 'coffee', highlight: true },
    { text: '。', pinyin: '', meaning: '', highlight: false },
  ],
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Generated Stories',
    desc: 'Gemini AI crafts immersive narratives calibrated to your HSK level — vocabulary lands in meaningful context, not isolated flashcards.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    badge: 'UVP',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    icon: BookOpen,
    title: 'HSK 1–6 Vocabulary',
    desc: '1,536 words organized by level with pinyin, tones, definitions, and example sentences. Your entire HSK journey in one place.',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
  {
    icon: Brain,
    title: 'Spaced Repetition',
    desc: 'Our SRS algorithm surfaces forgotten words at exactly the right moment — so you remember more with less review time.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    desc: 'Earn XP, maintain daily streaks, climb the leaderboard, and unlock achievement badges as you master each HSK level.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Headphones,
    title: 'Speaking & Listening',
    desc: 'Tone trainer, dictation, and pronunciation practice. Chinese tones are hard — we give you dedicated tools to master them.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: Layers,
    title: '10+ Practice Modes',
    desc: 'Flashcards, typing, writing strokes, quizzes, sentence builder, matching game, mock HSK exam — all in one app.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
]

// ─── Why stories work ─────────────────────────────────────────────────────────
const WHY_PILLARS = [
  {
    icon: Brain,
    title: 'Context beats isolation',
    desc: 'Your brain retains words 3× better when they appear in meaningful stories, not disconnected lists.',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
  {
    icon: Target,
    title: 'Calibrated to your level',
    desc: 'Every AI story uses only vocabulary you\'re learning — so it\'s always challenging but never overwhelming.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    icon: PenTool,
    title: 'Reinforced with quizzes',
    desc: 'Each story ends with comprehension questions. You don\'t just read — you actively recall and apply.',
    color: 'text-sky-600',
    bg: 'bg-sky-100',
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '1,536', label: 'HSK vocabulary words' },
  { value: '6',     label: 'HSK levels covered' },
  { value: 'AI',    label: 'Story generation' },
  { value: '100%',  label: 'Free to start' },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  'Full HSK 1–6 vocabulary access',
  'AI-generated stories (5/month)',
  'Spaced repetition review sessions',
  'Flashcards, typing & writing practice',
  'Gamification, XP & leaderboard',
  'Speaking & tone training',
]

const PREMIUM_FEATURES = [
  'Unlimited AI stories',
  'Custom vocabulary sets',
  'Offline mode',
  'Native speaker audio',
  'Advanced analytics & exports',
  'Priority support',
]

// ─────────────────────────────────────────────────────────────────────────────
// Component — forced light mode (no dark: prefixes)
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <span className="text-white text-base font-bold font-chinese">汉</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">HanziNarrative</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#why" className="hover:text-gray-900 transition-colors cursor-pointer">Why stories?</a>
            <a href="#features" className="hover:text-gray-900 transition-colors cursor-pointer">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors cursor-pointer">Pricing</a>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-colors"
            >
              Get started free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        {/* Floating background characters */}
        {FLOATS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none font-chinese font-bold text-indigo-900"
            style={{ top: f.top, left: f.left, fontSize: f.size, opacity: f.op }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: f.dur, delay: f.del, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f.char}
          </motion.span>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: copy ── */}
            <div>
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium mb-7"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered Chinese learning
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Master Chinese
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  through stories
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                AI generates immersive stories calibrated to your HSK level so vocabulary
                sticks through context — not rote memorization. Free forever.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors text-base"
                >
                  Start learning for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#why"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-base shadow-sm"
                >
                  See how it works
                  <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Trust */}
              <motion.p
                className="text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                No credit card · No ads · HSK 1–6 included
              </motion.p>
            </div>

            {/* ── Right: Story card mockup ── */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 32, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            >
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl transform scale-110" />

                {/* Main card */}
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-indigo-100 overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/70 text-xs font-medium mb-0.5">HSK 2 · AI Story</div>
                        <div className="text-white font-bold text-lg">{STORY_PREVIEW.title}</div>
                        <div className="text-white/60 text-sm">{STORY_PREVIEW.titleEn}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Story body */}
                  <div className="p-6">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">Story excerpt</p>

                    {/* Sentence with highlighted vocab */}
                    <div className="flex flex-wrap gap-1 items-baseline mb-6">
                      {STORY_PREVIEW.sentence.map((word, i) => (
                        word.text === '。' ? (
                          <span key={i} className="text-2xl text-gray-700 font-chinese">。</span>
                        ) : word.highlight ? (
                          <div key={i} className="group relative inline-flex flex-col items-center">
                            <span className="text-xs text-indigo-500 font-medium mb-0.5">{word.pinyin}</span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg text-2xl font-chinese font-medium cursor-pointer hover:bg-indigo-200 transition-colors">
                              {word.text}
                            </span>
                            <span className="text-xs text-indigo-400 mt-0.5">{word.meaning}</span>
                          </div>
                        ) : (
                          <div key={i} className="inline-flex flex-col items-center">
                            <span className="text-xs text-transparent mb-0.5">·</span>
                            <span className="text-2xl text-gray-700 font-chinese">{word.text}</span>
                            <span className="text-xs text-transparent mt-0.5">·</span>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Vocab list */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vocabulary in this story</p>
                      <div className="space-y-2">
                        {[
                          { hanzi: '咖啡馆', pinyin: 'kāfēiguǎn', en: 'café' },
                          { hanzi: '咖啡',   pinyin: 'kāfēi',     en: 'coffee' },
                          { hanzi: '小明',   pinyin: 'Xiǎo Míng', en: 'Xiao Ming (name)' },
                        ].map((v) => (
                          <div key={v.hanzi} className="flex items-center justify-between text-sm">
                            <span className="font-chinese text-gray-900 text-base">{v.hanzi}</span>
                            <span className="text-gray-400 font-mono text-xs">{v.pinyin}</span>
                            <span className="text-gray-600">{v.en}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quiz hint */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-indigo-500 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      Quiz unlocks after you finish the story
                    </div>
                  </div>
                </div>

                {/* Floating badge: XP earned */}
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Story completed!</div>
                    <div className="text-sm font-bold text-amber-600">+50 XP earned</div>
                  </div>
                </motion.div>

                {/* Floating badge: accuracy */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Quiz score</div>
                    <div className="text-sm font-bold text-emerald-600">92% correct</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-indigo-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY STORIES?
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="why" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Our core method
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Why stories work better
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Traditional flashcards work, but stories stick. Here's the science behind our approach.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {WHY_PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`w-7 h-7 ${p.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Comparison table */}
          <motion.div
            className="mt-16 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
              <div className="px-6 py-3">Method</div>
              <div className="px-6 py-3 text-center">Recall at 1 week</div>
              <div className="px-6 py-3 text-center">Recall at 1 month</div>
            </div>
            {[
              { method: 'Isolated flashcards', w1: '60%', m1: '30%', muted: true },
              { method: 'Contextual reading', w1: '80%', m1: '58%', muted: true },
              { method: 'Stories + SRS (us)', w1: '90%+', m1: '75%+', highlight: true },
            ].map((row) => (
              <div
                key={row.method}
                className={`grid grid-cols-3 text-sm border-b border-gray-100 last:border-0 ${row.highlight ? 'bg-indigo-50' : ''}`}
              >
                <div className={`px-6 py-4 font-medium ${row.highlight ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {row.highlight && <span className="mr-2">★</span>}
                  {row.method}
                </div>
                <div className={`px-6 py-4 text-center font-semibold ${row.highlight ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {row.w1}
                </div>
                <div className={`px-6 py-4 text-center font-semibold ${row.highlight ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {row.m1}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Everything you need to reach HSK 6
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              One platform, every tool — from beginner vocabulary to advanced fluency.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  className={`rounded-2xl p-6 border ${feat.border} ${feat.bg} relative overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  {feat.badge && (
                    <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm">
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg">
              Start free. Upgrade when you want more stories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Free */}
            <motion.div
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
                Free forever
              </span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
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

            {/* Premium */}
            <motion.div
              className="rounded-2xl border-2 border-indigo-400 bg-white p-8 shadow-lg shadow-indigo-100 relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Star className="w-3 h-3" />
                Coming soon
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
                Premium
              </span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">$9</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
              >
                Coming soon
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 opacity-10">
          {['汉', '字', '学', '习', '中', '文'].map((c, i) => (
            <span
              key={i}
              className="absolute font-chinese font-bold text-white select-none"
              style={{
                fontSize: `${4 + (i % 3)}rem`,
                top: `${(i * 17) % 80}%`,
                left: `${(i * 19) % 90}%`,
              }}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <span className="text-white text-4xl font-bold font-chinese">学</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Join learners mastering Chinese through stories. Free, no card needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white hover:bg-gray-50 text-indigo-700 font-semibold rounded-xl shadow-lg transition-colors text-base"
            >
              Start learning for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold font-chinese">汉</span>
            </div>
            <span className="font-semibold text-gray-600">HanziNarrative</span>
          </div>
          <span>© {new Date().getFullYear()} HanziNarrative. Built for learners.</span>
          <div className="flex items-center gap-4">
            <Link to="/login"    className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-gray-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
