import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout'
import { Toaster } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import { appLogger } from './utils/debugLogger'
import { ensureBackendReady, subscribeBackendStatus, type BackendStatus } from './lib/backendStatus'

// ── Lazy-loaded pages (code-split per route) ──────────────────────
const Home = lazy(() => import('./pages/Home'))
const Stories = lazy(() => import('./pages/Stories'))
const StoryReader = lazy(() => import('./pages/StoryReader'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const SentenceBuilder = lazy(() => import('./pages/SentenceBuilder'))
const Dictation = lazy(() => import('./pages/Dictation'))
const Adventure = lazy(() => import('./pages/Adventure'))
const SpeakingPractice = lazy(() => import('./pages/SpeakingPractice'))
const StoryChallenge = lazy(() => import('./pages/StoryChallenge'))
const MockTest = lazy(() => import('./pages/MockTest'))
const SentenceScramble = lazy(() => import('./pages/SentenceScramble'))
const MatchingGame = lazy(() => import('./pages/MatchingGame'))
const ToneTrainer = lazy(() => import('./pages/ToneTrainer'))
const Review = lazy(() => import('./pages/Review'))
const Writing = lazy(() => import('./pages/Writing'))
const Typing = lazy(() => import('./pages/Typing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Landing = lazy(() => import('./pages/Landing'))
const MyBookmarks = lazy(() => import('./pages/MyBookmarks'))
const Conversation = lazy(() => import('./pages/Conversation'))
const Admin = lazy(() => import('./pages/Admin'))
const Battle = lazy(() => import('./pages/Battle'))
const LadderRace = lazy(() => import('./pages/LadderRace'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'))
const LearningPath = lazy(() => import('./pages/LearningPath'))
const LearningSession = lazy(() => import('./pages/LearningSession'))
const Library = lazy(() => import('./pages/Library'))
const NotFound = lazy(() => import('./pages/NotFound'))
const MaintenancePage = lazy(() => import('./pages/Maintenance'))
const About = lazy(() => import('./pages/About'))

// ── Per-route document title ──────────────────────────────────────
// Tanpa ini setiap halaman menampilkan judul tab yang sama, jadi tab
// browser & riwayat back/forward tak memberi tahu kamu ada di mana.
const BASE_TITLE = 'HanziNarrative — Belajar Mandarin HSK Interaktif'
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Hari Ini', '/review': 'Review', '/path': 'Kursus', '/stories': 'Cerita',
  '/library': 'Pustaka', '/dashboard': 'Statistik', '/flashcards': 'Kartu Kosakata',
  '/writing': 'Menulis', '/typing': 'Mengetik', '/speaking': 'Berbicara',
  '/dictation': 'Dikte', '/quiz': 'Kuis', '/tones': 'Nada', '/mock-test': 'Tes Simulasi',
  '/vocabulary': 'Kosakata', '/explorer': 'Story Blanks', '/battle': 'Duel',
  '/ladder': 'Ular Tangga', '/adventure': 'Petualangan', '/conversation': 'Chat AI',
  '/matching': 'Cocokkan', '/sentence-builder': 'Susun Kalimat', '/story-challenge': 'Tantangan Cerita',
  '/daily-challenge': 'Tantangan Harian', '/profile': 'Profil', '/leaderboard': 'Peringkat',
  '/bookmarks': 'Tersimpan', '/login': 'Masuk', '/register': 'Daftar', '/about': 'Tentang',
  '/onboarding': 'Mulai', '/admin': 'Admin',
}

function RouteTitle() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    let name = ROUTE_TITLES[pathname]
    if (name === undefined) {
      if (pathname.startsWith('/stories/')) name = 'Cerita'
      else if (pathname.startsWith('/path/session/')) name = 'Lesson'
    }
    document.title = name ? `${name} · HanziNarrative` : BASE_TITLE
  }, [pathname])

  // Keep <html lang> in sync with the UI language so screen readers pronounce
  // the interface correctly and browsers offer the right translation prompt.
  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith('id') ? 'id' : 'en'
  }, [i18n.language])

  return null
}

// ── Backend warm-up banner (Koyeb free tier cold start) ──────────
function BackendBanner() {
  const [status, setStatus] = useState<BackendStatus>('unknown')
  useEffect(() => subscribeBackendStatus(setStatus), [])

  if (status === 'warming') {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium shadow-lg shadow-amber-500/30 animate-fade-in">
        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
        Server is starting up — please wait a moment
      </div>
    )
  }
  if (status === 'failed') {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium shadow-lg">
        <AlertTriangle className="w-4 h-4 shrink-0" /> Server unreachable — check your connection
      </div>
    )
  }
  return null
}

// ── Minimal loading fallback ──────────────────────────────────────
// Generic page skeleton (title + content card + tiles) shown while a lazy
// route chunk loads — keeps every page transition in the skeleton family.
function PageLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-56" />
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-3xl h-40" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-24" />
        ))}
      </div>
    </div>
  )
}

// Wrap a lazy component with Suspense + ErrorBoundary
function LazyPage({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Onboarding Guard - Redirect to onboarding if authenticated but not completed
function OnboardingGuard({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, onboardingCompleted } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated && !onboardingCompleted && location.pathname !== '/onboarding') {
    appLogger.debug('Redirecting to onboarding', { pathname: location.pathname })
    return <Navigate to="/onboarding" replace />
  }

  return children
}

// Auth Guard - Redirect to landing page if not authenticated
function AuthGuard({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />
  }

  return children
}

// Admin Guard - Redirect non-admins to home
function AdminGuard({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, user, authInitialized } = useAuthStore()

  // Wait for auth to finish initializing before deciding
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PageLoader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />
  }

  if (!user?.is_admin) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const { fetchUser, logout, setAuthInitialized } = useAuthStore()

  // Initialize auth state on app load.
  // Read token directly from localStorage (not from Zustand closure) to avoid
  // stale-closure race: persisted store may not have hydrated yet when the
  // effect fires on the very first render.
  useEffect(() => {
    let cancelled = false

    const initAuth = async () => {
      const token = localStorage.getItem('access_token')

      // Kick off backend health check immediately (non-blocking for public pages).
      // If backend is sleeping, ensureBackendReady() will show the banner and
      // the axios interceptor will await it before retrying failed requests.
      const backendCheck = ensureBackendReady().catch(() => {
        appLogger.warn('Backend unreachable on startup')
      })

      if (token) {
        // Wait for backend before fetching user so auth doesn't fail on cold start
        await backendCheck
        try {
          await fetchUser()
          if (!cancelled) appLogger.info('Auth token verified successfully')
        } catch (error) {
          if (!cancelled) {
            appLogger.warn('Token invalid, logging out', error as Record<string, unknown>)
            logout()
          }
        }
      } else {
        // No token → not authenticated; mark init complete so guards don't hang
        if (!cancelled) {
          appLogger.debug('No token found, skipping auth init')
          setAuthInitialized(true)
        }
      }
    }

    initAuth()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Toaster />
      <RouteTitle />
      <BackendBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LazyPage name="Landing"><Landing /></LazyPage>} />
        <Route path="/login" element={<LazyPage name="Login"><Login /></LazyPage>} />
        <Route path="/register" element={<LazyPage name="Register"><Register /></LazyPage>} />
        <Route path="/auth/callback" element={<LazyPage name="AuthCallback"><AuthCallback /></LazyPage>} />
        <Route path="/about" element={<LazyPage name="About"><About /></LazyPage>} />
        <Route path="/maintenance" element={<LazyPage name="Maintenance"><MaintenancePage /></LazyPage>} />

        {/* Onboarding route - requires auth */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <LazyPage name="Onboarding"><Onboarding /></LazyPage>
            </AuthGuard>
          }
        />

        {/* Admin route - requires auth + is_admin */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <LazyPage name="Admin"><Admin /></LazyPage>
            </AdminGuard>
          }
        />

        {/* Protected routes - require auth and completed onboarding */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <OnboardingGuard>
                <Layout />
              </OnboardingGuard>
            </AuthGuard>
          }
        >
          <Route index element={<LazyPage name="Home"><Home /></LazyPage>} />
          <Route path="review" element={<LazyPage name="Review"><Review /></LazyPage>} />
          <Route path="flashcards" element={<LazyPage name="Flashcards"><Flashcards /></LazyPage>} />
          <Route path="dashboard" element={<LazyPage name="Dashboard"><Dashboard /></LazyPage>} />
          <Route path="writing" element={<LazyPage name="Writing"><Writing /></LazyPage>} />
          <Route path="typing" element={<LazyPage name="Typing"><Typing /></LazyPage>} />
          <Route path="quiz" element={<LazyPage name="Quiz"><Quiz /></LazyPage>} />
          <Route path="stories" element={<LazyPage name="Stories"><Stories /></LazyPage>} />
          <Route path="stories/:id" element={<LazyPage name="StoryReader"><StoryReader /></LazyPage>} />
          <Route path="bookmarks" element={<LazyPage name="MyBookmarks"><MyBookmarks /></LazyPage>} />
          <Route path="vocabulary" element={<LazyPage name="Vocabulary"><Vocabulary /></LazyPage>} />
          <Route path="sentence-builder" element={<LazyPage name="SentenceBuilder"><SentenceBuilder /></LazyPage>} />
          <Route path="dictation" element={<LazyPage name="Dictation"><Dictation /></LazyPage>} />
          <Route path="adventure" element={<LazyPage name="Adventure"><Adventure /></LazyPage>} />
          <Route path="speaking" element={<LazyPage name="SpeakingPractice"><SpeakingPractice /></LazyPage>} />
          <Route path="story-challenge" element={<LazyPage name="StoryChallenge"><StoryChallenge /></LazyPage>} />
          <Route path="mock-test" element={<LazyPage name="MockTest"><MockTest /></LazyPage>} />
          <Route path="explorer" element={<LazyPage name="HanziExplorer"><SentenceScramble /></LazyPage>} />
          <Route path="matching" element={<LazyPage name="MatchingGame"><MatchingGame /></LazyPage>} />
          <Route path="tones" element={<LazyPage name="ToneTrainer"><ToneTrainer /></LazyPage>} />
          <Route path="profile" element={<LazyPage name="Profile"><Profile /></LazyPage>} />
          <Route path="leaderboard" element={<LazyPage name="Leaderboard"><Leaderboard /></LazyPage>} />
          <Route path="conversation" element={<LazyPage name="Conversation"><Conversation /></LazyPage>} />
          <Route path="battle" element={<LazyPage name="Battle"><Battle /></LazyPage>} />
          <Route path="ladder" element={<LazyPage name="LadderRace"><LadderRace /></LazyPage>} />
          <Route path="daily-challenge" element={<LazyPage name="DailyChallenge"><DailyChallenge /></LazyPage>} />
          <Route path="path" element={<LazyPage name="LearningPath"><LearningPath /></LazyPage>} />
          <Route path="path/session/:sessionId" element={<LazyPage name="LearningSession"><LearningSession /></LazyPage>} />
          <Route path="library" element={<LazyPage name="Library"><Library /></LazyPage>} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<LazyPage name="NotFound"><NotFound /></LazyPage>} />
      </Routes>
    </>
  )
}

export default App
