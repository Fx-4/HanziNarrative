import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { BookOpen, BookMarked, User, LogOut, PenTool, PenLine, GraduationCap, Brain, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { learningApi } from '@/services/api'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const [reviewCount, setReviewCount] = useState<number>(0)

  // Fetch review count when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchReviewCount = async () => {
        try {
          // Add a small delay to ensure token is set
          await new Promise(resolve => setTimeout(resolve, 100))
          const data = await learningApi.getReviewCount()
          setReviewCount(data.count)
        } catch (error: any) {
          console.error('Failed to fetch review count:', error)
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          })
          // Set count to 0 on error
          setReviewCount(0)
        }
      }

      fetchReviewCount()

      // Refresh count every 5 minutes
      const interval = setInterval(fetchReviewCount, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setReviewCount(0)
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const navLinks = [
    { to: '/practice', label: 'Practice', icon: GraduationCap },
    { to: '/review', label: 'Review', icon: Brain },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/vocabulary', label: 'Vocabulary', icon: BookMarked },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.nav
      className="bg-white shadow-md sticky top-0 z-30 backdrop-blur-lg bg-white/90"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <motion.div
              className="text-2xl font-bold text-primary-600 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                汉字
              </motion.span>
              <span className="text-gray-800">HanziNarrative</span>
            </motion.div>
          </Link>

          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              const isReviewLink = link.to === '/review'
              const showBadge = isReviewLink && reviewCount > 0

              return (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                    {showBadge && (
                      <Badge variant="error" className="ml-1 min-w-[20px] h-5 flex items-center justify-center">
                        {reviewCount}
                      </Badge>
                    )}
                    {active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        layoutId="underline"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}

            {isAuthenticated ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link to="/profile">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">{user?.username}</span>
                  </motion.div>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
