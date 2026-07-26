import { createContext } from 'react'
import type { Locale } from './locale'
import type { MessageKey } from './messages'

export interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
