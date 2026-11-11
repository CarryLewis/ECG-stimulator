import { useEffect, useState, type ReactNode } from 'react'
import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import type { HeartStructureId } from '../../anatomy/types'
import { useLanguage } from '../../i18n'

interface AnatomyControlPanelProps {
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  onOpacityChange: (opacity: number) => void
  onToggleLabels: (show: boolean) => void
  canAdjustOpacity: boolean
  /** Optional pathology / disease controls rendered after the header. */
  pathologySlot?: ReactNode
  learningSlot?: ReactNode
}

export default function AnatomyControlPanel({
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
  onOpacityChange,
  onToggleLabels,
  canAdjustOpacity,
  pathologySlot,
  learningSlot,
}: AnatomyControlPanelProps) {
  const { t, L, locale, setLocale } = useLanguage()
  const [showLearning, setShowLearning] = useState(() => !window.matchMedia('(max-width: 720px)').matches)

  useEffect(() => {
    const phone = window.matchMedia('(max-width: 720px)')
    const update = () => setShowLearning(!phone.matches)
    phone.addEventListener('change', update)
    return () => phone.removeEventListener('change', update)
  }, [])

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <div className="anatomy-panel-header-row">
          <p className="anatomy-eyebrow">{t('appEyebrow')}</p>
          <div
            className="locale-toggle"
            role="group"
            aria-label={t('language')}
          >
            <button
              type="button"
              className={
                'locale-btn' + (locale === 'zh' ? ' locale-btn--active' : '')
              }
              aria-pressed={locale === 'zh'}
              onClick={() => setLocale('zh')}
            >
              {t('langZh')}
            </button>
            <button
              type="button"
              className={
                'locale-btn' + (locale === 'en' ? ' locale-btn--active' : '')
              }
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              {t('langEn')}
            </button>
          </div>
        </div>
        <h1 className="anatomy-title">{t('appTitle')} <small className="release-label">2.0</small></h1>
        <p className="anatomy-lede">{t('appLede')}</p>
      </header>

      {pathologySlot}
      <details className="learning-details sidebar-learning" open={showLearning}
        onToggle={(event) => setShowLearning(event.currentTarget.open)}>
        <summary>{t('learningControls')}</summary>
        {learningSlot}
      </details>

      <details className="learning-details anatomy-settings">
        <summary>{t('anatomySettings')}</summary>
        <fieldset className="anatomy-section" disabled={!canAdjustOpacity}>
          <legend>{t('versionAnatomyShort')}</legend>
          <label className="anatomy-control">
            <span className="anatomy-control-row">
              <span>{t('myocardiumOpacity')}</span>
              <span className="anatomy-control-value">
                {Math.round(myocardiumOpacity * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={myocardiumOpacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
            />
          </label>
        </fieldset>
        <label className="anatomy-toggle">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onToggleLabels(e.target.checked)}
          />
          <span>{t('anatomicalLabels')}</span>
        </label>

        <section className="anatomy-section">
          <h2 className="anatomy-section-title">{t('structures')}</h2>
          <ul
            className="structure-list"
            role="listbox"
            aria-label={t('structuresList')}
          >
            {HEART_STRUCTURES.map((s) => {
              const active = selectedId === s.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      'structure-btn' + (active ? ' structure-btn--active' : '')
                    }
                    style={{ ['--swatch' as string]: s.color }}
                    onClick={() => onSelect(active ? null : s.id)}
                  >
                    <span className="structure-swatch" />
                    <span className="structure-btn-text">
                      <span className="structure-abbr">{s.abbr}</span>
                      <span className="structure-name">{L(s.label)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </details>
    </aside>
  )
}
