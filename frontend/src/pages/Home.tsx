import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, BarChart3, BookOpen, Brain, CheckCircle2, LayoutGrid, Play,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { learningApi, learningPathApi } from '@/services/api'
import { ALL_UNITS } from '@/data/curriculum'
import DailyChallengeCard from '@/components/DailyChallengeCard'
import { hasPlayedIntro, markIntroPlayed } from '@/utils/uiPrefs'

interface NextLesson {
  sessionId: string
  sessionTitle: string
  sessionSubtitle: string
  unitTitle: string
  unitEmoji: string
  done: number
  total: number
}

/** Sesi pertama yang belum selesai, mengikuti urutan kurikulum (unit terkunci dilewati). */
function findNextLesson(completed: Set<string>): NextLesson | null {
  for (const unit of ALL_UNITS) {
    if (unit.locked) continue
    const next = unit.sessions.find(s => !completed.has(s.id))
    if (next) {
      return {
        sessionId: next.id,
        sessionTitle: next.title,
        sessionSubtitle: next.subtitle,
        unitTitle: unit.title,
        unitEmoji: unit.emoji,
        done: unit.sessions.filter(s => completed.has(s.id)).length,
        total: unit.sessions.length,
      }
    }
  }
  return null
}

const SHORTCUTS = [
  { to: '/stories',   key: 'stories', icon: BookOpen },
  { to: '/library',   key: 'library', icon: LayoutGrid },
  { to: '/dashboard', key: 'stats',   icon: BarChart3 },
]

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const intro = !hasPlayedIntro('home')
  useEffect(() => { markIntroPlayed('home') }, [])

  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [next, setNext] = useState<NextLesson | null>(null)
  const [reviewCount, setReviewCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [progressRes, countRes] = await Promise.allSettled([
        learningPathApi.getProgress(),
        learningApi.getReviewCount(),
      ])
      if (cancelled) return
      const completed = progressRes.status === 'fulfilled'
        ? new Set(progressRes.value.map(r => r.session_id))
        : new Set<string>()
      setStarted(completed.size > 0)
      setNext(findNextLesson(completed))
      setReviewCount(countRes.status === 'fulfilled' ? countRes.value.count : 0)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const name = user?.full_name || user?.username || ''

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">

      {/* ── Greeting ── */}
      <motion.header
        initial={intro ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 sm:pt-10 pb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-1">
          {t('home.greeting', { name })}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('home.subtitle')}</p>
      </motion.header>

      {/* ── Lanjutkan belajar ── */}
      <motion.section
        initial={intro ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-4"
      >
        {loading ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-3xl h-40" />
        ) : (
          <div className="bg-gradient-to-br from-primary-600 to-violet-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-primary-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
                  {t('home.continueTitle')}
                </p>
                {next ? (
                  <>
                    <p className="text-sm text-white/80 mb-0.5">
                      {next.unitEmoji} {next.unitTitle}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-1 text-white">
                      {next.sessionTitle}
                    </h2>
                    <p className="text-sm text-white/70">{next.sessionSubtitle}</p>
                  </>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white">
                    {t('home.viewPath')}
                  </h2>
                )}
              </div>
            </div>

            {next && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                  <span>{t('home.unitProgress', { done: next.done, total: next.total })}</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${(next.done / next.total) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to={next ? `/path/session/${next.sessionId}` : '/path'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-sm"
              >
                <Play className="w-4 h-4" />
                {started ? t('home.continueCta') : t('home.startCta')}
              </Link>
              <Link
                to="/path"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                {t('home.viewPath')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── Review + Daily Challenge ── */}
      <motion.section
        initial={intro ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        <div className="bg-white dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-50 text-sm">
              {t('nav.items.review.label')}
            </h3>
          </div>

          {loading || reviewCount === null ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-16 flex-1" />
          ) : reviewCount > 0 ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                {t('home.reviewDue', { count: reviewCount })}
              </p>
              <Link
                to="/review"
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {t('home.reviewCta')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
              {t('home.reviewNone')}
            </div>
          )}
        </div>

        <DailyChallengeCard />
      </motion.section>

      {/* ── Shortcuts ── */}
      <motion.section
        initial={intro ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3"
      >
        {SHORTCUTS.map(({ to, key, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
          >
            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t(`nav.items.${key}.label`)}
            </span>
          </Link>
        ))}
      </motion.section>

    </div>
  )
}
