import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { UI, type UiMessageKey } from './messages'
import {
  LOCALE_STORAGE_KEY,
  pickLocale,
  type Locale,
  type LocalizedString,
} from './types'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Look up a chrome UI string. */
  t: (key: UiMessageKey) => string
  /** Pick en/zh from a LocalizedString (disease packs, anatomy defs). */
  L: (text: LocalizedString) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (raw === 'en' || raw === 'zh') return raw
  } catch {
    /* ignore */
  }
  // Prefer Chinese for first visit when the browser language is zh*.
  if (typeof navigator !== 'undefined' && /^zh\b/i.test(navigator.language)) {
    return 'zh'
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title =
      locale === 'zh'
        ? '病理心电仿真 — ECG Stimulator'
        : 'Pathology ECG Simulator — ECG Stimulator'
  }, [locale])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => pickLocale(UI[key], locale),
      L: (text) => pickLocale(text, locale),
    }),
    [locale, setLocale],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

export type { Locale, LocalizedString }
export { pickLocale }
