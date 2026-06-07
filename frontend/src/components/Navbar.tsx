import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { forwardRef, type FC } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { User as UserProfile } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import {
  BookOpen, BookMarked, User, LogOut, PenTool, GraduationCap, Brain,
  BarChart3, Type, ChevronDown, Menu, X, Moon, Sun,
  Layers, Keyboard, Trophy, ChevronRight, Headphones, Map, Mic, Lock,
  Target, Grid3X3, Music, Heart, MessageCircle, Shield, Swords, Zap,
  Calendar, HelpCircle, Route,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { learningApi } from '@/services/api'
import VoiceSelector from '@/components/VoiceSelector'

type NavIcon = FC<{ className?: string }>

interface MenuItem {
  to: string
  label: string
  icon: NavIcon
  badge?: boolean
  description?: string
}

interface DropdownMenu {
  label: string
  icon: NavIcon
  items: MenuItem[]
  cols?: 1 | 2
}

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

/* ─── Navigation data ─── */

// Primary links — always visible in desktop bar
const primaryLinks: MenuItem[] = [
  { to: '/review',     label: 'Review',  icon: Brain,      badge: true },
  { to: '/path',       label: 'Kursus',  icon: Route },
  { to: '/stories',    label: 'Stories', icon: BookOpen },
  { to: '/dashboard',  label: 'Stats',   icon: BarChart3 },
]

// Dropdown menus
const dropdownMenus: DropdownMenu[] = [
  {
    label: 'Practice',
    icon: GraduationCap,
    cols: 2,
    items: [
      { to: '/flashcards',      label: 'Flashcards',      icon: Layers,       description: 'Spaced repetition' },
      { to: '/writing',         label: 'Writing',          icon: PenTool,      description: 'Stroke by stroke' },
      { to: '/typing',          label: 'Typing',           icon: Keyboard,     description: 'Pinyin input' },
      { to: '/speaking',        label: 'Speaking',         icon: Mic,          description: 'Pronunciation' },
      { to: '/dictation',       label: 'Dictation',        icon: Headphones,   description: 'Listening' },
      { to: '/quiz',            label: 'Quiz',             icon: Target,       description: 'Multiple choice' },
      { to: '/tones',           label: 'Tones',            icon: Music,        description: 'Tone trainer' },
      { to: '/mock-test',       label: 'Mock Test',        icon: GraduationCap,description: 'Exam simulation' },
      { to: '/vocabulary',      label: 'Vocabulary',       icon: BookMarked,   description: 'Word browser' },
      { to: '/explorer',        label: 'Story Blanks',     icon: HelpCircle,   description: 'Fill blanks from stories' },
    ],
  },
  {
    label: 'Play',
    icon: Zap,
    cols: 1,
    items: [
      { to: '/battle',          label: 'Battle',           icon: Swords,       description: 'Real-time duel' },
      { to: '/adventure',       label: 'Adventure',        icon: Map,          description: 'AI branching story' },
      { to: '/conversation',    label: 'AI Chat',          icon: MessageCircle,description: 'Conversation practice' },
      { to: '/matching',        label: 'Match Game',       icon: Grid3X3,      description: 'Card matching' },
      { to: '/sentence-builder',label: 'Sentence Builder', icon: Type,         description: 'Arrange words' },
      { to: '/story-challenge',  label: 'Story Challenge',  icon: Lock,         description: 'Unlock stories' },
      { to: '/daily-challenge', label: 'Daily Challenge',  icon: Calendar,     description: 'One story/day · +30 XP' },
    ],
  },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const location = useLocation()
  const [reviewCount, setReviewCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Practice open by default so new users see it; Play collapsed to reduce overwhelm
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Practice: true, Play: false, Track: false,
  })

  const toggleSection = (label: string) =>
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }))

  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!isAuthenticated || !user) { setReviewCount(0); return }
    const fetch = async () => {
      try { setReviewCount((await learningApi.getReviewCount()).count) }
      catch { setReviewCount(0) }
    }
    fetch()
    const id = setInterval(fetch, 5 * 60 * 1000)
    return () => clearInterval(id)
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
  const isActive = (path: string) => location.pathname === path
  const isDropdownActive = (items: MenuItem[]) => items.some(i => isActive(i.to))

  return (
    <>
      <motion.nav
        className="bg-white/90 dark:bg-surface-page/90 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/60 dark:border-gray-800/60 transition-colors"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">

            {/* ── Logo ── */}
            <Link to="/" className="flex-shrink-0">
              <motion.div
                className="flex items-center gap-1.5 sm:gap-2 text-primary-600 font-bold"
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
                <span className="hidden sm:inline text-base sm:text-lg text-gray-800 dark:text-gray-200 font-bold">
                  HanziNarrative
                </span>
              </motion.div>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              <DarkModeButton isDarkMode={isDarkMode} toggle={toggleDarkMode} />
              <VoiceSelector compact />

              {primaryLinks.map(link => (
                <DesktopNavLink
                  key={link.to}
                  link={link}
                  active={isActive(link.to)}
                  badgeCount={link.badge ? reviewCount : 0}
                />
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
                    <span className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">Login</span>
                  </Link>
                  <Link to="/register">
                    <span className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">Register</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* ── Mobile right: dark toggle + avatar + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              <DarkModeButton isDarkMode={isDarkMode} toggle={toggleDarkMode} />

              {isAuthenticated && (
                <div className="relative">
                  <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-primary-300 transition-all">
                    {user?.profile_picture
                      ? <img src={user.profile_picture} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-300">{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                    }
                  </Link>
                  {reviewCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 bg-error-500 text-white text-[9px] font-bold rounded-full px-0.5 pointer-events-none">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                  )}
                </div>
              )}

              <motion.button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed top-0 right-0 h-full w-[min(320px,88vw)] sm:w-[min(360px,88vw)] bg-white dark:bg-surface-card shadow-2xl z-60 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    {user?.profile_picture
                      ? <img src={user.profile_picture} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                      : <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-300">{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                    }
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.full_name || user?.username}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">@{user?.username}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-primary-600 font-chinese">汉字 HanziNarrative</span>
                )}

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">

                {/* ── Daily section — always visible at top, no collapse ── */}
                <div className="mb-2">
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Daily
                  </p>

                  {/* Review — hero item with count pill */}
                  <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to="/review" onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors mb-0.5 ${
                        isActive('/review')
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Brain className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold leading-none">Review</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {reviewCount > 0 ? `${reviewCount} due today` : 'Spaced repetition'}
                            </p>
                          </div>
                        </div>
                        {reviewCount > 0
                          ? <span className="flex items-center justify-center min-w-[22px] h-5 bg-error-500 text-white text-[10px] font-bold rounded-full px-1.5">{reviewCount > 99 ? '99+' : reviewCount}</span>
                          : isActive('/review') ? <ChevronRight className="w-3.5 h-3.5 opacity-50" /> : null
                        }
                      </div>
                    </Link>
                  </motion.div>

                  {/* Kursus */}
                  <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to="/path" onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive('/path')
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <Route className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold leading-none">Kursus</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Learning path HSK</p>
                        </div>
                        {isActive('/path') && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                      </div>
                    </Link>
                  </motion.div>

                  {/* Stories */}
                  <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to="/stories" onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive('/stories')
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Stories</span>
                        {isActive('/stories') && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                      </div>
                    </Link>
                  </motion.div>
                </div>

                {/* ── Practice section ── */}
                <DrawerSection
                  label="Practice"
                  isOpen={openSections.Practice}
                  onToggle={() => toggleSection('Practice')}
                  hasActive={dropdownMenus[0].items.some(i => isActive(i.to))}
                  animIndex={3}
                >
                  {dropdownMenus[0].items.map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>

                {/* ── Play section ── */}
                <DrawerSection
                  label="Play"
                  isOpen={openSections.Play}
                  onToggle={() => toggleSection('Play')}
                  hasActive={dropdownMenus[1].items.some(i => isActive(i.to))}
                  animIndex={12}
                >
                  {dropdownMenus[1].items.map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>

                {/* ── Track section ── */}
                <DrawerSection
                  label="Track"
                  isOpen={openSections.Track}
                  onToggle={() => toggleSection('Track')}
                  hasActive={isActive('/dashboard') || isActive('/leaderboard')}
                  animIndex={18}
                >
                  {[
                    { to: '/dashboard', label: 'Dashboard', icon: BarChart3, description: 'Your stats' },
                    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Rankings' },
                    { to: '/bookmarks', label: 'Bookmarks', icon: Heart, description: 'Saved stories' },
                  ].map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
                <div className="px-3 py-2">
                  <VoiceSelector />
                </div>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile</span>
                      </div>
                    </Link>
                    {user?.is_admin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Admin Panel</span>
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">Login</span>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">Register</span>
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

/* ─── Mobile drawer section (collapsible) ─── */
function DrawerSection({
  label, isOpen, onToggle, hasActive, animIndex, children,
}: {
  label: string
  isOpen: boolean
  onToggle: () => void
  hasActive: boolean
  animIndex: number
  children: React.ReactNode
}) {
  return (
    <div>
      <motion.button
        custom={animIndex}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
          hasActive
            ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
          {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
        </div>
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-1 space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Mobile drawer item ─── */
function DrawerItem({ item, active, onClose }: { item: MenuItem; active: boolean; onClose: () => void }) {
  const Icon = item.icon
  return (
    <Link to={item.to} onClick={onClose}>
      <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        active
          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none">{item.label}</p>
            {item.description && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.description}</p>
            )}
          </div>
        </div>
        {active && <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />}
      </div>
    </Link>
  )
}

/* ─── Dark mode button ─── */
function DarkModeButton({ isDarkMode, toggle }: { isDarkMode: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait">
        {isDarkMode
          ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun className="w-4 h-4 text-yellow-400" /></motion.div>
          : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="w-4 h-4 text-gray-600" /></motion.div>
        }
      </AnimatePresence>
    </motion.button>
  )
}

/* ─── Desktop single nav link (supports badge count) ─── */
function DesktopNavLink({ link, active, badgeCount = 0 }: {
  link: MenuItem; active: boolean; badgeCount?: number
}) {
  const Icon = link.icon
  return (
    <Link to={link.to}>
      <motion.div
        className={`relative flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden lg:inline">{link.label}</span>
        {badgeCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-error-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
        {active && (
          <motion.div
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full"
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
}>(function DesktopDropdown({ menu, active, isOpen, isActive, onToggle, onClose }, ref) {
  const Icon = menu.icon
  const isTwoCol = menu.cols === 2

  return (
    <div ref={ref} className="relative">
      <motion.div
        className={`flex items-center gap-1 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          active || isOpen
            ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
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
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full"
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
            className={`absolute left-0 top-full mt-1.5 bg-white dark:bg-surface-card rounded-xl shadow-xl border border-gray-200/80 dark:border-gray-700 overflow-hidden z-50 ${
              isTwoCol ? 'w-[380px]' : 'w-52'
            }`}
          >
            <div className={`p-1.5 ${isTwoCol ? 'grid grid-cols-2 gap-0.5' : ''}`}>
              {menu.items.map((item, i) => {
                const ItemIcon = item.icon
                const itemActive = isActive(item.to)
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link to={item.to} onClick={onClose}>
                      <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        itemActive ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">{item.label}</p>
                          {item.description && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

/* ─── Desktop user menu ─── */
const UserMenu = forwardRef<HTMLDivElement, {
  user: UserProfile | null; showMenu: boolean; onToggle: () => void; onClose: () => void; onLogout: () => void
}>(function UserMenu({ user, showMenu, onToggle, onClose, onLogout }, ref) {
  return (
    <div ref={ref} className="relative ml-1">
      <motion.div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
      >
        {user?.profile_picture
          ? <img src={user.profile_picture} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
          : <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-300">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
        }
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.full_name || user?.username}</span>
        <motion.div animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-surface-card rounded-xl shadow-xl border border-gray-200/80 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-1">
              <Link to="/profile" onClick={onClose}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </div>
              </Link>
              <Link to="/leaderboard" onClick={onClose}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Leaderboard</span>
                </div>
              </Link>
              <Link to="/bookmarks" onClick={onClose}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Bookmarks</span>
                </div>
              </Link>
              {user?.is_admin && (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <Link to="/admin" onClick={onClose}>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-primary-600 dark:text-primary-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin Panel</span>
                    </div>
                  </Link>
                </>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors text-error-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
