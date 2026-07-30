import { axisQuadrantLabel } from '../../vector-engine'
import type {
  InstantaneousElectricalField,
  MeanElectricalAxis,
  LeadVoltages,
} from '../../vector-engine'

interface VectorHudProps {
  axis: MeanElectricalAxis
  field: InstantaneousElectricalField
  leads: LeadVoltages
  activationIntensity: number
  status: string
}

export default function VectorHud({
  axis,
  field,
  leads,
  activationIntensity,
  status,
}: VectorHudProps) {
  const quadrant = axisQuadrantLabel(axis.qrsDeg)
  const leadII = leads.leads.II
  const leadI = leads.leads.I
  const leadAVF = leads.leads.aVF

  const contribs = field.contributions.filter((c) => c.weight > 0.05)

  return (
    <div className="vector-hud" aria-live="polite">
      <div className="vector-hud-grid">
        <div className="vector-hud-card">
          <p className="vector-hud-label">Mean electrical axis</p>
          <p className="vector-hud-value">
            {formatDeg(axis.qrsDeg)}
            <span className="vector-hud-unit">°</span>
          </p>
          <p className="vector-hud-meta">{quadrant}</p>
        </div>
        <div className="vector-hud-card">
          <p className="vector-hud-label">Field direction</p>
          <p className="vector-hud-value vector-hud-value--sm">
            {formatDeg(axis.instantaneousDeg)}
            <span className="vector-hud-unit">°</span>
          </p>
          <p className="vector-hud-meta">
            |D| {axis.magnitude.toFixed(2)}
          </p>
        </div>
        <div className="vector-hud-card">
          <p className="vector-hud-label">Activation intensity</p>
          <div className="vector-intensity-bar" aria-hidden>
            <div
              className="vector-intensity-fill"
              style={{ width: `${Math.round(activationIntensity * 100)}%` }}
            />
          </div>
          <p className="vector-hud-meta">
            {(activationIntensity * 100).toFixed(0)}% wavefront
          </p>
        </div>
        <div className="vector-hud-card">
          <p className="vector-hud-label">Lead sample (vector→ECG)</p>
          <p className="vector-hud-meta vector-hud-leads">
            I {leadI.toFixed(2)} · II {leadII.toFixed(2)} · aVF{' '}
            {leadAVF.toFixed(2)} mV
          </p>
          <p className="vector-hud-meta">{status}</p>
        </div>
      </div>

      {contribs.length > 0 && (
        <ul className="vector-contrib-list">
          {contribs.map((c) => (
            <li key={`${c.kind}-${c.tag ?? ''}`}>
              <span className={`vector-dot vector-dot--${c.kind}`} />
              {prettyKind(c.kind)}
              <span className="vector-contrib-w">
                {(c.weight * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDeg(d: number): string {
  const rounded = Math.round(d)
  return rounded > 0 ? `+${rounded}` : `${rounded}`
}

function prettyKind(kind: string): string {
  return kind.replace(/_/g, ' ')
}
