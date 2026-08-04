/**
 * Cardiac simulation → ECG waveform pipeline.
 *
 *   Cardiac activation
 *        ↓
 *   Electrical vector
 *        ↓
 *   Body surface potential
 *        ↓
 *   Lead calculation
 *        ↓
 *   ECG waveform
 *
 * Waveforms are never hardcoded — P/QRS/T emerge from physiological events.
 */

import type { ConductionState } from '../ecg/types'
import { vectorInputFromConduction } from '../ep'
import {
  analyzeElectricalVectors,
  type BodySurfacePotentials,
  type InstantaneousElectricalField,
  type LeadVoltages,
  type MeanElectricalAxis,
  type TissueModifiers,
  type VectorAnalysis,
} from '../vector-engine'
import { conductionStateFromEvents, activeEvent } from '../sim/conductionFromEvents'
import type { HeartbeatCycle, PhysiologicalEvent } from '../sim/events'
import { heartbeatAt } from '../sim/heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from '../sim/sinusTiming'
import {
  beatFiducials,
  ecgPhaseFromActivation,
  ecgWaveForEvent,
  type EcgPhaseInfo,
  type EcgWavePhase,
} from './phases'
import { sampleFromVoltages, type EcgSample } from './sample'

export interface CardiacEcgPipelineFrame {
  t: number
  beat: HeartbeatCycle
  /** Cardiac activation (EP engine). */
  activation: ConductionState
  activeEvent: PhysiologicalEvent | null
  /** Electrical vector field. */
  field: InstantaneousElectricalField
  /** Body-surface electrode potentials. */
  surface: BodySurfacePotentials
  /** Calculated 12-lead voltages. */
  leads: LeadVoltages
  axis: MeanElectricalAxis
  activationIntensity: number
  vector: VectorAnalysis
  /** Sampled ECG waveform point (all leads). */
  sample: EcgSample
  /** P / QRS / T phase locked to activation. */
  phase: EcgPhaseInfo
  /** Wave implied by the active physiological event (if any). */
  eventWave: EcgWavePhase | null
  fiducials: {
    pPeak_s: number | null
    qrsPeak_s: number | null
    tPeak_s: number | null
  }
}

/**
 * Run one simulation tick through the full ECG generation pipeline.
 */
export function generateEcgFromSimulation(
  t: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
  tissue?: Partial<TissueModifiers>,
): CardiacEcgPipelineFrame {
  const beat = heartbeatAt(t, rateBpm)
  const activation = conductionStateFromEvents(t, beat)
  const active = activeEvent(t, beat)

  const vector = analyzeElectricalVectors(
    vectorInputFromConduction(t, activation, tissue),
  )
  const sample = sampleFromVoltages(vector.leads)
  const phase = ecgPhaseFromActivation(activation)

  return {
    t,
    beat,
    activation,
    activeEvent: active,
    field: vector.field,
    surface: vector.surface,
    leads: vector.leads,
    axis: vector.axis,
    activationIntensity: vector.activationIntensity,
    vector,
    sample,
    phase,
    eventWave: ecgWaveForEvent(active),
    fiducials: beatFiducials(beat),
  }
}

export type { EcgPhaseInfo, EcgWavePhase }
