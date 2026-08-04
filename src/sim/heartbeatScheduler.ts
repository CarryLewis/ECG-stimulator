import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import {
  cycleLength_s,
  DEFAULT_HEART_RATE_BPM,
  SINUS_OFFSET_S,
} from './sinusTiming'

function eid(beatId: string, type: string): string {
  return `${beatId}:${type}`
}

/**
 * Schedule one normal-sinus heartbeat as an ordered list of physiological events.
 * Animation / ECG consumers sample these events — they do not invent their own timeline.
 */
export function scheduleSinusHeartbeat(
  sequence: number,
  t0: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): HeartbeatCycle {
  const len = cycleLength_s(rateBpm)
  const id = `hb-${sequence}`
  const tEnd = t0 + len

  const mk = (
    type: PhysiologicalEvent['type'],
    offset_s: number,
    label: string,
    region?: PhysiologicalEvent['region'],
  ): PhysiologicalEvent => ({
    id: eid(id, type),
    type,
    t: t0 + offset_s,
    heartbeatId: id,
    region,
    label,
    offset_s,
  })

  const events: PhysiologicalEvent[] = [
    mk('cycle_start', 0, 'Cycle start'),
    mk('sa_node_activation', SINUS_OFFSET_S.sa, 'SA node activation', 'sa_node'),
    mk(
      'atrial_activation',
      SINUS_OFFSET_S.atrial,
      'Atrial depolarization',
      'atria',
    ),
    mk('av_node_activation', SINUS_OFFSET_S.av, 'AV delay', 'av_node'),
    mk('his_activation', SINUS_OFFSET_S.his, 'Bundle of His', 'his_bundle'),
    mk(
      'bundle_branch_activation',
      SINUS_OFFSET_S.bundle,
      'Bundle branches (RBB / LBB)',
      'bundle_branches',
    ),
    mk(
      'ventricular_activation',
      SINUS_OFFSET_S.purkinje,
      'Purkinje → ventricular myocardium',
      'purkinje',
    ),
    mk(
      'repolarization',
      SINUS_OFFSET_S.repolarization,
      'Ventricular repolarization',
      'ventricle',
    ),
    {
      id: eid(id, 'cycle_end'),
      type: 'cycle_end',
      t: tEnd,
      heartbeatId: id,
      label: 'Cycle end',
      offset_s: len,
    },
  ]

  return { id, sequence, t0, tEnd, rateBpm, events }
}

/**
 * Resolve which sinus cycle contains absolute time `t`, scheduling on demand.
 * Pure lookup — safe to call every animation frame.
 */
export function heartbeatAt(
  t: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): HeartbeatCycle {
  const len = cycleLength_s(rateBpm)
  const sequence = Math.max(0, Math.floor(t / len))
  const t0 = sequence * len
  return scheduleSinusHeartbeat(sequence, t0, rateBpm)
}
