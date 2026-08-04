export type Locale = 'en' | 'zh'

export type LocalizedString = { en: string; zh: string }

export function pickLocale(text: LocalizedString, locale: Locale): string {
  return locale === 'zh' ? text.zh : text.en
}

export const LOCALE_STORAGE_KEY = 'ecg-stimulator-locale'
