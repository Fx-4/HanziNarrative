import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stories from './pages/Stories'
import StoryReader from './pages/StoryReader'
import Vocabulary from './pages/Vocabulary'
import SentenceBuilder from './pages/SentenceBuilder'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Writing from './pages/Writing'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { Toaster } from './components/ui/Toast'
import { useAuthStore } from './store/authStore'

function App() {
  const { isAuthenticated, fetchUser, logout } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')

      if (isAuthenticated && token) {
        // Verify token is still valid by fetching user
        try {
          await fetchUser()
        } catch (error) {
          // Token invalid, logout
          console.log('Token invalid, logging out')
          logout()
        }
      } else if (isAuthenticated && !token) {
        // State says authenticated but no token in localStorage
        console.log('No token found, logging out')
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="practice" element={<Practice />} />
          <Route path="review" element={<Review />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="writing" element={<Writing />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="stories" element={<Stories />} />
          <Route path="stories/:id" element={<StoryReader />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="sentence-builder" element={<SentenceBuilder />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
