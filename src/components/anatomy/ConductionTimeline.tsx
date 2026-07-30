import type { PhysiologicalEvent } from '../../sim/events'
import { SINUS_OFFSET_S } from '../../sim/sinusTiming'

const PATHWAY: {
  key: string
  offsetMs: number
  label: string
  match: PhysiologicalEvent['type']
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
    label: 'Atrial conduction',
    match: 'atrial_activation',
  },
  {
    key: 'av',
    offsetMs: SINUS_OFFSET_S.av * 1000,
    label: 'AV node (delay)',
    match: 'av_node_activation',
  },
  {
    key: 'his',
    offsetMs: SINUS_OFFSET_S.his * 1000,
    label: 'Bundle of His',
    match: 'his_activation',
  },
  {
    key: 'bundle',
    offsetMs: SINUS_OFFSET_S.bundle * 1000,
    label: 'RBB / LBB',
    match: 'bundle_branch_activation',
  },
  {
    key: 'purkinje',
    offsetMs: SINUS_OFFSET_S.purkinje * 1000,
    label: 'Purkinje fibers',
    match: 'ventricular_activation',
  },
  {
    key: 'repol',
    offsetMs: SINUS_OFFSET_S.repolarization * 1000,
    label: 'Repolarization',
    match: 'repolarization',
  },
]

interface ConductionTimelineProps {
  phaseMs: number
  active: PhysiologicalEvent | null
  status: string
  elapsed: number
  timeScale: number
  rateBpm: number
}

/**
 * Teaching HUD — lights each pathway step from the active physiological event.
 * Does not run its own clock; phase comes from the simulation frame.
 */
export default function ConductionTimeline({
  phaseMs,
  active,
  status,
  elapsed,
  timeScale,
  rateBpm,
}: ConductionTimelineProps) {
  return (
    <div className="conduction-timeline" aria-live="polite">
      <div className="conduction-timeline-head">
        <strong>Conduction cascade</strong>
        <span className="conduction-timeline-meta">
          t = {elapsed.toFixed(2)} s · ×{timeScale.toFixed(2)} · {rateBpm} bpm ·
          phase {phaseMs} ms
        </span>
      </div>
      <ol className="conduction-pathway">
        {PATHWAY.map((step, i) => {
          const live = active?.type === step.match
          const passed = phaseMs >= step.offsetMs - 5
          return (
            <li
              key={step.key}
              className={
                'conduction-pathway-step' +
                (live ? ' conduction-pathway-step--live' : '') +
                (passed && !live ? ' conduction-pathway-step--passed' : '')
              }
            >
              {i > 0 && <span className="conduction-pathway-arrow" aria-hidden />}
              <span className="conduction-pathway-ms">{step.offsetMs} ms</span>
              <span className="conduction-pathway-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
      <p className="conduction-timeline-status">{status}</p>
    </div>
  )
}
