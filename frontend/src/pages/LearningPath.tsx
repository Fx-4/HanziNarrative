import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CURRICULUM, UnitDef, SessionDef } from '@/data/curriculum'
import { learningPathApi, LessonProgressRecord } from '@/services/api'
import {
  CheckCircle, Lock, PlayCircle, RotateCcw, ChevronDown,
  BookOpen, Brain, Dumbbell, Star, Zap, Trophy,
  RefreshCw,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTranslation } from 'react-i18next'

const HSK_LEVELS = [1, 2, 3, 4, 5, 6]

const SESSION_TYPE_META = {
  vocab:    { icon: BookOpen, color: 'text-primary-500' },
  grammar:  { icon: Brain,    color: 'text-violet-500' },
  practice: { icon: Dumbbell, color: 'text-orange-500' },
}

function sessionStatus(
  sessionId: string,
  sessionIdx: number,
  unitSessions: SessionDef[],
  completed: Set<string>,
): 'completed' | 'available' | 'locked' {
  if (completed.has(sessionId)) return 'completed'
  if (sessionIdx === 0) return 'available'
  const prevId = unitSessions[sessionIdx - 1]?.id
  return prevId && completed.has(prevId) ? 'available' : 'locked'
}

function unitProgress(unit: UnitDef, completed: Set<string>): number {
  const done = unit.sessions.filter(s => completed.has(s.id)).length
  return Math.round((done / unit.sessions.length) * 100)
}

// Module-level cache — survives re-mounts within the same page session
type ProgressCache = {
  completed: string[]
  stats: { total_sessions: number; total_xp: number; by_hsk_level: Record<string, number> }
}
let _cache: ProgressCache | null = null
let _cacheTs = 0
const CACHE_TTL = 60_000 // 60 s — fresh enough, avoids loading flash on back-nav

export default function LearningPath() {
  const { t } = useTranslation()
  const [activeLevel, setActiveLevel] = useState(1)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<{ total_sessions: number; total_xp: number; by_hsk_level: Record<string, number> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null)

  useEffect(() => {
    loadProgress()
  }, [])

  const applyProgress = (completedIds: string[], statsData: ProgressCache['stats']) => {
    const set = new Set(completedIds)
    setCompleted(set)
    setStats(statsData)
    // Auto-expand first in-progress unit of HSK 1
    const units = CURRICULUM[1]
    let expanded = false
    for (const u of units) {
      if (unitProgress(u, set) > 0 && unitProgress(u, set) < 100) {
        setExpandedUnit(u.id)
        expanded = true
        break
      }
    }
    if (!expanded) setExpandedUnit(CURRICULUM[1][0]?.id ?? null)
  }

  const loadProgress = async () => {
    const now = Date.now()
    const cacheInvalid = sessionStorage.getItem('lp-cache-invalid')

    // Serve cached data instantly to avoid loading flash (stale-while-revalidate)
    if (_cache) {
      applyProgress(_cache.completed, _cache.stats)
      setLoading(false)
      // If cache is fresh and not invalidated, skip network call entirely
      if (!cacheInvalid && now - _cacheTs < CACHE_TTL) return
    }

    // Fetch fresh data (silently if we already have cache to show)
    sessionStorage.removeItem('lp-cache-invalid')
    if (!_cache) setLoading(true)
    setError(false)

    try {
      const [progress, statsData] = await Promise.all([
        learningPathApi.getProgress(),
        learningPathApi.getStats(),
      ])
      const completedIds = progress.map((r: LessonProgressRecord) => r.session_id)
      _cache = { completed: completedIds, stats: statsData }
      _cacheTs = Date.now()
      applyProgress(completedIds, statsData)
    } catch {
      if (!_cache) setError(true)
    } finally {
      setLoading(false)
    }
  }

  const units = CURRICULUM[activeLevel] ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
          {t('learningPath.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t('learningPath.subtitle')}
        </p>
      </motion.div>

      {/* ── Stats bar ── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: t('learningPath.sessionsDone'), value: stats.total_sessions, icon: CheckCircle, color: 'text-success-500' },
            { label: t('learningPath.totalXp'),      value: stats.total_xp,       icon: Star,         color: 'text-amber-500' },
            { label: t('learningPath.activeLevel'),  value: `HSK ${activeLevel}`, icon: Trophy,       color: 'text-primary-500', str: true },
          ].map(({ label, value, icon: Icon, color, str }) => (
            <div key={label} className="bg-white dark:bg-surface-card rounded-2xl p-3 border border-gray-100 dark:border-gray-800 text-center shadow-sm">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{str ? value : value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── HSK level tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {HSK_LEVELS.map(lv => {
          const count = stats?.by_hsk_level?.[String(lv)] ?? 0
          const total = (CURRICULUM[lv] ?? []).reduce((s, u) => s + u.sessions.length, 0)
          const isActive = activeLevel === lv
          return (
            <button
              key={lv}
              onClick={() => { setActiveLevel(lv); setExpandedUnit(null) }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              HSK {lv}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {count}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Skeleton ── */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
              {/* Emoji placeholder */}
              <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
              {/* Text + progress */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="flex-1 h-1.5 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              {/* Chevron */}
              <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="text-center py-10 space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('learningPath.loadError')}</p>
          <button onClick={loadProgress} className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 px-3 py-1.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> {t('learningPath.retry')}
          </button>
        </div>
      )}

      {/* ── Unit list ── */}
      {!loading && !error && (
        <div className="space-y-3">
          {units.map((unit, unitIdx) => {
            const pct = unitProgress(unit, completed)
            const isLocked = unit.locked
            const isExpanded = expandedUnit === unit.id

            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unitIdx * 0.05 }}
                className={`bg-white dark:bg-surface-card rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  isLocked
                    ? 'border-gray-200 dark:border-gray-800 opacity-60'
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                {/* Unit header */}
                <button
                  onClick={() => !isLocked && setExpandedUnit(isExpanded ? null : unit.id)}
                  disabled={isLocked}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:cursor-not-allowed"
                >
                  {/* Emoji + gradient badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${unit.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                    {isLocked ? '🔒' : unit.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{unit.title}</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{unit.subtitle}</p>
                    {/* Progress bar */}
                    {!isLocked && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{pct}%</span>
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    </motion.div>
                  )}
                </button>

                {/* Session list */}
                <AnimatePresence initial={false}>
                  {isExpanded && !isLocked && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800/50">
                        {unit.sessions.map((session, sIdx) => {
                          const status = sessionStatus(session.id, sIdx, unit.sessions, completed)
                          const meta = SESSION_TYPE_META[session.type]
                          const Icon = meta.icon

                          return (
                            <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                              {/* Status icon */}
                              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center">
                                {status === 'completed' && <CheckCircle className="w-5 h-5 text-success-500" />}
                                {status === 'available' && <PlayCircle className="w-5 h-5 text-primary-500" />}
                                {status === 'locked' && <Lock className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold leading-none ${
                                  status === 'locked' ? 'text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'
                                }`}>{session.title}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Icon className={`w-3 h-3 ${status === 'locked' ? 'text-gray-300' : meta.color}`} />
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{t(`learningPath.sessionType.${session.type}`)}</span>
                                  <span className="text-[11px] text-gray-300">·</span>
                                  <Zap className="w-3 h-3 text-amber-400" />
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{session.xp} XP</span>
                                </div>
                              </div>

                              {/* CTA */}
                              {status === 'available' && (
                                <Link
                                  to={`/path/session/${session.id}`}
                                  className="flex-shrink-0 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                  {t('learningPath.start')}
                                </Link>
                              )}
                              {status === 'completed' && (
                                <Link
                                  to={`/path/session/${session.id}`}
                                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" /> {t('learningPath.review')}
                                </Link>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

