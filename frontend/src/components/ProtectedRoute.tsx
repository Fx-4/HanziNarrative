import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireOnboarding && user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
