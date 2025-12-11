import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

export default function Onboarding() {
  const navigate = useNavigate()
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
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
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">What's your current HSK level?</h3>
            <p className="text-gray-600 mb-4">
              This will help us recommend appropriate content for you. Don't worry, you can change this later!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl font-bold">HSK {level}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {level === 1 && 'Beginner'}
                    {level === 2 && 'Elementary'}
                    {level === 3 && 'Intermediate'}
                    {level === 4 && 'Upper Int.'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What you can do:</h4>
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
