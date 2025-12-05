import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { BookOpen, BookMarked, User, LogOut, PenTool, GraduationCap, Brain, BarChart3, Type, ChevronDown, Library } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { learningApi } from '@/services/api'

type MenuItem = {
  to: string
  label: string
  icon: any
  badge?: boolean
}

type DropdownMenu = {
  label: string
  icon: any
  items: MenuItem[]
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }

      // Check if click is outside all dropdowns
      const clickedOutsideDropdowns = Object.values(dropdownRefs.current).every(
        ref => !ref || !ref.contains(event.target as Node)
      )
      if (clickedOutsideDropdowns) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    toast.success('Logged out successfully')
  }

  const singleNavLinks: MenuItem[] = [
    { to: '/practice', label: 'Practice', icon: GraduationCap },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const dropdownMenus: DropdownMenu[] = [
    {
      label: 'Learn',
      icon: Brain,
      items: [
        { to: '/review', label: 'Review', icon: Brain, badge: true },
        { to: '/writing', label: 'Writing', icon: PenTool },
      ]
    },
    {
      label: 'Library',
      icon: Library,
      items: [
        { to: '/stories', label: 'Stories', icon: BookOpen },
        { to: '/vocabulary', label: 'Vocabulary', icon: BookMarked },
        { to: '/sentence-builder', label: 'Builder', icon: Type },
      ]
    }
  ]

  const isActive = (path: string) => location.pathname === path

  const isDropdownActive = (items: MenuItem[]) => {
    return items.some(item => isActive(item.to))
  }

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

          <div className="flex items-center gap-4">
            {/* Single nav links */}
            {singleNavLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)

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

            {/* Dropdown menus */}
            {dropdownMenus.map((menu) => {
              const Icon = menu.icon
              const active = isDropdownActive(menu.items)
              const isOpen = activeDropdown === menu.label

              return (
                <div
                  key={menu.label}
                  ref={(el) => (dropdownRefs.current[menu.label] = el)}
                  className="relative"
                >
                  <motion.div
                    className={`relative flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      active || isOpen
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveDropdown(isOpen ? null : menu.label)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{menu.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    {active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        layoutId="underline"
                      />
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        {menu.items.map((item) => {
                          const ItemIcon = item.icon
                          const itemActive = isActive(item.to)
                          const showBadge = item.badge && reviewCount > 0

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                  itemActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <ItemIcon className="w-4 h-4" />
                                  <span>{item.label}</span>
                                </div>
                                {showBadge && (
                                  <Badge variant="error" className="min-w-[20px] h-5 flex items-center justify-center text-xs">
                                    {reviewCount}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            {isAuthenticated ? (
              <motion.div
                ref={userMenuRef}
                className="relative flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">{user?.username}</span>
                </motion.div>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
