import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { userProgressApi } from '@/services/api'
import { UserProgress } from '@/types'

export default function Profile() {
  const { user } = useAuthStore()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    setLoading(true)
    try {
      const data = await userProgressApi.getProgress()
      setProgress(data)
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">User Information</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Username:</span> {user.username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Member since:</span>{' '}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Learning Progress</h2>
        {loading ? (
          <p className="text-gray-600">Loading progress...</p>
        ) : progress.length === 0 ? (
          <p className="text-gray-600">
            Start reading stories to track your progress!
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {progress.length}
                </div>
                <div className="text-sm text-gray-600">Words Learned</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {progress.reduce((acc, p) => acc + p.review_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    progress.reduce((acc, p) => acc + p.familiarity_level, 0) /
                      progress.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Avg. Familiarity</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
