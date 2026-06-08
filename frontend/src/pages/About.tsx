import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Github, Mail, Linkedin, ArrowLeft,
  Code2, Database, Server, Globe, Zap, BookOpen,
  ExternalLink, Heart,
} from 'lucide-react'

// ── Tech stack data ────────────────────────────────────────────────────────────

const TECH_STACK = [
  // Frontend
  { label: 'React 18 + TypeScript', category: 'Frontend', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { label: 'Vite 5', category: 'Frontend', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  { label: 'Tailwind CSS 3', category: 'Frontend', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { label: 'Framer Motion', category: 'Frontend', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'React Router v6', category: 'Frontend', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { label: 'Zustand', category: 'Frontend', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { label: 'Axios', category: 'Frontend', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'Radix UI', category: 'Frontend', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { label: 'hanzi-writer', category: 'Frontend', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { label: 'pinyin-pro', category: 'Frontend', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  { label: 'Recharts', category: 'Frontend', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  // Backend
  { label: 'FastAPI + Python 3.12', category: 'Backend', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { label: 'Uvicorn', category: 'Backend', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'SQLAlchemy 2 + Alembic', category: 'Backend', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  { label: 'Pydantic v2', category: 'Backend', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { label: 'python-jose + bcrypt', category: 'Backend', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  // Database
  { label: 'PostgreSQL', category: 'Database', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'Supabase', category: 'Database', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  // AI / APIs
  { label: 'Google Gemini', category: 'AI / APIs', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { label: 'Anthropic Claude', category: 'AI / APIs', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  { label: 'Groq', category: 'AI / APIs', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  { label: 'Mistral', category: 'AI / APIs', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { label: 'OpenRouter', category: 'AI / APIs', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { label: 'Cohere', category: 'AI / APIs', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  { label: 'Edge TTS', category: 'AI / APIs', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { label: 'Google Cloud TTS', category: 'AI / APIs', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { label: 'Google Cloud STT', category: 'AI / APIs', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'Pexels', category: 'AI / APIs', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'Resend', category: 'AI / APIs', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  // Deploy
  { label: 'Vercel', category: 'Deploy', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { label: 'Koyeb', category: 'Deploy', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
]

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Frontend': Code2,
  'Backend': Server,
  'Database': Database,
  'AI / APIs': Zap,
  'Deploy': Globe,
}

const SOCIAL_LINKS = [
  {
    label: 'Portfolio',
    icon: Globe,
    href: 'https://f-4-work.vercel.app/',
    color: 'hover:text-primary-600 dark:hover:text-primary-400',
  },
  {
    label: 'GitHub',
    icon: Github,
    href: 'https://github.com/Fx-4',
    color: 'hover:text-gray-900 dark:hover:text-gray-100',
  },
  {
    label: 'LinkedIn',
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/haikal-helmy-875787305/',
    color: 'hover:text-blue-600 dark:hover:text-blue-400',
  },
  {
    label: 'Email',
    icon: Mail,
    href: 'mailto:f4.code.work@gmail.com',
    color: 'hover:text-emerald-600 dark:hover:text-emerald-400',
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  }
}

export default function About() {
  const categories = [...new Set(TECH_STACK.map(t => t.category))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Back navigation */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to app
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <motion.section {...fade(0)} className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            <img
              src="/1000305954.jpg"
              alt="Haikal"
              className="w-28 h-28 rounded-3xl object-cover shadow-xl shadow-primary-500/20"
            />
          </div>

          {/* Name + bio */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Haikal</h1>
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
              Builder · Student · Chinese Language Enthusiast
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
              Saya adalah mahasiswa yang membangun <span className="font-semibold text-gray-900 dark:text-gray-100">HanziNarrative</span> sebagai
              proyek belajar mandiri — menggabungkan passion dalam belajar bahasa Mandarin dengan keinginan untuk membuat
              aplikasi yang bermanfaat. Setiap fitur di sini lahir dari pengalaman belajar saya sendiri.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-5 justify-center sm:justify-start">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  title={label}
                  className={`w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 ${color} transition-colors shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── About the Project ────────────────────────────────────── */}
        <motion.section {...fade(0.1)}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">About HanziNarrative</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              <strong className="text-gray-900 dark:text-gray-100">HanziNarrative</strong> adalah aplikasi belajar Mandarin berbasis HSK level 1–6
              yang dibangun dengan pendekatan storytelling — belajar kosakata dan tata bahasa melalui cerita interaktif,
              bukan hafalan membosankan.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Fitur mencakup flashcard spaced repetition, penulisan karakter, latihan typing pinyin, AI conversation,
              battle mode multiplayer, gamification dengan XP & badges, dan banyak lagi — semua dalam satu platform.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://hanzi-narrative.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                hanzi-narrative.vercel.app
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.section>

        {/* ── Tech Stack ───────────────────────────────────────────── */}
        <motion.section {...fade(0.15)}>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tech Stack</h2>
          </div>
          <div className="space-y-4">
            {categories.map(cat => {
              const Icon = CATEGORY_ICONS[cat] ?? Code2
              const items = TECH_STACK.filter(t => t.category === cat)
              return (
                <div key={cat} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cat}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map(t => (
                      <span key={t.label} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <motion.section {...fade(0.2)}>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Get in Touch</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Punya saran, laporan bug, atau sekadar ingin say hi? Silakan hubungi lewat email atau social media di atas.
              Feedback sangat diapresiasi!
            </p>
            <a
              href="mailto:f4.code.work@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              f4.code.work@gmail.com
            </a>
          </div>
        </motion.section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <motion.div {...fade(0.25)} className="flex items-center justify-center gap-1.5 text-sm text-gray-400 dark:text-gray-600 pb-4">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-error-400 fill-error-400" />
          <span>by Haikal · 2025</span>
        </motion.div>
      </div>
    </div>
  )
}
