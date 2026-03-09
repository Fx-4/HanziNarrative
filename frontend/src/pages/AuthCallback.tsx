import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function AuthCallback() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const { fetchUser, setAuthInitialized } = useAuthStore()

    useEffect(() => {
        const token = params.get('token')
        const error = params.get('error')

        if (error || !token) {
            navigate('/login?error=google_failed', { replace: true })
            return
        }

        // Save token then fetch user profile
        localStorage.setItem('access_token', token)
        fetchUser()
            .then(() => {
                const { onboardingCompleted } = useAuthStore.getState()
                navigate(onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true })
            })
            .catch(() => {
                localStorage.removeItem('access_token')
                setAuthInitialized(true)
                navigate('/login?error=google_failed', { replace: true })
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-[3px] border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Signing you in with Google…</p>
            </div>
        </div>
    )
}
