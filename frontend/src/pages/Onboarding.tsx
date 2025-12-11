import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

export default function Onboarding() {
  const navigate = useNavigate()
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await authApi.completeOnboarding()
      await fetchUser()
      navigate('/')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Welcome to HanziNarrative!</h2>
          <p className="mt-2 text-gray-600">
            Let's get you started on your Chinese learning journey
          </p>
        </div>

        <div className="card">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Welcome to HanziNarrative!</h3>
            <p className="text-blue-800 mb-4">
              Your interactive Chinese learning platform. Here's what you can do:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li>📖 Read interactive stories with clickable words</li>
              <li>✍️ Practice writing Chinese characters</li>
              <li>🎯 Test your knowledge with quizzes</li>
              <li>📊 Track your progress and review vocabulary</li>
            </ul>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}
