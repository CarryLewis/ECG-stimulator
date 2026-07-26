import {
  DISEASES,
  type Disease,
  type ParamValues,
} from '../ecg/diseases'
import {
  localizedCategory,
  localizedDiseaseName,
  localizedOptionLabel,
  localizedParamLabel,
} from '../i18n/diseasesLocale'
import { useLanguage } from '../i18n/useLanguage'

interface ControlPanelProps {
  disease: Disease
  params: ParamValues
  onSelectDisease: (id: string) => void
  onParamChange: (key: string, value: number | string) => void
  timeScale: number
  onTimeScaleChange: (scale: number) => void
}

const SPEED_PRESETS = [
  { key: 'paceSlow' as const, value: 0.2 },
  { key: 'paceLearn' as const, value: 0.35 },
  { key: 'paceClear' as const, value: 0.5 },
  { key: 'paceReal' as const, value: 1 },
]

export default function ControlPanel({
  disease,
  params,
  onSelectDisease,
  onParamChange,
  timeScale,
  onTimeScaleChange,
}: ControlPanelProps) {
  const { locale, t } = useLanguage()
  const pct = Math.round(timeScale * 100)

  return (
    <div className="panel control-panel">
      <h2 className="panel-title">{t('scenario')}</h2>
      <p className="panel-hint">{t('scenarioHint')}</p>

      <div className="disease-list">
        {DISEASES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={
              'disease-btn' + (d.id === disease.id ? ' disease-btn--active' : '')
            }
            onClick={() => onSelectDisease(d.id)}
          >
            <span className="disease-btn-name">
              {localizedDiseaseName(d.id, d.name, locale)}
            </span>
            <span className="disease-btn-cat">
              {localizedCategory(d.id, d.category, locale)}
            </span>
          </button>
        ))}
      </div>

      <h2 className="panel-title">{t('playbackPace')}</h2>
      <p className="panel-hint">{t('playbackHint')}</p>
      <div className="param-list">
        <label className="param">
          <span className="param-row">
            <span className="param-label">{t('timeScale')}</span>
            <span className="param-value">
              {pct}
              <span className="param-unit"> {t('realTimePct')}</span>
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
        <div className="speed-presets" role="group" aria-label={t('pacePresetsAria')}>
          {SPEED_PRESETS.map((p) => (
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
              <span className="speed-preset-meta">×{p.value}</span>
            </button>
          ))}
        </div>
      </div>

      <h2 className="panel-title">{t('parameters')}</h2>
      <div className="param-list">
        {disease.params.map((p) => {
          const value = params[p.key]
          const label = localizedParamLabel(disease.id, p.key, p.label, locale)
          if (p.type === 'select') {
            return (
              <label key={p.key} className="param param--select">
                <span className="param-label">{label}</span>
                <select
                  value={String(value)}
                  onChange={(e) => onParamChange(p.key, e.target.value)}
                >
                  {p.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {localizedOptionLabel(
                        disease.id,
                        p.key,
                        o.value,
                        o.label,
                        locale,
                      )}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          const n = typeof value === 'number' ? value : Number(value)
          const isFloat = (p.step ?? 1) < 1
          return (
            <label key={p.key} className="param">
              <span className="param-row">
                <span className="param-label">{label}</span>
                <span className="param-value">
                  {isFloat ? n.toFixed(p.unit === 's' ? 2 : 1) : Math.round(n)}
                  <span className="param-unit"> {p.unit}</span>
                </span>
              </span>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={n}
                onChange={(e) => onParamChange(p.key, Number(e.target.value))}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
