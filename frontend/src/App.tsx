import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './components/Layout'
import { Toaster } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuthStore } from './store/authStore'
import { appLogger } from './utils/debugLogger'

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
const Practice = lazy(() => import('./pages/Practice'))
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
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'))

// ── Minimal loading fallback ──────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm text-gray-400 dark:text-gray-500">Loading...</span>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
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

      if (token) {
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
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LazyPage name="Landing"><Landing /></LazyPage>} />
        <Route path="/login" element={<LazyPage name="Login"><Login /></LazyPage>} />
        <Route path="/register" element={<LazyPage name="Register"><Register /></LazyPage>} />
        <Route path="/auth/callback" element={<LazyPage name="AuthCallback"><AuthCallback /></LazyPage>} />

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
          <Route path="practice" element={<LazyPage name="Practice"><Practice /></LazyPage>} />
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
          <Route path="daily-challenge" element={<LazyPage name="DailyChallenge"><DailyChallenge /></LazyPage>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
