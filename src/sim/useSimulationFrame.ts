import { useMemo } from 'react'
import type { CyclePlan, ConductionState } from '../ecg/types'
import { conductionAt } from '../ecg/conduction'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { heartbeatAt } from './heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from './sinusTiming'

export interface SimulationFrame {
  t: number
  beat: HeartbeatCycle
  state: ConductionState
  active: PhysiologicalEvent | null
  phaseMs: number
  plan: CyclePlan
}

/**
 * Derive the current EP frame from simulation time + CyclePlan.
 *
 * Heart glow and ECG share `conductionAt(plan, t)` so pathology changes
 * the 3D activation model and the 12-lead strip together.
 * Sinus event scheduling remains for the teaching timeline when organized.
 */
export function useSimulationFrame(
  elapsed: number,
  plan: CyclePlan,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): SimulationFrame {
  return useMemo(() => {
    const displayRate = plan.ventricularRate || rateBpm
    const beat = heartbeatAt(elapsed, displayRate)
    const state = conductionAt(plan, elapsed, {
      afSeed: plan.rhythmSeed || 23,
    })
    const phaseMs = Math.round((elapsed - beat.t0) * 1000)

    // Approximate active teaching event from conduction intensities.
    const active = pickActiveFromState(state, beat, elapsed)

    return { t: elapsed, beat, state, active, phaseMs, plan }
  }, [elapsed, plan, rateBpm])
}

function pickActiveFromState(
  state: ConductionState,
  beat: HeartbeatCycle,
  t: number,
): PhysiologicalEvent | null {
  const statusLabel = state.status.en
  if (state.ventricle > 0.35) {
    return (
      beat.events.find((e) => e.type === 'ventricular_activation') ?? {
        id: 'vf-vent',
        type: 'ventricular_activation',
        t,
        heartbeatId: beat.id,
        region: 'ventricle',
        label: statusLabel,
        offset_s: t - beat.t0,
      }
    )
  }
  if (state.atria > 0.35) {
    return (
      beat.events.find((e) => e.type === 'atrial_activation') ?? {
        id: 'af-atr',
        type: 'atrial_activation',
        t,
        heartbeatId: beat.id,
        region: 'atria',
        label: statusLabel,
        offset_s: t - beat.t0,
      }
    )
  }
  if (state.sa > 0.35) {
    return beat.events.find((e) => e.type === 'sa_node_activation') ?? null
  }
  if (state.av > 0.25) {
    return beat.events.find((e) => e.type === 'av_node_activation') ?? null
  }
  if (state.repol > 0.25) {
    return beat.events.find((e) => e.type === 'repolarization') ?? null
  }
  return null
}
