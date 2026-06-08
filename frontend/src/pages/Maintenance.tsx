import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Wrench, Code2, AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type MaintenanceMode = 'maintenance' | 'development' | 'error'

interface MaintenancePageProps {
  mode?: MaintenanceMode
  title?: string
  message?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  onRetry?: () => void
}

// ── Mode config ────────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<MaintenanceMode, {
  hanzi: string
  pinyin: string
  icon: React.ElementType
  defaultTitle: string
  defaultMessage: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  maintenance: {
    hanzi: '维护中',
    pinyin: 'wéihù zhōng',
    icon: Wrench,
    defaultTitle: 'Under Maintenance',
    defaultMessage: 'We\'re performing scheduled maintenance to improve your experience. Please check back soon.',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  development: {
    hanzi: '开发中',
    pinyin: 'kāifā zhōng',
    icon: Code2,
    defaultTitle: 'Under Development',
    defaultMessage: 'This feature is still being built. Stay tuned — it\'s coming soon!',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  error: {
    hanzi: '出错了',
    pinyin: 'chū cuò le',
    icon: AlertTriangle,
    defaultTitle: 'Something Went Wrong',
    defaultMessage: 'An unexpected error occurred. Please try again or return to the home page.',
    color: 'text-error-600 dark:text-error-400',
    bgColor: 'bg-error-50 dark:bg-error-900/20',
    borderColor: 'border-error-200 dark:border-error-800',
  },
}

// ── Full-page component ────────────────────────────────────────────────────────

export default function MaintenancePage({
  mode = 'maintenance',
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
  onRetry,
}: MaintenancePageProps) {
  const navigate = useNavigate()
  const cfg = MODE_CONFIG[mode]
  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated hanzi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative inline-block mb-6"
        >
          <span className="text-[96px] font-bold text-gray-200 dark:text-gray-800 select-none leading-none font-noto">
            {cfg.hanzi}
          </span>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className={`absolute -top-3 -right-3 w-12 h-12 rounded-2xl ${cfg.bgColor} border ${cfg.borderColor} flex items-center justify-center shadow-md`}
          >
            <Icon className={`w-6 h-6 ${cfg.color}`} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title ?? cfg.defaultTitle}
          </h1>
          <p className={`text-sm font-mono mb-4 ${cfg.color}`}>{cfg.pinyin}</p>

          <div className={`${cfg.bgColor} border ${cfg.borderColor} rounded-2xl px-6 py-4 mb-8`}>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {message ?? cfg.defaultMessage}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${cfg.bgColor} border ${cfg.borderColor} ${cfg.color} hover:opacity-80 cursor-pointer transition-opacity`}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            {showHomeButton && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Inline wrapper component ───────────────────────────────────────────────────
// Use <UnderDevelopment /> to wrap any WIP feature section within a page.

interface UnderDevelopmentProps {
  featureName?: string
  compact?: boolean
}

export function UnderDevelopment({ featureName, compact = false }: UnderDevelopmentProps) {
  const cfg = MODE_CONFIG['development']

  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${cfg.bgColor} border ${cfg.borderColor}`}>
        <Code2 className={`w-4 h-4 shrink-0 ${cfg.color}`} />
        <div>
          <p className={`text-sm font-medium ${cfg.color}`}>
            {featureName ? `${featureName} — Under Development` : 'Under Development'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-6xl font-bold text-gray-200 dark:text-gray-800 select-none font-noto block mb-4">
          {cfg.hanzi}
        </span>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bgColor} border ${cfg.borderColor} mb-3`}>
          <Code2 className={`w-4 h-4 ${cfg.color}`} />
          <span className={`text-sm font-medium ${cfg.color}`}>
            {featureName ? `${featureName} — Under Development` : 'Under Development'}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
          We're still building this feature. Check back later!
        </p>
      </motion.div>
    </div>
  )
}
