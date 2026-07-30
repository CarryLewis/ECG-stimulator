import { useMemo } from 'react'
import type { ConductionState, LeadName } from '../ecg/types'
import { vectorInputFromConduction } from '../ep'
import { conductionStateFromEvents, activeEvent } from './conductionFromEvents'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { heartbeatAt } from './heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from './sinusTiming'
import {
  analyzeElectricalVectors,
  type InstantaneousElectricalField,
  type LeadVoltages,
  type MeanElectricalAxis,
  type VectorAnalysis,
} from '../vector-engine'
import { sampleFromVoltages, type EcgSample } from '../ecg-generator'

export interface SimulationFrame {
  t: number
  beat: HeartbeatCycle
  state: ConductionState
  active: PhysiologicalEvent | null
  phaseMs: number
  /** Electrical Vector Engine output. */
  field: InstantaneousElectricalField
  leads: LeadVoltages
  axis: MeanElectricalAxis
  activationIntensity: number
  vector: VectorAnalysis
  /** ECG Generator sample (from vector lead voltages — not hardcoded). */
  ecg: EcgSample
}

/**
 * Derive the current EP → Vector → ECG frame from simulation time.
 * Views consume streams — they never advance their own timers.
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

    const vector = analyzeElectricalVectors(
      vectorInputFromConduction(elapsed, state),
    )
    const ecg = sampleFromVoltages(vector.leads)

    return {
      t: elapsed,
      beat,
      state,
      active,
      phaseMs,
      field: vector.field,
      leads: vector.leads,
      axis: vector.axis,
      activationIntensity: vector.activationIntensity,
      vector,
      ecg,
    }
  }, [elapsed, rateBpm])
}

export type { LeadName }
