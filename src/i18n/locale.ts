export type Locale = 'zh' | 'en'

export const LOCALE_STORAGE_KEY = 'ecg-sim-locale'

export function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
