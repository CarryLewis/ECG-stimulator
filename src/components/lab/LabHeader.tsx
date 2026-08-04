import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'

interface LabHeaderProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  rateBpm: number
  elapsed: number
  timeScale: number
  phaseLabel: string
}

export default function LabHeader({
  heartVersion,
  onHeartVersionChange,
  rateBpm,
  elapsed,
  timeScale,
  phaseLabel,
}: LabHeaderProps) {
  return (
    <header className="lab-header">
      <div className="lab-brand">
        <span className="lab-brand-mark" aria-hidden />
        <div>
          <p className="lab-brand-kicker">Electrophysiology laboratory</p>
          <h1 className="lab-brand-title">Cardiac EP Simulator</h1>
        </div>
      </div>

      <nav
        className="lab-view-nav"
        role="group"
        aria-label="Heart visualization mode"
      >
        {HEART_VERSIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={
              'lab-view-btn' +
              (heartVersion === v.id ? ' lab-view-btn--active' : '')
            }
            title={v.hint}
            onClick={() => onHeartVersionChange(v.id)}
          >
            {v.title}
          </button>
        ))}
      </nav>

      <dl className="lab-vitals" aria-label="Simulation vitals">
        <div>
          <dt>HR</dt>
          <dd>{rateBpm} bpm</dd>
        </div>
        <div>
          <dt>Pace</dt>
          <dd>×{timeScale.toFixed(2)}</dd>
        </div>
        <div>
          <dt>t</dt>
          <dd>{elapsed.toFixed(1)} s</dd>
        </div>
        <div className="lab-vitals-phase">
          <dt>Phase</dt>
          <dd>{phaseLabel}</dd>
        </div>
      </dl>
    </header>
  )
}
