import { useMemo } from 'react'
import type { ConductionState, LeadName } from '../ecg/types'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { DEFAULT_HEART_RATE_BPM } from './sinusTiming'
import {
  generateEcgFromSimulation,
  type EcgPhaseInfo,
  type EcgSample,
} from '../ecg-generator'
import type {
  BodySurfacePotentials,
  InstantaneousElectricalField,
  LeadVoltages,
  MeanElectricalAxis,
  VectorAnalysis,
} from '../vector-engine'

export interface SimulationFrame {
  t: number
  beat: HeartbeatCycle
  state: ConductionState
  active: PhysiologicalEvent | null
  phaseMs: number
  /** Electrical Vector Engine output. */
  field: InstantaneousElectricalField
  /** Body-surface electrode potentials. */
  surface: BodySurfacePotentials
  leads: LeadVoltages
  axis: MeanElectricalAxis
  activationIntensity: number
  vector: VectorAnalysis
  /** ECG waveform sample from the physiological pipeline. */
  ecg: EcgSample
  /** P / QRS / T phase synchronized to cardiac activation. */
  ecgPhase: EcgPhaseInfo
}

/**
 * Derive EP → Vector → Body surface → Leads → ECG from simulation time.
 * Views consume streams — they never invent waveforms.
 */
export function useSimulationFrame(
  elapsed: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): SimulationFrame {
  return useMemo(() => {
    const frame = generateEcgFromSimulation(elapsed, rateBpm)
    const phaseMs = Math.round((elapsed - frame.beat.t0) * 1000)

    return {
      t: elapsed,
      beat: frame.beat,
      state: frame.activation,
      active: frame.activeEvent,
      phaseMs,
      field: frame.field,
      surface: frame.surface,
      leads: frame.leads,
      axis: frame.axis,
      activationIntensity: frame.activationIntensity,
      vector: frame.vector,
      ecg: frame.sample,
      ecgPhase: frame.phase,
    }
  }, [elapsed, rateBpm])
}

export type { LeadName }
