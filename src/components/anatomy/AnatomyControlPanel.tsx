import type { ReactNode } from 'react'
import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import { useLanguage } from '../../i18n'

interface AnatomyControlPanelProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  onOpacityChange: (opacity: number) => void
  onToggleLabels: (show: boolean) => void
  timeScale: number
  onTimeScaleChange: (scale: number) => void
  rateBpm: number
  onRateChange: (bpm: number) => void
  /** Optional pathology / disease controls rendered after the header. */
  pathologySlot?: ReactNode
}

const SPEED_PRESET_KEYS = [
  { key: 'speedSlow' as const, value: 0.2 },
  { key: 'speedLearn' as const, value: 0.35 },
  { key: 'speedClear' as const, value: 0.5 },
  { key: 'speedReal' as const, value: 1 },
]

const VERSION_COPY = {
  anatomy: {
    short: 'versionAnatomyShort',
    title: 'versionAnatomyTitle',
    hint: 'versionAnatomyHint',
  },
  v1: {
    short: 'versionV1Short',
    title: 'versionV1Title',
    hint: 'versionV1Hint',
  },
  v2: {
    short: 'versionV2Short',
    title: 'versionV2Title',
    hint: 'versionV2Hint',
  },
  v3: {
    short: 'versionV3Short',
    title: 'versionV3Title',
    hint: 'versionV3Hint',
  },
} as const

export default function AnatomyControlPanel({
  heartVersion,
  onHeartVersionChange,
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
  onOpacityChange,
  onToggleLabels,
  timeScale,
  onTimeScaleChange,
  rateBpm,
  pathologySlot,
}: AnatomyControlPanelProps) {
  const { t, L, locale, setLocale } = useLanguage()
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)
  const versionKeys = VERSION_COPY[heartVersion]

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
              onClick={() => setLocale('zh')}
            >
              {t('langZh')}
            </button>
            <button
              type="button"
              className={
                'locale-btn' + (locale === 'en' ? ' locale-btn--active' : '')
              }
              onClick={() => setLocale('en')}
            >
              {t('langEn')}
            </button>
          </div>
        </div>
        <h1 className="anatomy-title">{t('appTitle')}</h1>
        <p className="anatomy-lede">{t('appLede')}</p>
      </header>

      {pathologySlot}

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">{t('playback')}</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>{t('timeScale')}</span>
            <span className="anatomy-control-value">
              ×{timeScale.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.15}
            max={1}
            step={0.05}
            value={timeScale}
            onChange={(e) => onTimeScaleChange(Number(e.target.value))}
          />
        </label>
        <div className="speed-presets" role="group" aria-label={t('pacePresets')}>
          {SPEED_PRESET_KEYS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={
                'speed-preset' +
                (Math.abs(timeScale - p.value) < 0.01
                  ? ' speed-preset--active'
                  : '')
              }
              onClick={() => onTimeScaleChange(p.value)}
            >
              {t(p.key)}
            </button>
          ))}
        </div>
        <div className="anatomy-control">
          <span className="anatomy-control-row">
            <span>{t('ventricularRate')}</span>
            <span className="anatomy-control-value">
              {Math.round(rateBpm)} bpm
            </span>
          </span>
          <p className="anatomy-version-hint">{t('rateHint')}</p>
        </div>
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">{t('heartVersion')}</h2>
        <div
          className="heart-version-toggle"
          role="group"
          aria-label={t('heartVersionGroup')}
        >
          {HEART_VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={
                'heart-version-btn' +
                (heartVersion === v.id ? ' heart-version-btn--active' : '')
              }
              onClick={() => onHeartVersionChange(v.id)}
            >
              {t(VERSION_COPY[v.id].short)}
            </button>
          ))}
        </div>
        {versionMeta && (
          <p className="anatomy-version-hint">
            <strong>{t(versionKeys.title)}</strong> — {t(versionKeys.hint)}
          </p>
        )}
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">{t('display')}</h2>
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
        <label className="anatomy-toggle">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onToggleLabels(e.target.checked)}
          />
          <span>{t('anatomicalLabels')}</span>
        </label>
      </section>

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

      <section className="anatomy-section anatomy-detail">
        <h2 className="anatomy-section-title">
          {selected ? L(selected.label) : t('selection')}
        </h2>
        {selected ? (
          <>
            <p className="anatomy-detail-abbr">{selected.abbr}</p>
            <p className="anatomy-detail-body">{L(selected.description)}</p>
          </>
        ) : (
          <p className="anatomy-detail-body anatomy-detail-body--muted">
            {t('selectionHint')}
          </p>
        )}
      </section>
    </aside>
  )
}
