import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi, onboardingApi } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  onboardingCompleted: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  checkOnboardingStatus: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingCompleted: false,

      login: async (username: string, password: string) => {
        const tokens = await authApi.login({ username, password })
        localStorage.setItem('access_token', tokens.access_token)
        const user = await authApi.getCurrentUser()

        // Check onboarding status after login
        try {
          const status = await onboardingApi.getStatus()
          set({
            user,
            token: tokens.access_token,
            isAuthenticated: true,
            onboardingCompleted: status.onboarding_completed
          })
        } catch {
          set({ user, token: tokens.access_token, isAuthenticated: true })
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuthenticated: false, onboardingCompleted: false })
      },

      fetchUser: async () => {
        try {
          const token = localStorage.getItem('access_token')
          const user = await authApi.getCurrentUser()

          // Check onboarding status after fetching user
          try {
            const status = await onboardingApi.getStatus()
            set({
              user,
              token,
              isAuthenticated: true,
              onboardingCompleted: status.onboarding_completed
            })
          } catch {
            set({ user, token, isAuthenticated: true })
          }
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false, onboardingCompleted: false })
          localStorage.removeItem('access_token')
          throw error // Re-throw so App.tsx can catch it
        }
      },

      checkOnboardingStatus: async () => {
        try {
          const status = await onboardingApi.getStatus()
          set({ onboardingCompleted: status.onboarding_completed })
          return status.onboarding_completed
        } catch (error) {
          console.error('Failed to check onboarding status:', error)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
