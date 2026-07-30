import type { PhysiologicalEvent } from '../../sim/events'
import { SINUS_OFFSET_S } from '../../sim/sinusTiming'

const PATHWAY: {
  key: string
  offsetMs: number
  label: string
  match: PhysiologicalEvent['type']
  ecg?: string
}[] = [
  {
    key: 'sa',
    offsetMs: SINUS_OFFSET_S.sa * 1000,
    label: 'SA node',
    match: 'sa_node_activation',
  },
  {
    key: 'atrial',
    offsetMs: SINUS_OFFSET_S.atrial * 1000,
    label: 'Atrial activation',
    match: 'atrial_activation',
    ecg: 'P',
  },
  {
    key: 'av',
    offsetMs: SINUS_OFFSET_S.av * 1000,
    label: 'AV delay',
    match: 'av_node_activation',
  },
  {
    key: 'his',
    offsetMs: SINUS_OFFSET_S.his * 1000,
    label: 'His bundle',
    match: 'his_activation',
    ecg: 'QRS',
  },
  {
    key: 'bundle',
    offsetMs: SINUS_OFFSET_S.bundle * 1000,
    label: 'Bundle branches',
    match: 'bundle_branch_activation',
    ecg: 'QRS',
  },
  {
    key: 'purkinje',
    offsetMs: SINUS_OFFSET_S.purkinje * 1000,
    label: 'Ventricular myocardium',
    match: 'ventricular_activation',
    ecg: 'QRS',
  },
  {
    key: 'repol',
    offsetMs: SINUS_OFFSET_S.repolarization * 1000,
    label: 'Repolarization',
    match: 'repolarization',
    ecg: 'T',
  },
]

interface TimelinePanelProps {
  phaseMs: number
  active: PhysiologicalEvent | null
  status: string
  timeScale: number
  onTimeScaleChange: (scale: number) => void
  rateBpm: number
  onRateChange: (bpm: number) => void
}

const SPEED_PRESETS = [
  { label: '0.2×', value: 0.2 },
  { label: '0.35×', value: 0.35 },
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
]

/**
 * Timeline controller — conduction cascade + playback, driven by sim frame.
 */
export default function TimelinePanel({
  phaseMs,
  active,
  status,
  timeScale,
  onTimeScaleChange,
  rateBpm,
  onRateChange,
}: TimelinePanelProps) {
  return (
    <section className="lab-panel" aria-label="Timeline controller">
      <header className="lab-panel-head">
        <div>
          <h2 className="lab-panel-title">Timeline</h2>
          <p className="lab-panel-sub">
            Phase {phaseMs} ms · physiological event clock
          </p>
        </div>
      </header>

      <ol className="lab-timeline">
        {PATHWAY.map((step) => {
          const live = active?.type === step.match
          const passed = phaseMs >= step.offsetMs - 5
          return (
            <li
              key={step.key}
              className={
                'lab-timeline-step' +
                (live ? ' lab-timeline-step--live' : '') +
                (passed && !live ? ' lab-timeline-step--passed' : '')
              }
            >
              <span className="lab-timeline-ms">{step.offsetMs}</span>
              <span className="lab-timeline-label">{step.label}</span>
              {step.ecg && (
                <span className="lab-timeline-ecg">{step.ecg}</span>
              )}
            </li>
          )
        })}
      </ol>

      <p className="lab-timeline-status">{status}</p>

      <div className="lab-playback">
        <label className="lab-field">
          <span className="lab-field-row">
            <span>Time scale</span>
            <span className="lab-field-value">×{timeScale.toFixed(2)}</span>
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
        <div className="lab-presets" role="group" aria-label="Pace presets">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={
                'lab-preset' +
                (Math.abs(timeScale - p.value) < 0.01
                  ? ' lab-preset--active'
                  : '')
              }
              onClick={() => onTimeScaleChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="lab-field">
          <span className="lab-field-row">
            <span>Heart rate</span>
            <span className="lab-field-value">{rateBpm} bpm</span>
          </span>
          <input
            type="range"
            min={40}
            max={140}
            step={1}
            value={rateBpm}
            onChange={(e) => onRateChange(Number(e.target.value))}
          />
        </label>
      </div>
    </section>
  )
}
