import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import {
  cycleLength_s,
  DEFAULT_HEART_RATE_BPM,
} from './sinusTiming'
import {
  buildConductionPlan,
  type ConductionPlan,
} from '../simulation/conductionSystem'
import type { SimulationParams } from '../simulation/types'
import { DEFAULT_SIM_PARAMS } from '../simulation/types'

function eid(beatId: string, type: string): string {
  return `${beatId}:${type}`
}

function planFromRate(
  rateBpm: number,
  params?: Partial<SimulationParams>,
): ConductionPlan {
  return buildConductionPlan({
    ...DEFAULT_SIM_PARAMS,
    ...params,
    heartRate_bpm: rateBpm,
  })
}

/**
 * Schedule one heartbeat as ordered physiological events.
 * Timings come from the physiological conduction plan (same source as ECG).
 */
export function scheduleSinusHeartbeat(
  sequence: number,
  t0: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
  params?: Partial<SimulationParams>,
): HeartbeatCycle {
  const plan = planFromRate(rateBpm, params)
  const len = plan.rr_s
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

  const his = plan.stages.find((s) => s.id === 'his')
  const bundle = plan.stages.find((s) => s.id === 'bundle')
  const purkinje = plan.stages.find((s) => s.id === 'purkinje')
  const vent = plan.stages.find((s) => s.id === 'ventricular')

  const events: PhysiologicalEvent[] = [
    mk('cycle_start', 0, 'Cycle start'),
    mk('sa_node_activation', 0, 'SA node activation', 'sa_node'),
    mk(
      'atrial_activation',
      plan.pOnset_s,
      'Atrial depolarization',
      'atria',
    ),
    mk(
      'av_node_activation',
      plan.stages.find((s) => s.id === 'av')?.onset_s ?? plan.pOnset_s + 0.08,
      'AV delay',
      'av_node',
    ),
    mk(
      'his_activation',
      his?.onset_s ?? plan.qrsOnset_s,
      'Bundle of His',
      'his_bundle',
    ),
    mk(
      'bundle_branch_activation',
      bundle?.onset_s ?? plan.qrsOnset_s + 0.01,
      'Bundle branches (RBB / LBB)',
      'bundle_branches',
    ),
    mk(
      'ventricular_activation',
      purkinje?.onset_s ?? vent?.onset_s ?? plan.rPeak_s,
      'Purkinje → ventricular myocardium',
      'purkinje',
    ),
    mk(
      'repolarization',
      plan.tPeak_s,
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
  params?: Partial<SimulationParams>,
): HeartbeatCycle {
  const len = cycleLength_s(rateBpm)
  const sequence = Math.max(0, Math.floor(t / len))
  const t0 = sequence * len
  return scheduleSinusHeartbeat(sequence, t0, rateBpm, params)
}

/** Events whose onset is in [t0, t1). */
export function eventsInRange(
  t0: number,
  t1: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
  params?: Partial<SimulationParams>,
): PhysiologicalEvent[] {
  const out: PhysiologicalEvent[] = []
  const len = cycleLength_s(rateBpm)
  const startSeq = Math.max(0, Math.floor(t0 / len) - 1)
  const endSeq = Math.floor(t1 / len) + 1
  for (let s = startSeq; s <= endSeq; s++) {
    const beat = scheduleSinusHeartbeat(s, s * len, rateBpm, params)
    for (const ev of beat.events) {
      if (ev.t >= t0 && ev.t < t1) out.push(ev)
    }
  }
  return out
}
