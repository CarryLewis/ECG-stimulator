export type Locale = 'en' | 'zh'

const noopLocale = (_locale: Locale): void => {
  void _locale
}

export function useLanguage() {
  return {
    locale: 'en' as Locale,
    setLocale: noopLocale,
    t: (key: string) => key,
  }
}
