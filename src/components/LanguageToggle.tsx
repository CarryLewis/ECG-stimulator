import { useLanguage } from '../i18n/useLanguage'

/** Compact EN / 中文 switch for the app header. */
export default function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div className="lang-toggle" role="group" aria-label={t('langSwitchAria')}>
      <button
        type="button"
        className={'lang-btn' + (locale === 'zh' ? ' lang-btn--active' : '')}
        onClick={() => setLocale('zh')}
        onPointerDown={(e) => {
          e.stopPropagation()
          setLocale('zh')
        }}
        aria-pressed={locale === 'zh'}
      >
        {t('langZh')}
      </button>
      <button
        type="button"
        className={'lang-btn' + (locale === 'en' ? ' lang-btn--active' : '')}
        onClick={() => setLocale('en')}
        onPointerDown={(e) => {
          e.stopPropagation()
          setLocale('en')
        }}
        aria-pressed={locale === 'en'}
      >
        {t('langEn')}
      </button>
    </div>
  )
}
