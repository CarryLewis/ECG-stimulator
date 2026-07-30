import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import type {
  EcgValidationResult,
  HypertrophyKind,
  InjuryLocation,
  SimulationParams,
} from '../../simulation/types'

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
  simParams: SimulationParams
  onSimParamsChange: (patch: Partial<SimulationParams>) => void
  validation: EcgValidationResult | null
}

const SPEED_PRESETS = [
  { label: 'Slow', value: 0.2 },
  { label: 'Learn', value: 0.35 },
  { label: 'Clear', value: 0.5 },
  { label: 'Real', value: 1 },
]

const INJURY_OPTIONS: { value: InjuryLocation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'anterior', label: 'Anterior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'lateral', label: 'Lateral' },
  { value: 'septal', label: 'Septal' },
]

const HYPERTROPHY_OPTIONS: { value: HypertrophyKind; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'lvh', label: 'LVH' },
  { value: 'rvh', label: 'RVH' },
]

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
  onRateChange,
  simParams,
  onSimParamsChange,
  validation,
}: AnatomyControlPanelProps) {
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <p className="anatomy-eyebrow">Physiological source</p>
        <h1 className="anatomy-title">ECG Stimulator</h1>
        <p className="anatomy-lede">
          One cardiac vector M(t) is projected onto 12 lead axes. Conduction
          stages shape the dipole — leads are never drawn independently.
        </p>
      </header>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Playback</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Time scale</span>
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
        <div className="speed-presets" role="group" aria-label="Pace presets">
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
              {p.label}
            </button>
          ))}
        </div>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Heart rate</span>
            <span className="anatomy-control-value">{rateBpm} bpm</span>
          </span>
          <input
            type="range"
            min={40}
            max={140}
            step={1}
            value={rateBpm}
            onChange={(e) => {
              const bpm = Number(e.target.value)
              onRateChange(bpm)
              onSimParamsChange({ heartRate_bpm: bpm })
            }}
          />
        </label>
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Electrophysiology</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Conduction velocity</span>
            <span className="anatomy-control-value">
              ×{simParams.conductionVelocity.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.4}
            max={1.6}
            step={0.05}
            value={simParams.conductionVelocity}
            onChange={(e) =>
              onSimParamsChange({
                conductionVelocity: Number(e.target.value),
              })
            }
          />
        </label>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Cardiac axis</span>
            <span className="anatomy-control-value">
              {simParams.cardiacAxis_deg}°
            </span>
          </span>
          <input
            type="range"
            min={-30}
            max={120}
            step={5}
            value={simParams.cardiacAxis_deg}
            onChange={(e) =>
              onSimParamsChange({ cardiacAxis_deg: Number(e.target.value) })
            }
          />
        </label>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>PR scale</span>
            <span className="anatomy-control-value">
              ×{simParams.prScale.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.6}
            max={2}
            step={0.05}
            value={simParams.prScale}
            onChange={(e) =>
              onSimParamsChange({ prScale: Number(e.target.value) })
            }
          />
        </label>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>QRS scale</span>
            <span className="anatomy-control-value">
              ×{simParams.qrsScale.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.7}
            max={2}
            step={0.05}
            value={simParams.qrsScale}
            onChange={(e) =>
              onSimParamsChange({ qrsScale: Number(e.target.value) })
            }
          />
        </label>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Injury location</span>
          </span>
          <select
            className="anatomy-select"
            value={simParams.injuryLocation}
            onChange={(e) =>
              onSimParamsChange({
                injuryLocation: e.target.value as InjuryLocation,
                injurySeverity:
                  e.target.value === 'none'
                    ? 0
                    : Math.max(0.4, simParams.injurySeverity),
              })
            }
          >
            {INJURY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {simParams.injuryLocation !== 'none' && (
          <label className="anatomy-control">
            <span className="anatomy-control-row">
              <span>Injury severity</span>
              <span className="anatomy-control-value">
                {Math.round(simParams.injurySeverity * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={simParams.injurySeverity}
              onChange={(e) =>
                onSimParamsChange({
                  injurySeverity: Number(e.target.value),
                })
              }
            />
          </label>
        )}
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Hypertrophy</span>
          </span>
          <select
            className="anatomy-select"
            value={simParams.hypertrophy}
            onChange={(e) =>
              onSimParamsChange({
                hypertrophy: e.target.value as HypertrophyKind,
                hypertrophySeverity:
                  e.target.value === 'none'
                    ? 0
                    : Math.max(0.5, simParams.hypertrophySeverity),
              })
            }
          >
            {HYPERTROPHY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {simParams.hypertrophy !== 'none' && (
          <label className="anatomy-control">
            <span className="anatomy-control-row">
              <span>Hypertrophy severity</span>
              <span className="anatomy-control-value">
                {Math.round(simParams.hypertrophySeverity * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={simParams.hypertrophySeverity}
              onChange={(e) =>
                onSimParamsChange({
                  hypertrophySeverity: Number(e.target.value),
                })
              }
            />
          </label>
        )}
      </section>

      {validation && (
        <section className="anatomy-section">
          <h2 className="anatomy-section-title">ECG validation</h2>
          <p
            className={
              'ecg-validation-badge' +
              (validation.ok
                ? ' ecg-validation-badge--ok'
                : ' ecg-validation-badge--fail')
            }
          >
            {validation.ok ? 'Morphology checks passed' : 'Morphology issues'}
          </p>
          <ul className="ecg-validation-metrics">
            <li>II {validation.metrics.leadII_qrsPolarity.toFixed(2)} mV</li>
            <li>aVR {validation.metrics.aVR_qrsPolarity.toFixed(2)} mV</li>
            <li>V1 {validation.metrics.v1_qrsPolarity.toFixed(2)} mV</li>
            <li>V6 {validation.metrics.v6_qrsPolarity.toFixed(2)} mV</li>
          </ul>
          {validation.issues.length > 0 && (
            <ul className="ecg-validation-issues">
              {validation.issues.map((issue) => (
                <li key={issue.code} data-severity={issue.severity}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Heart version</h2>
        <div
          className="heart-version-toggle"
          role="group"
          aria-label="Heart model version"
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
              {v.short}
            </button>
          ))}
        </div>
        {versionMeta && (
          <p className="anatomy-version-hint">
            <strong>{versionMeta.title}</strong> — {versionMeta.hint}
          </p>
        )}
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Display</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Myocardium opacity</span>
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
          <span>Anatomical labels</span>
        </label>
        <p className="anatomy-version-hint">
          Opacity drives the <strong>Src</strong> chamber model. Yellow arrow =
          instantaneous M(t).
        </p>
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Structures</h2>
        <ul className="structure-list" role="listbox" aria-label="Heart structures">
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
                    <span className="structure-name">{s.label.en}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="anatomy-section anatomy-detail">
        <h2 className="anatomy-section-title">
          {selected ? selected.label.en : 'Selection'}
        </h2>
        {selected ? (
          <>
            <p className="anatomy-detail-abbr">{selected.abbr}</p>
            <p className="anatomy-detail-body">{selected.description.en}</p>
          </>
        ) : (
          <p className="anatomy-detail-body anatomy-detail-body--muted">
            Adjust EP parameters and watch all 12 leads update from the same
            dipole. Src view overlays M(t) on the heart.
          </p>
        )}
      </section>
    </aside>
  )
}
