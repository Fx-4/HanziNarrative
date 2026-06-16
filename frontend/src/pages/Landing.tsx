import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  BookOpen, Sparkles, Trophy, Zap, Layers,
  ArrowRight, CheckCircle, Lock, Star, Brain, Headphones,
  PenTool, Target, ChevronRight,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Logo from '@/components/Logo'

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

// ─── Story preview data (static, Chinese content — not translated) ────────────
const STORY_PREVIEW = {
  title: '在咖啡馆的一天',
  titleEn: 'A Day at the Café',
  hsk: 'HSK 2',
  sentence: [
    { text: '小明', pinyin: 'Xiǎo Míng', meaning: 'Xiao Ming', highlight: true },
    { text: '去', pinyin: 'qù', meaning: 'go', highlight: false },
    { text: '咖啡馆', pinyin: 'kāfēiguǎn', meaning: 'café', highlight: true },
    { text: '喝', pinyin: 'hē', meaning: 'drink', highlight: false },
    { text: '咖啡', pinyin: 'kāfēi', meaning: 'coffee', highlight: true },
    { text: '。', pinyin: '', meaning: '', highlight: false },
  ],
}

// ─── Feature keys (style metadata only — titles/descs come from i18n) ────────
const FEATURES = [
  { key: 'aiStories',     icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-100', badge: 'UVP', badgeColor: 'bg-violet-100 text-violet-700' },
  { key: 'vocabulary',    icon: BookOpen, color: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-sky-100' },
  { key: 'srs',           icon: Brain,    color: 'text-success-600',bg: 'bg-success-50', border: 'border-success-100' },
  { key: 'gamification',  icon: Trophy,   color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-100' },
  { key: 'speaking',      icon: Headphones,color:'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-100' },
  { key: 'practiceModes', icon: Layers,   color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-100' },
]

const WHY_PILLARS = [
  { key: 'contextBeatsIsolation', icon: Brain,   color: 'text-violet-600', bg: 'bg-violet-100' },
  { key: 'calibratedToLevel',     icon: Target,  color: 'text-primary-600',bg: 'bg-primary-100' },
  { key: 'reinforcedWithQuizzes', icon: PenTool, color: 'text-sky-600',    bg: 'bg-sky-100' },
]

const STATS = [
  { value: '1,536', labelKey: 'vocabWords' },
  { value: '6',     labelKey: 'hskLevels' },
  { value: 'AI',    labelKey: 'storyGen' },
  { value: '100%',  labelKey: 'freeToStart' },
]

const COMPARISON_ROWS = [
  { key: 'flashcards', w1: '60%',  m1: '30%',  muted: true },
  { key: 'contextual', w1: '80%',  m1: '58%',  muted: true },
  { key: 'ourMethod',  w1: '90%+', m1: '75%+', highlight: true },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { t } = useTranslation()
  const freeFeatures = t('landing.pricing.free.features', { returnObjects: true }) as string[]
  const premiumFeatures = t('landing.pricing.premium.features', { returnObjects: true }) as string[]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Logo size={32} />

          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-gray-500">
            <a href="#why"      className="hover:text-gray-900 transition-colors cursor-pointer">{t('landing.nav.whyStories')}</a>
            <a href="#features" className="hover:text-gray-900 transition-colors cursor-pointer">{t('landing.nav.features')}</a>
            <a href="#pricing"  className="hover:text-gray-900 transition-colors cursor-pointer">{t('landing.nav.pricing')}</a>
            <Link to="/about"   className="hover:text-gray-900 transition-colors">{t('landing.nav.about')}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <Link to="/login" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.auth.signIn')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-primary-500/20 transition-colors whitespace-nowrap"
            >
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-violet-50">
        {FLOATS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none font-chinese font-bold text-primary-900 hidden sm:block"
            style={{ top: f.top, left: f.left, fontSize: f.size, opacity: f.op }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: f.dur, delay: f.del, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f.char}
          </motion.span>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">

            <div>
              <motion.div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary-100 border border-primary-200 text-primary-700 text-xs sm:text-sm font-medium mb-5 sm:mb-7"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {t('landing.badge')}
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4 sm:mb-6 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t('landing.hero.headline1')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">
                  {t('landing.hero.headline2')}
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t('landing.hero.sub')}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-colors text-sm sm:text-base"
                >
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#why"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm sm:text-base shadow-sm"
                >
                  {t('landing.hero.ctaSecondary')}
                  <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>

              <motion.p
                className="text-xs sm:text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('landing.hero.trust')}
              </motion.p>
            </div>

            {/* Story card mockup — desktop only */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 32, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-violet-500/20 rounded-3xl blur-3xl transform scale-110" />

                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-primary-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-600 to-violet-600 px-5 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/70 text-xs font-medium mb-0.5">HSK 2 · AI Story</div>
                        <div className="text-white font-bold text-base md:text-lg">{STORY_PREVIEW.title}</div>
                        <div className="text-white/60 text-xs md:text-sm">{STORY_PREVIEW.titleEn}</div>
                      </div>
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3 md:mb-4">
                      {t('landing.storyCard.excerpt')}
                    </p>

                    <div className="flex flex-wrap gap-1 items-baseline mb-4 md:mb-6">
                      {STORY_PREVIEW.sentence.map((word, i) => (
                        word.text === '。' ? (
                          <span key={i} className="text-xl md:text-2xl text-gray-700 font-chinese">。</span>
                        ) : word.highlight ? (
                          <div key={i} className="group relative inline-flex flex-col items-center">
                            <span className="text-xs text-primary-500 font-medium mb-0.5">{word.pinyin}</span>
                            <span className="px-1.5 md:px-2 py-0.5 bg-primary-100 text-primary-800 rounded-lg text-xl md:text-2xl font-chinese font-medium cursor-pointer hover:bg-primary-200 transition-colors">
                              {word.text}
                            </span>
                            <span className="text-xs text-primary-400 mt-0.5">{word.meaning}</span>
                          </div>
                        ) : (
                          <div key={i} className="inline-flex flex-col items-center">
                            <span className="text-xs text-transparent mb-0.5">·</span>
                            <span className="text-xl md:text-2xl text-gray-700 font-chinese">{word.text}</span>
                            <span className="text-xs text-transparent mt-0.5">·</span>
                          </div>
                        )
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:mb-3">
                        {t('landing.storyCard.vocabInStory')}
                      </p>
                      <div className="space-y-2">
                        {[
                          { hanzi: '咖啡馆', pinyin: 'kāfēiguǎn', en: 'café' },
                          { hanzi: '咖啡',   pinyin: 'kāfēi',     en: 'coffee' },
                          { hanzi: '小明',   pinyin: 'Xiǎo Míng', en: 'Xiao Ming (name)' },
                        ].map((v) => (
                          <div key={v.hanzi} className="flex items-center justify-between text-sm">
                            <span className="font-chinese text-gray-900 text-base">{v.hanzi}</span>
                            <span className="text-gray-400 font-mono text-xs">{v.pinyin}</span>
                            <span className="text-gray-600 text-xs md:text-sm">{v.en}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 md:mt-4 flex items-center gap-2 text-xs text-primary-500 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      {t('landing.storyCard.quizUnlock')}
                    </div>
                  </div>
                </div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white border border-amber-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{t('landing.floatingBadges.storyCompleted')}</div>
                    <div className="text-xs md:text-sm font-bold text-amber-600">{t('landing.floatingBadges.xpEarned')}</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -right-4 bg-white border border-success-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-success-100 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-success-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{t('landing.floatingBadges.quizScore')}</div>
                    <div className="text-xs md:text-sm font-bold text-success-600">{t('landing.floatingBadges.correct')}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.labelKey}>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{t(`landing.stats.${s.labelKey}`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ WHY STORIES? ══ */}
      <section id="why" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs sm:text-sm font-medium mb-4">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t('landing.why.badge')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3 sm:mb-4">
              {t('landing.why.title')}
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              {t('landing.why.sub')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {WHY_PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.key}
                  className="text-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${p.bg} flex items-center justify-center mx-auto mb-4 sm:mb-5`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${p.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
                    {t(`landing.why.pillars.${p.key}.title`)}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                    {t(`landing.why.pillars.${p.key}.desc`)}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Comparison table */}
          <motion.div
            className="mt-12 sm:mt-16 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-3 text-xs sm:text-sm font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                  <div className="px-4 sm:px-6 py-3">{t('landing.why.table.method')}</div>
                  <div className="px-4 sm:px-6 py-3 text-center">{t('landing.why.table.weekRecall')}</div>
                  <div className="px-4 sm:px-6 py-3 text-center">{t('landing.why.table.monthRecall')}</div>
                </div>
                {COMPARISON_ROWS.map((row) => (
                  <div
                    key={row.key}
                    className={`grid grid-cols-3 text-xs sm:text-sm border-b border-gray-100 last:border-0 ${row.highlight ? 'bg-primary-50' : ''}`}
                  >
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 font-medium ${row.highlight ? 'text-primary-700' : 'text-gray-700'}`}>
                      {row.highlight && <span className="mr-1.5">★</span>}
                      {t(`landing.why.table.${row.key}`)}
                    </div>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold ${row.highlight ? 'text-primary-600' : 'text-gray-500'}`}>
                      {row.w1}
                    </div>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold ${row.highlight ? 'text-primary-600' : 'text-gray-500'}`}>
                      {row.m1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3 sm:mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              {t('landing.features.sub')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.key}
                  className={`rounded-2xl p-5 sm:p-6 border ${feat.border} ${feat.bg} relative overflow-hidden`}
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
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-white shadow-sm">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feat.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
                    {t(`landing.features.items.${feat.key}.title`)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {t(`landing.features.items.${feat.key}.desc`)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3 sm:mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              {t('landing.pricing.sub')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* Free */}
            <motion.div
              className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold mb-4">
                {t('landing.pricing.free.badge')}
              </span>
              <div className="flex items-baseline gap-1 mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-400">{t('landing.pricing.month')}</span>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
              >
                {t('landing.pricing.free.cta')}
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              className="rounded-2xl border-2 border-primary-400 bg-white p-6 sm:p-8 shadow-lg shadow-primary-100 relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Star className="w-3 h-3" />
                {t('landing.pricing.premium.comingSoon')}
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-4">
                {t('landing.pricing.premium.badge')}
              </span>
              <div className="flex items-baseline gap-1 mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">$9</span>
                <span className="text-gray-400">{t('landing.pricing.month')}</span>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700">
                    <Lock className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed text-sm sm:text-base"
              >
                {t('landing.pricing.premium.comingSoon')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-primary-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 hidden sm:block">
          {['汉', '字', '学', '习', '中', '文'].map((c, i) => (
            <span
              key={i}
              className="absolute font-chinese font-bold text-white select-none"
              style={{ fontSize: `${4 + (i % 3)}rem`, top: `${(i * 17) % 80}%`, left: `${(i * 19) % 90}%` }}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-6 sm:mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <span className="text-white text-3xl sm:text-4xl font-bold font-chinese">学</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-primary-200 text-base sm:text-lg mb-8 sm:mb-10">
            {t('landing.cta.sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-white hover:bg-gray-50 text-primary-700 font-semibold rounded-xl shadow-lg transition-colors text-sm sm:text-base"
            >
              {t('landing.cta.primary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
            >
              {t('landing.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-gray-100 py-6 sm:py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
          <Logo size={24} />
          <span>© {new Date().getFullYear()} HanziNarrative. {t('landing.footer.builtFor')}</span>
          <div className="flex items-center gap-4">
            <Link to="/about"    className="hover:text-gray-600 transition-colors">{t('landing.footer.about')}</Link>
            <Link to="/login"    className="hover:text-gray-600 transition-colors">{t('landing.footer.signIn')}</Link>
            <Link to="/register" className="hover:text-gray-600 transition-colors">{t('landing.footer.register')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
