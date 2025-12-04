import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        const tokens = await authApi.login({ username, password })
        localStorage.setItem('access_token', tokens.access_token)
        const user = await authApi.getCurrentUser()
        set({ user, token: tokens.access_token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        try {
          const token = localStorage.getItem('access_token')
          const user = await authApi.getCurrentUser()
          set({ user, token, isAuthenticated: true })
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
          localStorage.removeItem('access_token')
          throw error // Re-throw so App.tsx can catch it
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
