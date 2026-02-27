import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stories from './pages/Stories'
import StoryReader from './pages/StoryReader'
import Vocabulary from './pages/Vocabulary'
import SentenceBuilder from './pages/SentenceBuilder'
import Dictation from './pages/Dictation'
import Adventure from './pages/Adventure'
import SpeakingPractice from './pages/SpeakingPractice'
import StoryChallenge from './pages/StoryChallenge'
import MockTest from './pages/MockTest'
import SentenceScramble from './pages/SentenceScramble' // Now HanziExplorer
import MatchingGame from './pages/MatchingGame'
import ToneTrainer from './pages/ToneTrainer'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Writing from './pages/Writing'
import Typing from './pages/Typing'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Onboarding from './pages/Onboarding'
import Landing from './pages/Landing'
import { Toaster } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuthStore } from './store/authStore'
import { appLogger } from './utils/debugLogger'

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

function App() {
  const { isAuthenticated, fetchUser, logout } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')

      if (isAuthenticated && token) {
        try {
          await fetchUser()
          appLogger.info('Auth token verified successfully')
        } catch (error) {
          appLogger.warn('Token invalid, logging out', error as Record<string, unknown>)
          logout()
        }
      } else if (isAuthenticated && !token) {
        appLogger.warn('No token found in localStorage, logging out')
        logout()
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={
          <ErrorBoundary name="Landing">
            <Landing />
          </ErrorBoundary>
        } />
        <Route path="/login" element={
          <ErrorBoundary name="Login">
            <Login />
          </ErrorBoundary>
        } />
        <Route path="/register" element={
          <ErrorBoundary name="Register">
            <Register />
          </ErrorBoundary>
        } />

        {/* Onboarding route - requires auth */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <ErrorBoundary name="Onboarding">
                <Onboarding />
              </ErrorBoundary>
            </AuthGuard>
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
          <Route index element={<ErrorBoundary name="Home"><Home /></ErrorBoundary>} />
          <Route path="practice" element={<ErrorBoundary name="Practice"><Practice /></ErrorBoundary>} />
          <Route path="review" element={<ErrorBoundary name="Review"><Review /></ErrorBoundary>} />
          <Route path="flashcards" element={<ErrorBoundary name="Flashcards"><Flashcards /></ErrorBoundary>} />
          <Route path="dashboard" element={<ErrorBoundary name="Dashboard"><Dashboard /></ErrorBoundary>} />
          <Route path="writing" element={<ErrorBoundary name="Writing"><Writing /></ErrorBoundary>} />
          <Route path="typing" element={<ErrorBoundary name="Typing"><Typing /></ErrorBoundary>} />
          <Route path="quiz" element={<ErrorBoundary name="Quiz"><Quiz /></ErrorBoundary>} />
          <Route path="stories" element={<ErrorBoundary name="Stories"><Stories /></ErrorBoundary>} />
          <Route path="stories/:id" element={<ErrorBoundary name="StoryReader"><StoryReader /></ErrorBoundary>} />
          <Route path="vocabulary" element={<ErrorBoundary name="Vocabulary"><Vocabulary /></ErrorBoundary>} />
          <Route path="sentence-builder" element={<ErrorBoundary name="SentenceBuilder"><SentenceBuilder /></ErrorBoundary>} />
          <Route path="dictation" element={<ErrorBoundary name="Dictation"><Dictation /></ErrorBoundary>} />
          <Route path="adventure" element={<ErrorBoundary name="Adventure"><Adventure /></ErrorBoundary>} />
          <Route path="speaking" element={<ErrorBoundary name="SpeakingPractice"><SpeakingPractice /></ErrorBoundary>} />
          <Route path="story-challenge" element={<ErrorBoundary name="StoryChallenge"><StoryChallenge /></ErrorBoundary>} />
          <Route path="mock-test" element={<ErrorBoundary name="MockTest"><MockTest /></ErrorBoundary>} />
          <Route path="explorer" element={<ErrorBoundary name="HanziExplorer"><SentenceScramble /></ErrorBoundary>} />
          <Route path="matching" element={<ErrorBoundary name="MatchingGame"><MatchingGame /></ErrorBoundary>} />
          <Route path="tones" element={<ErrorBoundary name="ToneTrainer"><ToneTrainer /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary name="Profile"><Profile /></ErrorBoundary>} />
          <Route path="leaderboard" element={<ErrorBoundary name="Leaderboard"><Leaderboard /></ErrorBoundary>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
