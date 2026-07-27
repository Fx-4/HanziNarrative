import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Lock, Search, SearchX, Zap } from 'lucide-react'
import type { FC } from 'react'
import { learningApi } from '@/services/api'
import { PRACTICE_ITEMS, PLAY_ITEMS, type CatalogItem } from '@/data/practiceCatalog'

/** Seed jumlah kata dari cache Dashboard supaya kunci tampil instan tanpa nunggu fetch. */
function readCachedWordCount(): number | null {
  try {
    const raw = localStorage.getItem('dashboard_stats_cache')
    if (!raw) return null
    const { data } = JSON.parse(raw)
    const n = data?.overallStats?.total_words_learning
    return typeof n === 'number' ? n : null
  } catch { return null }
}

export default function Library() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  // `resolved` memisahkan "belum tahu" (masih menunggu) dari "sudah tahu".
  // Tanpa ini, user baru tanpa cache melihat item bergerbang tampil TERBUKA sesaat
  // lalu menyentak jadi terkunci saat stats tiba — sempat bisa keburu diklik.
  // Saat gagal fetch tetap fail-open (resolved=true, words=null) supaya error
  // jaringan tidak mengunci apa pun.
  const [stats, setStats] = useState<{ words: number | null; resolved: boolean }>(() => {
    const cached = readCachedWordCount()
    return { words: cached, resolved: cached !== null }
  })
  const { words: wordsLearned, resolved: statsResolved } = stats

  useEffect(() => {
    let cancelled = false
    learningApi.getAllStats()
      .then(res => { if (!cancelled) setStats({ words: res.overall.total_words_learning, resolved: true }) })
      .catch(() => { if (!cancelled) setStats(s => ({ ...s, resolved: true })) })
    return () => { cancelled = true }
  }, [])

  const q = query.trim().toLowerCase()
  const matches = (item: CatalogItem) =>
    !q ||
    t(`nav.items.${item.key}.label`).toLowerCase().includes(q) ||
    t(`nav.items.${item.key}.desc`).toLowerCase().includes(q)

  const practice = PRACTICE_ITEMS.filter(matches)
  const play = PLAY_ITEMS.filter(matches)
  const empty = practice.length === 0 && play.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">

      <header className="pt-8 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-1">
          {t('library.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {t('library.subtitle')}
        </p>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="library-search"
            name="library-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('library.searchPlaceholder')}
            aria-label={t('library.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary-400 dark:focus:border-primary-600 transition-colors"
          />
        </div>
      </header>

      {empty ? (
        <div className="flex flex-col items-center py-16 text-center">
          <SearchX className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('library.noResults', { query: query.trim() })}
          </p>
        </div>
      ) : (
        <>
          {practice.length > 0 && (
            <CatalogSection label={t('nav.sections.practice')} icon={GraduationCap} items={practice} wordsLearned={wordsLearned} statsResolved={statsResolved} />
          )}
          {play.length > 0 && (
            <CatalogSection label={t('nav.sections.play')} icon={Zap} items={play} wordsLearned={wordsLearned} statsResolved={statsResolved} />
          )}
        </>
      )}

    </div>
  )
}

function CatalogSection({ label, icon: Icon, items, wordsLearned, statsResolved }: {
  label: string
  icon: FC<{ className?: string }>
  items: CatalogItem[]
  wordsLearned: number | null
  statsResolved: boolean
}) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
        <Icon className="w-4 h-4 text-primary-500" />
        {label}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => {
          // Item bergerbang yang statusnya belum diketahui: tampilkan placeholder,
          // jangan tampilkan sebagai terbuka lalu menyentak jadi terkunci.
          if (item.unlockAt != null && !statsResolved) {
            return <PendingCard key={item.to} />
          }
          // Terkunci hanya jika ambang ada DAN kita tahu jumlahnya DAN masih kurang.
          const locked = item.unlockAt != null && wordsLearned != null && wordsLearned < item.unlockAt
          return locked
            ? <LockedCard key={item.to} item={item} />
            : <ToolCard key={item.to} item={item} />
        })}
      </div>
    </section>
  )
}

function ToolCard({ item }: { item: CatalogItem }) {
  const { t } = useTranslation()
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className="group flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {t(`nav.items.${item.key}.label`)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t(`nav.items.${item.key}.desc`)}
        </p>
      </div>
    </Link>
  )
}

/** Placeholder selagi status kunci belum diketahui (hindari kedip terbuka→terkunci). */
function PendingCard() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-surface-card/50 border border-gray-200 dark:border-gray-800">
      <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>
  )
}

function LockedCard({ item }: { item: CatalogItem }) {
  const { t } = useTranslation()
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-surface-card/50 border border-dashed border-gray-200 dark:border-gray-800 cursor-not-allowed select-none"
      title={t('library.unlockHint', { count: item.unlockAt })}
      aria-disabled="true"
    >
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 leading-tight">
          {t(`nav.items.${item.key}.label`)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
          {t('library.unlockHint', { count: item.unlockAt })}
        </p>
      </div>
    </div>
  )
}
