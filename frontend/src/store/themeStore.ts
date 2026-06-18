import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
}

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme-storage')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.state && typeof parsed.state.isDarkMode === 'boolean') {
        return parsed.state.isDarkMode
      }
    } catch { /* ignore */ }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Initial apply
applyTheme(getInitialTheme())

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: getInitialTheme(),

      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.isDarkMode
        applyTheme(newDarkMode)
        return { isDarkMode: newDarkMode }
      }),

      setDarkMode: (isDark: boolean) => set(() => {
        applyTheme(isDark)
        return { isDarkMode: isDark }
      }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.isDarkMode)
        }
      },
    }
  )
)

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // If the user hasn't manually overridden (we can't easily tell without more state, 
  // but usually users expect system sync if they haven't touched the toggle in this session).
  // For now, let's just make the app responsive to system changes if it's already matching.
  const { setDarkMode } = useThemeStore.getState()
  setDarkMode(e.matches)
})
