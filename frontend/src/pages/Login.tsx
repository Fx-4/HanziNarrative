import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

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
  { char: FLOATING_CHARS[0], top: '6%', left: '10%', fontSize: '5rem', duration: 22, delay: 0, opacity: 0.15 },
  { char: FLOATING_CHARS[1], top: '15%', left: '78%', fontSize: '4rem', duration: 29, delay: 3, opacity: 0.12 },
  { char: FLOATING_CHARS[2], top: '30%', left: '4%', fontSize: '6rem', duration: 35, delay: 1, opacity: 0.10 },
  { char: FLOATING_CHARS[3], top: '46%', left: '86%', fontSize: '3.5rem', duration: 19, delay: 5, opacity: 0.20 },
  { char: FLOATING_CHARS[4], top: '60%', left: '20%', fontSize: '5rem', duration: 26, delay: 2, opacity: 0.14 },
  { char: FLOATING_CHARS[5], top: '74%', left: '62%', fontSize: '4rem', duration: 32, delay: 7, opacity: 0.11 },
  { char: FLOATING_CHARS[6], top: '84%', left: '7%', fontSize: '3.5rem', duration: 17, delay: 4, opacity: 0.22 },
  { char: FLOATING_CHARS[7], top: '88%', left: '82%', fontSize: '5rem', duration: 20, delay: 6, opacity: 0.13 },
  { char: FLOATING_CHARS[8], top: '4%', left: '47%', fontSize: '4rem', duration: 33, delay: 9, opacity: 0.18 },
  { char: FLOATING_CHARS[9], top: '53%', left: '52%', fontSize: '6rem', duration: 28, delay: 11, opacity: 0.10 },
  { char: FLOATING_CHARS[10], top: '38%', left: '38%', fontSize: '3.5rem', duration: 15, delay: 8, opacity: 0.25 },
  { char: FLOATING_CHARS[11], top: '68%', left: '33%', fontSize: '4rem', duration: 24, delay: 13, opacity: 0.16 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [searchParams] = useState(() => new URLSearchParams(window.location.search))
  const [error, setError] = useState(
    searchParams.get('error') === 'google_failed' ? 'Google sign-in failed. Please try again.' : ''
  )
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      if (!onboardingCompleted) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* ================================================================
          LEFT DECORATIVE PANEL — hidden on mobile
      ================================================================ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex-col items-center justify-center px-12">
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

        {/* Radial spotlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent pointer-events-none" />

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
            <span className="text-white text-5xl font-bold font-chinese">汉</span>
          </motion.div>

          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">
            HanziNarrative
          </h1>
          <p className="text-indigo-200 text-lg font-medium">
            Master Chinese through stories
          </p>

          {/* Decorative divider */}
          <motion.div
            className="mt-10 flex items-center gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-px w-16 bg-white/30" />
            <span className="text-white/50 text-sm tracking-widest uppercase">Learn · Practice · Master</span>
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <span className="text-white text-lg font-bold font-chinese">汉</span>
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
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to continue your learning journey
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
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
                Username
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
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.33 }}
            >
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </motion.div>

            {/* ── Google button ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
            >
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Google SVG logo */}
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.569 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continue with Google
              </motion.button>
            </motion.div>

            {/* Register link */}
            <motion.p
              className="text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                Create one
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
