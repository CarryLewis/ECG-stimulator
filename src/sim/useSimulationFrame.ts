import { useMemo } from 'react'
import type { ConductionState } from '../ecg/types'
import { conductionStateFromEvents, activeEvent } from './conductionFromEvents'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { heartbeatAt } from './heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from './sinusTiming'

export interface SimulationFrame {
  t: number
  beat: HeartbeatCycle
  state: ConductionState
  active: PhysiologicalEvent | null
  phaseMs: number
}

/**
 * Derive the current EP frame from simulation time.
 * Views consume `state` / `active` — they never advance their own timers.
 */
export function useSimulationFrame(
  elapsed: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): SimulationFrame {
  return useMemo(() => {
    const beat = heartbeatAt(elapsed, rateBpm)
    const state = conductionStateFromEvents(elapsed, beat)
    const active = activeEvent(elapsed, beat)
    const phaseMs = Math.round((elapsed - beat.t0) * 1000)
    return { t: elapsed, beat, state, active, phaseMs }
  }, [elapsed, rateBpm])
}
