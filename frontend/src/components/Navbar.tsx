import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { forwardRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import {
  BookOpen, BookMarked, User, LogOut, PenTool, GraduationCap, Brain,
  BarChart3, Type, ChevronDown, Library, Menu, X, Moon, Sun,
  Layers, Keyboard, Trophy, ChevronRight, Headphones, Map, Mic, Lock,
  Target, Grid3X3, Music
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { learningApi } from '@/services/api'

type MenuItem = { to: string; label: string; icon: any; badge?: boolean }
type DropdownMenu = { label: string; icon: any; items: MenuItem[] }

/* ─── animation variants ─── */
const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.22, ease: 'easeOut' },
  }),
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const location = useLocation()
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ Learn: true, Library: true })

  const toggleSection = (label: string) =>
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }))

  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetch = async () => {
        try {
          const data = await learningApi.getReviewCount()
          setReviewCount(data.count)
        } catch { setReviewCount(0) }
      }
      fetch()
      const id = setInterval(fetch, 5 * 60 * 1000)
      return () => clearInterval(id)
    } else {
      setReviewCount(0)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false)
      const outside = Object.values(dropdownRefs.current).every(r => !r || !r.contains(e.target as Node))
      if (outside) setActiveDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); setShowUserMenu(false); toast.success('Logged out successfully') }

  const singleNavLinks: MenuItem[] = [
    { to: '/practice', label: 'Practice', icon: GraduationCap },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const dropdownMenus: DropdownMenu[] = [
    {
      label: 'Learn', icon: Brain,
      items: [
        { to: '/review', label: 'Review', icon: Brain, badge: true },
        { to: '/flashcards', label: 'Flashcards', icon: Layers },
        { to: '/writing', label: 'Writing', icon: PenTool },
        { to: '/typing', label: 'Typing', icon: Keyboard },
        { to: '/quiz', label: 'Quiz', icon: GraduationCap },
        { to: '/speaking', label: 'Speaking', icon: Mic },
        { to: '/mock-test', label: 'Mock Test', icon: Target },
        { to: '/tones', label: 'Tones', icon: Music },
      ]
    },
    {
      label: 'Library', icon: Library,
      items: [
        { to: '/stories', label: 'Stories', icon: BookOpen },
        { to: '/vocabulary', label: 'Vocabulary', icon: BookMarked },
        { to: '/sentence-builder', label: 'Builder', icon: Type },
        { to: '/dictation', label: 'Dictation', icon: Headphones },
        { to: '/adventure', label: 'Adventure', icon: Map },
        { to: '/story-challenge', label: 'Unlock', icon: Lock },
        { to: '/explorer', label: 'Explorer', icon: Target },
        { to: '/matching', label: 'Match', icon: Grid3X3 },
      ]
    }
  ]

  const isActive = (path: string) => location.pathname === path
  const isDropdownActive = (items: MenuItem[]) => items.some(i => isActive(i.to))

  return (
    <>
      <motion.nav
        className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/60 transition-colors"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">

            {/* ── Logo ── */}
            <Link to="/" className="flex-shrink-0">
              <motion.div
                className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 font-bold"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <motion.span
                  className="text-lg sm:text-xl font-chinese"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                >
                  汉字
                </motion.span>
                <span className="hidden sm:inline text-base sm:text-lg text-gray-800 font-bold">
                  HanziNarrative
                </span>
              </motion.div>
            </Link>

            {/* ── Desktop nav (md+ / tablet & above) ── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {/* Dark mode toggle */}
              <DarkModeButton isDarkMode={isDarkMode} toggle={toggleDarkMode} />

              {singleNavLinks.map(link => (
                <DesktopNavLink key={link.to} link={link} active={isActive(link.to)} />
              ))}

              {dropdownMenus.map(menu => (
                <DesktopDropdown
                  key={menu.label}
                  menu={menu}
                  active={isDropdownActive(menu.items)}
                  isOpen={activeDropdown === menu.label}
                  reviewCount={reviewCount}
                  isActive={isActive}
                  onToggle={() => setActiveDropdown(activeDropdown === menu.label ? null : menu.label)}
                  onClose={() => setActiveDropdown(null)}
                  ref={(el: HTMLDivElement | null) => { dropdownRefs.current[menu.label] = el }}
                />
              ))}

              {isAuthenticated ? (
                <UserMenu
                  user={user}
                  showMenu={showUserMenu}
                  onToggle={() => setShowUserMenu(!showUserMenu)}
                  onClose={() => setShowUserMenu(false)}
                  onLogout={handleLogout}
                  ref={userMenuRef}
                />
              ) : (
                <motion.div className="flex items-center gap-2 ml-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Link to="/login">
                    <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">Login</span>
                  </Link>
                  <Link to="/register">
                    <span className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">Register</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* ── Mobile right side: dark toggle + user avatar + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              <DarkModeButton isDarkMode={isDarkMode} toggle={toggleDarkMode} />

              {isAuthenticated && (
                <div className="relative">
                  <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-indigo-300 transition-all">
                    {user?.profile_picture ? (
                      <img src={user.profile_picture} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  {reviewCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 pointer-events-none">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                  )}
                </div>
              )}

              <motion.button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Open menu"
              >
                <motion.div animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-5 h-5 text-gray-700" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-[min(320px,88vw)] sm:w-[min(360px,88vw)] bg-white shadow-2xl z-60 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    {user?.profile_picture ? (
                      <img src={user.profile_picture} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-gray-800">{user?.full_name || user?.username}</p>
                      <p className="text-[11px] text-gray-500">@{user?.username}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-indigo-600 font-chinese">汉字 HanziNarrative</span>
                )}

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Drawer scrollable content */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">

                {/* Single nav links */}
                {singleNavLinks.map((link, i) => {
                  const Icon = link.icon
                  const active = isActive(link.to)
                  return (
                    <motion.div key={link.to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                      <Link to={link.to} onClick={() => setMobileMenuOpen(false)}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}>
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{link.label}</span>
                          {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Dropdown sections — collapsible */}
                {dropdownMenus.map((menu, mi) => {
                  const Icon = menu.icon
                  const isOpen = openSections[menu.label] ?? true
                  const hasActiveChild = menu.items.some(item => isActive(item.to))

                  return (
                    <div key={menu.label} className="mt-1">
                      {/* Collapsible section header */}
                      <motion.button
                        custom={singleNavLinks.length + mi * 10}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => toggleSection(menu.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${hasActiveChild
                          ? 'text-indigo-600 hover:bg-indigo-50'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            {menu.label}
                          </span>
                          {hasActiveChild && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.div>
                      </motion.button>

                      {/* Animated items */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="pb-1 space-y-0.5">
                              {menu.items.map((item) => {
                                const ItemIcon = item.icon
                                const itemActive = isActive(item.to)
                                const showBadge = item.badge && reviewCount > 0

                                return (
                                  <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                                    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors ${itemActive
                                      ? 'bg-indigo-50 text-indigo-600'
                                      : 'text-gray-700 hover:bg-gray-100'
                                      }`}>
                                      <div className="flex items-center gap-3">
                                        <ItemIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                      </div>
                                      {showBadge ? (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                                          {reviewCount}
                                        </span>
                                      ) : itemActive ? (
                                        <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                                      ) : null}
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* Drawer footer: profile + logout or login/register */}
              <div className="border-t border-gray-200 p-3 space-y-1.5">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">Login</span>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Dark Mode Button ─── */
function DarkModeButton({ isDarkMode, toggle }: { isDarkMode: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors overflow-hidden"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait">
        {isDarkMode ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="w-4 h-4 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="w-4 h-4 text-gray-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ─── Desktop single nav link ─── */
function DesktopNavLink({ link, active }: { link: MenuItem; active: boolean }) {
  const Icon = link.icon
  return (
    <Link to={link.to}>
      <motion.div
        className={`relative flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
          }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden lg:inline">{link.label}</span>
        {active && (
          <motion.div
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
            layoutId="nav-underline"
          />
        )}
      </motion.div>
    </Link>
  )
}

/* ─── Desktop dropdown ─── */
const DesktopDropdown = forwardRef<HTMLDivElement, {
  menu: DropdownMenu; active: boolean; isOpen: boolean; reviewCount: number
  isActive: (p: string) => boolean; onToggle: () => void; onClose: () => void
}>(function DesktopDropdown({ menu, active, isOpen, reviewCount, isActive, onToggle, onClose }, ref) {
  const Icon = menu.icon
  return (
    <div ref={ref} className="relative">
      <motion.div
        className={`flex items-center gap-1 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${active || isOpen
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
          }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onToggle}
      >
        <Icon className="w-4 h-4" />
        <span>{menu.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
        {active && (
          <motion.div
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
            layoutId="nav-underline"
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-200/80 overflow-hidden z-50"
          >
            {menu.items.map((item, i) => {
              const ItemIcon = item.icon
              const itemActive = isActive(item.to)
              const showBadge = item.badge && reviewCount > 0
              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={item.to} onClick={onClose}>
                    <div className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors ${itemActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <ItemIcon className="w-3.5 h-3.5" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {showBadge && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                          {reviewCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

/* ─── Desktop user menu ─── */
const UserMenu = forwardRef<HTMLDivElement, {
  user: any; showMenu: boolean; onToggle: () => void; onClose: () => void; onLogout: () => void
}>(function UserMenu({ user, showMenu, onToggle, onClose, onLogout }, ref) {
  return (
    <div ref={ref} className="relative ml-1">
      <motion.div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
      >
        {user?.profile_picture ? (
          <img src={user.profile_picture} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-600">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">{user?.full_name || user?.username}</span>
        <motion.div animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-200/80 overflow-hidden z-50"
          >
            <Link to="/profile" onClick={onClose}>
              <div className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </div>
            </Link>
            <div className="border-t border-gray-200 my-0.5" />
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
