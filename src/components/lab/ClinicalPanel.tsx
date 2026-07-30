import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import type { EcgPhaseInfo } from '../../ecg-generator'
import {
  axisQuadrantLabel,
  type InstantaneousElectricalField,
  type MeanElectricalAxis,
} from '../../vector-engine'
import type { PhysiologicalEvent } from '../../sim/events'

interface ClinicalPanelProps {
  heartVersion: HeartVersion
  selectedId: HeartStructureId | null
  onSelect: (id: HeartStructureId | null) => void
  myocardiumOpacity: number
  onOpacityChange: (opacity: number) => void
  showLabels: boolean
  onToggleLabels: (show: boolean) => void
  phase: EcgPhaseInfo
  active: PhysiologicalEvent | null
  axis: MeanElectricalAxis
  field: InstantaneousElectricalField
  activationIntensity: number
}

/**
 * Clinical interpretation — mechanism copy + compact display controls.
 */
export default function ClinicalPanel({
  heartVersion,
  selectedId,
  onSelect,
  myocardiumOpacity,
  onOpacityChange,
  showLabels,
  onToggleLabels,
  phase,
  active,
  axis,
  field,
  activationIntensity,
}: ClinicalPanelProps) {
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)
  const quadrant = axisQuadrantLabel(axis.qrsDeg)
  const contribs = field.contributions.filter((c) => c.weight > 0.08)

  return (
    <section className="lab-panel lab-panel--clinical" aria-label="Clinical interpretation">
      <header className="lab-panel-head">
        <div>
          <h2 className="lab-panel-title">Clinical</h2>
          <p className="lab-panel-sub">
            {versionMeta?.title ?? 'Interpretation'}
          </p>
        </div>
      </header>

      <div className="lab-clinical-block">
        <h3 className="lab-clinical-heading">Current mechanism</h3>
        <p className="lab-clinical-body">{mechanismCopy(phase, active)}</p>
      </div>

      <dl className="lab-clinical-metrics">
        <div>
          <dt>Mean QRS axis</dt>
          <dd>
            {formatDeg(axis.qrsDeg)}°
            <span className="lab-clinical-note">{quadrant}</span>
          </dd>
        </div>
        <div>
          <dt>Activation</dt>
          <dd>{Math.round(activationIntensity * 100)}%</dd>
        </div>
        <div>
          <dt>|Dipole|</dt>
          <dd>{axis.magnitude.toFixed(2)}</dd>
        </div>
      </dl>

      {contribs.length > 0 && (
        <ul className="lab-contrib">
          {contribs.map((c) => (
            <li key={`${c.kind}-${c.tag ?? ''}`}>
              <span className={`lab-dot lab-dot--${c.kind}`} />
              {c.kind.replace(/_/g, ' ')}
              <span>{Math.round(c.weight * 100)}%</span>
            </li>
          ))}
        </ul>
      )}

      <div className="lab-clinical-block">
        <h3 className="lab-clinical-heading">
          {selected ? selected.label.en : 'Structure notes'}
        </h3>
        {selected ? (
          <p className="lab-clinical-body">{selected.description.en}</p>
        ) : (
          <p className="lab-clinical-body lab-clinical-body--muted">
            Select a chamber on the source model, or a lead on the atlas /
            torso views. Electrical activity and ECG remain driven by the
            shared simulation clock.
          </p>
        )}
      </div>

      {heartVersion === 'anatomy' && (
        <ul className="lab-structure-list" role="listbox" aria-label="Heart structures">
          {HEART_STRUCTURES.map((s) => {
            const on = selectedId === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={
                    'lab-structure-btn' + (on ? ' lab-structure-btn--active' : '')
                  }
                  style={{ ['--swatch' as string]: s.color }}
                  onClick={() => onSelect(on ? null : s.id)}
                >
                  <span className="lab-structure-swatch" />
                  {s.abbr}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="lab-display-controls">
        <label className="lab-field">
          <span className="lab-field-row">
            <span>Myocardium opacity</span>
            <span className="lab-field-value">
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
        <label className="lab-check">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onToggleLabels(e.target.checked)}
          />
          <span>Show labels</span>
        </label>
      </div>
    </section>
  )
}

function formatDeg(d: number): string {
  const rounded = Math.round(d)
  return rounded > 0 ? `+${rounded}` : `${rounded}`
}

function mechanismCopy(
  phase: EcgPhaseInfo,
  active: PhysiologicalEvent | null,
): string {
  switch (phase.drivenBy) {
    case 'atrial_activation':
      return (
        'Atrial depolarization produces the P wave. The atrial vector is ' +
        'inferior and slightly leftward, so Lead II typically shows a positive deflection.'
      )
    case 'ventricular_depolarization':
      return (
        'Ventricular depolarization forms the QRS. Septal, apical, and basal ' +
        'wavefronts sum to the mean electrical axis projected onto each lead.'
      )
    case 'repolarization':
      return (
        'Ventricular recovery produces the T wave. In sinus rhythm the T vector ' +
        'usually follows the main QRS polarity in the left-facing leads.'
      )
    case 'st_window':
      return (
        'The ST segment follows QRS onset. Injury current (when present) displaces ' +
        'this baseline along ischemic territory directions.'
      )
    default:
      if (active) {
        return `${active.label} is active on the conduction pathway. The ECG is isoelectric between organized wavefronts.`
      }
      return (
        'Diastole / resting interval. No organized myocardial wavefront is contributing ' +
        'to the equivalent cardiac dipole.'
      )
  }
}
