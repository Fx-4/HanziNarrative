import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeInOnMount } from '@/components/animations/FadeIn'
import { StaggerOnMount } from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import GradientText from '@/components/animations/GradientText'
import SpotlightCard from '@/components/animations/SpotlightCard'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <FadeInOnMount direction="up" distance={24} duration={0.5} className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30"
          >
            <span className="text-white text-2xl font-bold">汉</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            <GradientText colors={['#4F46E5', '#818CF8', '#6366f1', '#4F46E5']}>
              Welcome Back
            </GradientText>
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Continue your journey on HanziNarrative
          </p>
        </div>

        {/* Form card */}
        <SpotlightCard className="card rounded-2xl" spotlightColor="rgba(79,70,229,0.08)">
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <StaggerOnMount staggerDelay={0.08} delay={0.1}>
              <StaggerItem>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
              </StaggerItem>

              <StaggerItem>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </StaggerItem>

              <StaggerItem>
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-medium"
                  >
                    Register
                  </Link>
                </p>
              </StaggerItem>
            </StaggerOnMount>
          </form>
        </SpotlightCard>
      </FadeInOnMount>
    </div>
  )
}
