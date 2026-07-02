import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { forwardRef, type FC } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { User as UserProfile } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import { useTranslation } from 'react-i18next'
import {
  BookOpen, BookMarked, User, LogOut, PenTool, GraduationCap, Brain,
  BarChart3, Type, ChevronDown, Menu, X, Moon, Sun,
  Layers, Keyboard, Trophy, ChevronRight, Headphones, Map, Mic, Lock,
  Target, Grid3X3, Music, Heart, MessageCircle, Shield, Swords, Zap,
  Calendar, HelpCircle, Route, Dice5,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { learningApi } from '@/services/api'
import VoiceSelector from '@/components/VoiceSelector'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Logo from '@/components/Logo'

type NavIcon = FC<{ className?: string }>

interface MenuItem {
  to: string
  key: string
  icon: NavIcon
  badge?: boolean
}

interface DropdownMenu {
  key: string
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

const primaryLinks: MenuItem[] = [
  { to: '/review',    key: 'review',  icon: Brain,    badge: true },
  { to: '/path',      key: 'course',  icon: Route },
  { to: '/stories',   key: 'stories', icon: BookOpen },
  { to: '/dashboard', key: 'stats',   icon: BarChart3 },
]

const dropdownMenus: DropdownMenu[] = [
  {
    key: 'practice',
    icon: GraduationCap,
    cols: 2,
    items: [
      { to: '/flashcards',       key: 'flashcards',      icon: Layers },
      { to: '/writing',          key: 'writing',         icon: PenTool },
      { to: '/typing',           key: 'typing',          icon: Keyboard },
      { to: '/speaking',         key: 'speaking',        icon: Mic },
      { to: '/dictation',        key: 'dictation',       icon: Headphones },
      { to: '/quiz',             key: 'quiz',            icon: Target },
      { to: '/tones',            key: 'tones',           icon: Music },
      { to: '/mock-test',        key: 'mockTest',        icon: GraduationCap },
      { to: '/vocabulary',       key: 'vocabulary',      icon: BookMarked },
      { to: '/explorer',         key: 'storyBlanks',     icon: HelpCircle },
    ],
  },
  {
    key: 'play',
    icon: Zap,
    cols: 1,
    items: [
      { to: '/battle',           key: 'battle',          icon: Swords },
      { to: '/ladder',           key: 'ladderRace',      icon: Dice5 },
      { to: '/adventure',        key: 'adventure',       icon: Map },
      { to: '/conversation',     key: 'aiChat',          icon: MessageCircle },
      { to: '/matching',         key: 'matchGame',       icon: Grid3X3 },
      { to: '/sentence-builder', key: 'sentenceBuilder', icon: Type },
      { to: '/story-challenge',  key: 'storyChallenge',  icon: Lock },
      { to: '/daily-challenge',  key: 'dailyChallenge',  icon: Calendar },
    ],
  },
]

const trackItems: MenuItem[] = [
  { to: '/dashboard',   key: 'dashboard',   icon: BarChart3 },
  { to: '/leaderboard', key: 'leaderboard', icon: Trophy },
  { to: '/bookmarks',   key: 'bookmarks',   icon: Heart },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const location = useLocation()
  const [reviewCount, setReviewCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    practice: true, play: false, track: false,
  })

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

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

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    toast.success(t('nav.user.loggedOut'))
  }
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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Logo size={32} wordmarkClassName="hidden sm:inline" />
              </motion.div>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              <DarkModeButton isDarkMode={isDarkMode} toggle={toggleDarkMode} />
              <LanguageSwitcher compact />
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
                  key={menu.key}
                  menu={menu}
                  active={isDropdownActive(menu.items)}
                  isOpen={activeDropdown === menu.key}
                  reviewCount={reviewCount}
                  isActive={isActive}
                  onToggle={() => setActiveDropdown(activeDropdown === menu.key ? null : menu.key)}
                  onClose={() => setActiveDropdown(null)}
                  ref={(el: HTMLDivElement | null) => { dropdownRefs.current[menu.key] = el }}
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
                    <span className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">
                      {t('nav.auth.login')}
                    </span>
                  </Link>
                  <Link to="/register">
                    <span className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors inline-block">
                      {t('nav.auth.register')}
                    </span>
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
                aria-label={t('nav.a11y.openMenu')}
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
                  <Logo size={28} />
                )}

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  aria-label={t('nav.a11y.closeMenu')}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">

                {/* ── Daily section ── */}
                <div className="mb-2">
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('nav.sections.daily')}
                  </p>

                  {/* Review */}
                  <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to="/review" onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors mb-0.5 ${
                        isActive('/review')
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Brain className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold leading-none">{t('nav.items.review.label')}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {reviewCount > 0
                                ? t('nav.review.dueToday', { count: reviewCount })
                                : t('nav.review.description')}
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

                  {/* Course */}
                  <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to="/path" onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive('/path')
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <Route className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold leading-none">{t('nav.items.course.label')}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t('nav.items.course.desc')}</p>
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
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{t('nav.items.stories.label')}</span>
                        {isActive('/stories') && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                      </div>
                    </Link>
                  </motion.div>
                </div>

                {/* ── Practice section ── */}
                <DrawerSection
                  label={t('nav.sections.practice')}
                  isOpen={openSections.practice}
                  onToggle={() => toggleSection('practice')}
                  hasActive={dropdownMenus[0].items.some(i => isActive(i.to))}
                  animIndex={3}
                >
                  {dropdownMenus[0].items.map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>

                {/* ── Play section ── */}
                <DrawerSection
                  label={t('nav.sections.play')}
                  isOpen={openSections.play}
                  onToggle={() => toggleSection('play')}
                  hasActive={dropdownMenus[1].items.some(i => isActive(i.to))}
                  animIndex={12}
                >
                  {dropdownMenus[1].items.map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>

                {/* ── Track section ── */}
                <DrawerSection
                  label={t('nav.sections.track')}
                  isOpen={openSections.track}
                  onToggle={() => toggleSection('track')}
                  hasActive={isActive('/dashboard') || isActive('/leaderboard')}
                  animIndex={18}
                >
                  {trackItems.map((item) => (
                    <DrawerItem key={item.to} item={item} active={isActive(item.to)} onClose={() => setMobileMenuOpen(false)} />
                  ))}
                </DrawerSection>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <VoiceSelector />
                  <LanguageSwitcher />
                </div>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('nav.items.profile.label')}</span>
                      </div>
                    </Link>
                    {user?.is_admin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('nav.user.adminPanel')}</span>
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors dark:text-error-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('nav.user.logout')}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">
                        {t('nav.auth.login')}
                      </span>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                      <span className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors w-full block text-center text-sm">
                        {t('nav.auth.register')}
                      </span>
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
            ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 dark:text-primary-400'
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
  const { t } = useTranslation()
  const Icon = item.icon
  const desc = t(`nav.items.${item.key}.desc`)
  return (
    <Link to={item.to} onClick={onClose}>
      <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        active
          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none">{t(`nav.items.${item.key}.label`)}</p>
            {desc && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{desc}</p>
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
  const { t } = useTranslation()
  const label = isDarkMode ? t('nav.a11y.lightMode') : t('nav.a11y.darkMode')
  return (
    <motion.button
      onClick={toggle}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
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
  const { t } = useTranslation()
  const Icon = link.icon
  return (
    <Link to={link.to}>
      <motion.div
        className={`relative flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:text-primary-400'
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden lg:inline">{t(`nav.items.${link.key}.label`)}</span>
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
  const { t } = useTranslation()
  const Icon = menu.icon
  const isTwoCol = menu.cols === 2

  return (
    <div ref={ref} className="relative">
      <motion.div
        className={`flex items-center gap-1 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          active || isOpen
            ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:text-primary-400'
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onToggle}
      >
        <Icon className="w-4 h-4" />
        <span>{t(`nav.sections.${menu.key}`)}</span>
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
                const desc = t(`nav.items.${item.key}.desc`)
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link to={item.to} onClick={onClose}>
                      <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        itemActive ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">{t(`nav.items.${item.key}.label`)}</p>
                          {desc && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
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
  const { t } = useTranslation()
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
                  <span className="text-sm">{t('nav.items.profile.label')}</span>
                </div>
              </Link>
              <Link to="/leaderboard" onClick={onClose}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">{t('nav.items.leaderboard.label')}</span>
                </div>
              </Link>
              <Link to="/bookmarks" onClick={onClose}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{t('nav.items.bookmarks.label')}</span>
                </div>
              </Link>
              {user?.is_admin && (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <Link to="/admin" onClick={onClose}>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-primary-600 dark:text-primary-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('nav.user.adminPanel')}</span>
                    </div>
                  </Link>
                </>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors text-error-600 dark:text-error-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{t('nav.user.logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
