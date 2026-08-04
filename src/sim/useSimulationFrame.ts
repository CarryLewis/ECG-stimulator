import { useMemo } from 'react'
import type { ConductionState, CyclePlan, LeadName } from '../ecg/types'
import { conductionAt } from '../ecg/conduction'
import {
  generateEcgFromSimulation,
  type EcgPhaseInfo,
  type EcgSample,
} from '../ecg-generator'
import { vectorInputFromConduction } from '../ep'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { heartbeatAt } from './heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from './sinusTiming'
import {
  analyzeElectricalVectors,
  type BodySurfacePotentials,
  type InstantaneousElectricalField,
  type LeadVoltages,
  type MeanElectricalAxis,
  type TissueModifiers,
  type VectorAnalysis,
} from '../vector-engine'
import { ecgPhaseFromActivation } from '../ecg-generator/phases'

export interface SimulationFrame {
  t: number
  beat: HeartbeatCycle
  state: ConductionState
  active: PhysiologicalEvent | null
  phaseMs: number
  plan: CyclePlan | null
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

function tissueFromPlan(plan: CyclePlan): Partial<TissueModifiers> {
  const ischemia: NonNullable<TissueModifiers['ischemia']> = {}
  for (const [terr, mv] of Object.entries(plan.stByTerritory)) {
    if (terr === 'none' || mv == null) continue
    ischemia[terr as keyof typeof ischemia] = Math.min(1, Math.abs(mv) / 0.45)
  }
  return {
    ischemia,
    injuryCurrentEnabled: Object.keys(plan.stByTerritory).length > 0,
    repolarizationAmpScale: plan.tAmpFactor,
    stGlobal_mV: plan.stGlobal,
    uAmp_mV: plan.uAmp,
    fibrillatoryBaseline: plan.fibrillatoryBaseline,
  }
}

/**
 * Derive EP → Vector → Body surface → Leads → ECG from simulation time.
 *
 * When a disease `CyclePlan` is supplied, 3D glow comes from `conductionAt`
 * (pathology-aware) and vector analysis runs on that same activation state.
 * Views consume streams — they never invent waveforms.
 */
export function useSimulationFrame(
  elapsed: number,
  plan: CyclePlan | null = null,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): SimulationFrame {
  return useMemo(() => {
    if (!plan) {
      const frame = generateEcgFromSimulation(elapsed, rateBpm)
      const phaseMs = Math.round((elapsed - frame.beat.t0) * 1000)
      return {
        t: elapsed,
        beat: frame.beat,
        state: frame.activation,
        active: frame.activeEvent,
        phaseMs,
        plan: null,
        field: frame.field,
        surface: frame.surface,
        leads: frame.leads,
        axis: frame.axis,
        activationIntensity: frame.activationIntensity,
        vector: frame.vector,
        ecg: frame.sample,
        ecgPhase: frame.phase,
      }
    }

    const displayRate = plan.ventricularRate || rateBpm
    const beat = heartbeatAt(elapsed, displayRate)
    const state = conductionAt(plan, elapsed, {
      afSeed: plan.rhythmSeed || 23,
    })
    const phaseMs = Math.round((elapsed - beat.t0) * 1000)
    const active = pickActiveFromState(state, beat, elapsed)

    const vector = analyzeElectricalVectors(
      vectorInputFromConduction(elapsed, state, tissueFromPlan(plan)),
    )

    return {
      t: elapsed,
      beat,
      state,
      active,
      phaseMs,
      plan,
      field: vector.field,
      surface: vector.surface,
      leads: vector.leads,
      axis: vector.axis,
      activationIntensity: vector.activationIntensity,
      vector,
      ecg: {
        t: elapsed,
        leads: vector.leads.leads,
      },
      ecgPhase: ecgPhaseFromActivation(state),
    }
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

export type { LeadName }
