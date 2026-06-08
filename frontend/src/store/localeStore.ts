import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n/config'

export type Locale = 'en' | 'id'

interface LocaleStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: (typeof navigator !== 'undefined' && navigator.language.startsWith('id') ? 'id' : 'en') as Locale,
      setLocale: (locale) => {
        set({ locale })
        i18n.changeLanguage(locale)
      },
    }),
    { name: 'locale-storage' }
  )
)
