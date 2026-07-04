/**
 * UI preference persistence — bridges onboarding choices to the pages that use them.
 *
 * Onboarding stores preferences on the backend, but reading pages shouldn't need
 * an API call just to know a display default, so the relevant ones are mirrored
 * to localStorage at onboarding completion.
 */

const SHOW_PINYIN_KEY = 'pref-show-pinyin'

export function saveShowPinyinPref(value: boolean): void {
  try {
    localStorage.setItem(SHOW_PINYIN_KEY, String(value))
  } catch { /* storage unavailable — pages fall back to their default */ }
}

/** Default for "show pinyin" toggles. `fallback` applies when the user never chose. */
export function getShowPinyinPref(fallback = true): boolean {
  try {
    const v = localStorage.getItem(SHOW_PINYIN_KEY)
    return v === null ? fallback : v === 'true'
  } catch {
    return fallback
  }
}
