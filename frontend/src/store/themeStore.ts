import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  /** True once the user explicitly picks a theme. While true, system theme changes are ignored. */
  userOverride: boolean
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

const getSavedState = (): { isDarkMode: boolean; userOverride: boolean } | null => {
  const saved = localStorage.getItem('theme-storage')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.state && typeof parsed.state.isDarkMode === 'boolean') {
        return {
          isDarkMode: parsed.state.isDarkMode,
          // Legacy saves had no userOverride — treat an existing saved preference as a user choice.
          userOverride: parsed.state.userOverride ?? true,
        }
      }
    } catch { /* ignore */ }
  }
  return null
}

const getInitialTheme = () => {
  const saved = getSavedState()
  if (saved) return saved.isDarkMode
  // Default: light. Tema hanya gelap bila user memilihnya sendiri (tidak ikut OS).
  return false
}

const getInitialOverride = () => getSavedState()?.userOverride ?? false

// Initial apply
applyTheme(getInitialTheme())

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: getInitialTheme(),
      userOverride: getInitialOverride(),

      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.isDarkMode
        applyTheme(newDarkMode)
        return { isDarkMode: newDarkMode, userOverride: true }
      }),

      setDarkMode: (isDark: boolean) => set(() => {
        applyTheme(isDark)
        return { isDarkMode: isDark, userOverride: true }
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
