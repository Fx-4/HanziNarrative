import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Sparkles, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Floating character config — positions are fixed to avoid layout thrash
// ---------------------------------------------------------------------------
const FLOATING_CHARS = ['汉', '字', '学', '习', '中', '文', '语', '言', '故', '事', '你', '好']

interface FloatItem {
  char: string
  top: string
  left: string
  fontSize: string
  duration: number
  delay: number
  opacity: number
}

const FLOAT_CONFIG: FloatItem[] = [
  { char: FLOATING_CHARS[2],  top: '5%',  left: '14%', fontSize: '5rem',  duration: 20, delay: 0,  opacity: 0.15 },
  { char: FLOATING_CHARS[0],  top: '14%', left: '74%', fontSize: '4rem',  duration: 27, delay: 2,  opacity: 0.13 },
  { char: FLOATING_CHARS[3],  top: '28%', left: '6%',  fontSize: '6rem',  duration: 34, delay: 1,  opacity: 0.10 },
  { char: FLOATING_CHARS[5],  top: '44%', left: '88%', fontSize: '3.5rem',duration: 18, delay: 5,  opacity: 0.20 },
  { char: FLOATING_CHARS[1],  top: '58%', left: '18%', fontSize: '5rem',  duration: 25, delay: 3,  opacity: 0.14 },
  { char: FLOATING_CHARS[7],  top: '72%', left: '64%', fontSize: '4rem',  duration: 31, delay: 8,  opacity: 0.11 },
  { char: FLOATING_CHARS[9],  top: '83%', left: '9%',  fontSize: '3.5rem',duration: 16, delay: 4,  opacity: 0.22 },
  { char: FLOATING_CHARS[11], top: '89%', left: '80%', fontSize: '5rem',  duration: 21, delay: 7,  opacity: 0.13 },
  { char: FLOATING_CHARS[4],  top: '4%',  left: '44%', fontSize: '4rem',  duration: 32, delay: 10, opacity: 0.18 },
  { char: FLOATING_CHARS[6],  top: '51%', left: '54%', fontSize: '6rem',  duration: 26, delay: 12, opacity: 0.10 },
  { char: FLOATING_CHARS[8],  top: '37%', left: '36%', fontSize: '3.5rem',duration: 15, delay: 9,  opacity: 0.25 },
  { char: FLOATING_CHARS[10], top: '66%', left: '31%', fontSize: '4rem',  duration: 23, delay: 14, opacity: 0.16 },
]

// Feature badges shown in the left panel
const FEATURE_BADGES = [
  { Icon: BookOpen, key: 'hsk' },
  { Icon: Sparkles, key: 'aiStories' },
  { Icon: Trophy,   key: 'gamification' },
] as const

// ---------------------------------------------------------------------------
// Password strength helper
// ---------------------------------------------------------------------------
interface StrengthResult {
  width: string
  colorClass: string
  labelKey: '' | 'weak' | 'fair' | 'strong'
}

function getPasswordStrength(pwd: string): StrengthResult {
  if (pwd.length === 0) return { width: '0%',   colorClass: 'bg-gray-200', labelKey: '' }
  if (pwd.length < 6)   return { width: '33%',  colorClass: 'bg-error-500',    labelKey: 'weak' }
  if (pwd.length <= 10) return { width: '66%',  colorClass: 'bg-yellow-500', labelKey: 'fair' }
  return                       { width: '100%', colorClass: 'bg-success-500',  labelKey: 'strong' }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Register() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.register.errors.mismatch'))
      return
    }

    setLoading(true)

    try {
      const tokens = await authApi.register({ username, email, password })
      localStorage.setItem('access_token', tokens.access_token)
      const { fetchUser } = useAuthStore.getState()
      await fetchUser()
      navigate('/onboarding')
    } catch {
      setError(t('auth.register.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* ================================================================
          LEFT DECORATIVE PANEL — hidden on mobile
      ================================================================ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-success-600 via-teal-700 to-primary-900 flex-col items-center justify-center px-12">
        {/* Floating Chinese characters */}
        {FLOAT_CONFIG.map((item, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none font-chinese font-bold text-white"
            style={{
              top: item.top,
              left: item.left,
              fontSize: item.fontSize,
              opacity: item.opacity,
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {item.char}
          </motion.span>
        ))}

        {/* Radial gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent pointer-events-none" />

        {/* Brand content */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Logo badge */}
          <motion.div
            className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mx-auto mb-8 shadow-2xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
          >
            <span className="text-white text-5xl font-bold font-chinese">学</span>
          </motion.div>

          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">
            {t('auth.register.panelTitle')}
          </h1>
          <p className="text-success-100 text-lg font-medium mb-10">
            {t('auth.register.panelSubtitle')}
          </p>

          {/* Feature badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {FEATURE_BADGES.map((badge, i) => (
              <motion.div
                key={badge.key}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <badge.Icon className="w-3.5 h-3.5" />
                <span>{badge.key === 'hsk' ? 'HSK 1-6' : t(`auth.register.badges.${badge.key}`)}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            className="mt-10 flex items-center gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <div className="h-px w-16 bg-white/30" />
            <span className="text-white/50 text-sm tracking-widest uppercase">{t('auth.register.panelFree')}</span>
            <div className="h-px w-16 bg-white/30" />
          </motion.div>
        </motion.div>
      </div>

      {/* ================================================================
          RIGHT FORM PANEL
      ================================================================ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Mobile-only brand badge */}
          <motion.div
            className="lg:hidden flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-success-600 flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold font-chinese">学</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">HanziNarrative</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {t('auth.register.title')}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('auth.register.subtitle')}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.register.username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.register.usernamePlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.register.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.register.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Password field + strength indicator */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.register.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${strength.colorClass}`}
                          initial={{ width: '0%' }}
                          animate={{ width: strength.width }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                        {strength.labelKey ? t(`auth.register.strength.${strength.labelKey}`) : ''}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm password field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.register.confirmPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match indicator */}
              <AnimatePresence>
                {confirmPassword.length > 0 && (
                  <motion.p
                    className={`mt-1.5 text-xs ${
                      password === confirmPassword
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-error-500 dark:text-error-400'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {password === confirmPassword ? t('auth.register.passwordsMatch') : t('auth.register.passwordsNoMatch')}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit button */}
            <motion.div
              className="pt-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('auth.register.creating')}
                  </>
                ) : (
                  <>
                    {t('auth.register.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Login link */}
            <motion.p
              className="text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 }}
            >
              {t('auth.register.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                {t('auth.register.signIn')}
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

