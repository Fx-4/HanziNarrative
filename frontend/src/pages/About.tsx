import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Github, Mail, Linkedin, ArrowLeft,
  Code2, Database, Server, Globe, Zap, BookOpen,
  ExternalLink, Heart,
} from 'lucide-react'

// ── Tech stack data ────────────────────────────────────────────────────────────

// Static map so Tailwind JIT includes every class used in tooltips
const TOOLTIP_COLORS: Record<string, { bg: string; border: string; arrow: string }> = {
  cyan:    { bg: 'bg-cyan-700',    border: 'border-cyan-500/50',    arrow: 'border-t-cyan-700' },
  violet:  { bg: 'bg-violet-700',  border: 'border-violet-500/50',  arrow: 'border-t-violet-700' },
  sky:     { bg: 'bg-sky-600',     border: 'border-sky-400/50',     arrow: 'border-t-sky-600' },
  pink:    { bg: 'bg-pink-600',    border: 'border-pink-400/50',    arrow: 'border-t-pink-600' },
  red:     { bg: 'bg-red-700',     border: 'border-red-500/50',     arrow: 'border-t-red-700' },
  orange:  { bg: 'bg-orange-600',  border: 'border-orange-400/50',  arrow: 'border-t-orange-600' },
  purple:  { bg: 'bg-purple-700',  border: 'border-purple-500/50',  arrow: 'border-t-purple-700' },
  slate:   { bg: 'bg-slate-700',   border: 'border-slate-500/50',   arrow: 'border-t-slate-700' },
  amber:   { bg: 'bg-amber-700',   border: 'border-amber-500/50',   arrow: 'border-t-amber-700' },
  lime:    { bg: 'bg-lime-700',    border: 'border-lime-500/50',    arrow: 'border-t-lime-700' },
  emerald: { bg: 'bg-emerald-700', border: 'border-emerald-500/50', arrow: 'border-t-emerald-700' },
  green:   { bg: 'bg-green-700',   border: 'border-green-500/50',   arrow: 'border-t-green-700' },
  teal:    { bg: 'bg-teal-700',    border: 'border-teal-500/50',    arrow: 'border-t-teal-700' },
  blue:    { bg: 'bg-blue-700',    border: 'border-blue-500/50',    arrow: 'border-t-blue-700' },
  indigo:  { bg: 'bg-indigo-700',  border: 'border-indigo-500/50',  arrow: 'border-t-indigo-700' },
  rose:    { bg: 'bg-rose-600',    border: 'border-rose-400/50',    arrow: 'border-t-rose-600' },
  gray:    { bg: 'bg-gray-700',    border: 'border-gray-500/50',    arrow: 'border-t-gray-700' },
}

const TECH_STACK = [
  // Frontend
  { label: 'React 18 + TypeScript', category: 'Frontend', tc: 'cyan',    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',       desc: 'Component-based UI dengan type safety penuh — mencegah bug di runtime sebelum deploy.' },
  { label: 'Vite 5',                category: 'Frontend', tc: 'violet',  color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', desc: 'Dev server dengan HMR instan — build jauh lebih cepat dibanding Create React App.' },
  { label: 'Tailwind CSS 3',        category: 'Frontend', tc: 'sky',     color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',             desc: 'Utility-first dengan custom design tokens. Dark mode dan responsive layout jadi jauh lebih mudah.' },
  { label: 'Framer Motion',         category: 'Frontend', tc: 'pink',    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',         desc: 'Animasi halus dengan API deklaratif. Dipakai untuk page transition, card flip, dan micro-interactions.' },
  { label: 'React Router v6',       category: 'Frontend', tc: 'red',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             desc: 'Client-side routing dengan nested routes dan lazy loading per halaman.' },
  { label: 'Zustand',               category: 'Frontend', tc: 'orange',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', desc: 'State management minimalis tanpa boilerplate Redux. Dipakai untuk auth state dan theme.' },
  { label: 'Axios',                 category: 'Frontend', tc: 'purple',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', desc: 'HTTP client dengan interceptor — auto token refresh dan retry request saat 401.' },
  { label: 'Radix UI',              category: 'Frontend', tc: 'slate',   color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',         desc: 'Accessible primitives (dialog, select, tabs, toast) yang unstyled — tinggal tambah Tailwind.' },
  { label: 'hanzi-writer',          category: 'Frontend', tc: 'amber',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',     desc: 'Animasi stroke order karakter Hanzi secara interaktif — fitur utama latihan menulis.' },
  { label: 'pinyin-pro',            category: 'Frontend', tc: 'lime',    color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',         desc: 'Konversi teks Mandarin ke pinyin dengan akurat, termasuk tanda nada.' },
  { label: 'Recharts',              category: 'Frontend', tc: 'emerald', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', desc: 'Chart progress belajar dan statistik XP di dashboard — berbasis SVG dan mudah dikustomisasi.' },
  // Backend
  { label: 'FastAPI + Python 3.12', category: 'Backend',  tc: 'emerald', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', desc: 'Framework async modern dengan auto-docs Swagger. Cocok untuk AI endpoints yang butuh streaming.' },
  { label: 'Uvicorn',               category: 'Backend',  tc: 'green',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',     desc: 'ASGI server yang cepat untuk menjalankan FastAPI di production.' },
  { label: 'SQLAlchemy 2 + Alembic',category: 'Backend',  tc: 'teal',    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',         desc: 'ORM untuk query database yang type-safe, Alembic untuk migration schema yang terstruktur.' },
  { label: 'Pydantic v2',           category: 'Backend',  tc: 'cyan',    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',         desc: 'Validasi request dan response otomatis via type hints — error terdeteksi sebelum sampai ke database.' },
  { label: 'python-jose + bcrypt',  category: 'Backend',  tc: 'blue',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         desc: 'JWT untuk access & refresh token, bcrypt untuk hashing password yang aman.' },
  // Database
  { label: 'PostgreSQL',            category: 'Database', tc: 'blue',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         desc: 'Database relasional andal untuk menyimpan data user, progress belajar, dan kata kosakata.' },
  { label: 'Supabase',              category: 'Database', tc: 'indigo',  color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', desc: 'Hosted PostgreSQL dengan dashboard visual dan free tier yang cukup untuk skala project ini.' },
  // AI / APIs
  { label: 'Google Gemini',         category: 'AI / APIs', tc: 'amber',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',     desc: 'Primary AI — dipakai untuk generate cerita, conversation, dan badge. Paling konsisten dan cepat.' },
  { label: 'Anthropic Claude',      category: 'AI / APIs', tc: 'violet', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', desc: 'Last-resort AI fallback dengan kemampuan reasoning yang sangat baik.' },
  { label: 'Groq',                  category: 'AI / APIs', tc: 'lime',   color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',         desc: 'Secondary AI fallback — inference sangat cepat berkat hardware LPU khusus.' },
  { label: 'Mistral',               category: 'AI / APIs', tc: 'orange', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', desc: 'Tertiary AI fallback — model open source yang efisien untuk teks pendek.' },
  { label: 'OpenRouter',            category: 'AI / APIs', tc: 'cyan',   color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',         desc: 'Gateway ke berbagai model AI — satu API key untuk banyak provider sekaligus.' },
  { label: 'Cohere',                category: 'AI / APIs', tc: 'teal',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',         desc: 'AI fallback tambahan untuk memastikan availability tinggi meski satu provider down.' },
  { label: 'Edge TTS',              category: 'AI / APIs', tc: 'rose',   color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',         desc: 'Primary TTS — suara natural Microsoft, gratis, dan di-cache agar tidak generate ulang.' },
  { label: 'Google Cloud TTS',      category: 'AI / APIs', tc: 'red',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             desc: 'TTS fallback dengan kualitas premium dan pilihan suara Mandarin yang beragam.' },
  { label: 'Google Cloud STT',      category: 'AI / APIs', tc: 'pink',   color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',         desc: 'Speech-to-text untuk fitur pronunciation practice — mendeteksi akurasi pelafalan.' },
  { label: 'Pexels',                category: 'AI / APIs', tc: 'green',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',     desc: 'Gambar ilustrasi kosakata free royalty — memperkuat konteks visual saat belajar kata baru.' },
  { label: 'Resend',                category: 'AI / APIs', tc: 'slate',  color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',         desc: 'Email transaksional untuk fitur reset password — API sederhana dan deliverability tinggi.' },
  // Deploy
  { label: 'Vercel',                category: 'Deploy',    tc: 'gray',   color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',             desc: 'Deploy frontend — CI/CD otomatis dari GitHub, CDN global, dan preview per branch.' },
  { label: 'Koyeb',                 category: 'Deploy',    tc: 'purple', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', desc: 'Deploy backend Python — free tier yang mendukung always-on dengan cold start yang wajar.' },
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

// ── TechBadge with tooltip ─────────────────────────────────────────────────────

function TechBadge({ label, color, desc, tc }: { label: string; color: string; desc: string; tc: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tt = TOOLTIP_COLORS[tc] ?? TOOLTIP_COLORS.gray

  // Close on outside click (mobile)
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div
      ref={ref}
      className="relative w-fit"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(v => !v)}
    >
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-default select-none ${color}`}>
        {label}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-52 px-3 py-2.5 rounded-xl ${tt.bg} border ${tt.border} text-white text-xs leading-relaxed shadow-2xl pointer-events-none text-center`}
          >
            {desc}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent ${tt.arrow}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

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
          <div className="shrink-0">
            <img
              src="/1000305954.jpg"
              alt="Haikal"
              className="w-28 h-28 rounded-3xl object-cover shadow-xl shadow-primary-500/20"
            />
          </div>

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
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tech Stack</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 ml-7">Hover atau tap badge untuk lihat alasan pemilihannya</p>
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
                      <TechBadge key={t.label} label={t.label} color={t.color} desc={t.desc} tc={t.tc} />
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
