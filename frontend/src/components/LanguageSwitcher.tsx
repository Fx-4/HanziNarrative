import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLocaleStore, type Locale } from '@/store/localeStore'

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
]

export default function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale } = useLocaleStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title={current.label}
        aria-label={`Language: ${current.label}`}
      >
        {compact ? (
          <>
            <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 hidden lg:inline">
              {current.code.toUpperCase()}
            </span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">{current.flag}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {current.code.toUpperCase()}
            </span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 top-full mt-1.5 w-36 bg-white dark:bg-surface-card rounded-xl shadow-xl border border-gray-200/80 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-1">
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    locale === l.code
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
