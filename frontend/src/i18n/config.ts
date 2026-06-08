import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import id from './locales/id.json'

function getInitialLocale(): string {
  try {
    const raw = localStorage.getItem('locale-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const saved = parsed?.state?.locale
      if (saved === 'en' || saved === 'id') return saved
    }
  } catch { /* ignore */ }
  return navigator.language.startsWith('id') ? 'id' : 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
    },
    lng: getInitialLocale(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
