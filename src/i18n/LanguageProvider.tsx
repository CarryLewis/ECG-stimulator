import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LanguageContext } from './context'
import {
  detectInitialLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './locale'
import { formatMessage, MESSAGES } from './messages'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale())

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
      locale === 'zh' ? '心电图学习模拟器' : 'ECG Learning Simulator'
  }, [locale])

  const t = useCallback(
    (key: keyof typeof MESSAGES.en, vars?: Record<string, string | number>) =>
      formatMessage(MESSAGES[locale][key], vars),
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
