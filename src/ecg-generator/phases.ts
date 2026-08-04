import type { ConductionState } from '../ecg/types'
import type { PhysiologicalEvent } from '../sim/events'
import type { HeartbeatCycle } from '../sim/events'

/**
 * ECG waveform phase locked to physiological activation.
 *
 *   P wave  ← atrial activation
 *   QRS     ← ventricular depolarization (His / bundle / ventricle)
 *   T wave  ← repolarization
 */
export type EcgWavePhase =
  | 'isoelectric'
  | 'p_wave'
  | 'qrs'
  | 'st_segment'
  | 't_wave'

export interface EcgPhaseInfo {
  phase: EcgWavePhase
  /** Teaching label for HUD / monitor badge. */
  label: string
  /** Physiological driver of this ECG segment. */
  drivenBy:
    | 'none'
    | 'atrial_activation'
    | 'ventricular_depolarization'
    | 'repolarization'
    | 'st_window'
}

/**
 * Derive the instantaneous ECG phase from cardiac activation intensities.
 * Same envelopes that feed the electrical vector — keeps monitor and glow synced.
 */
export function ecgPhaseFromActivation(state: ConductionState): EcgPhaseInfo {
  const qrs = Math.max(state.septalDepol, state.apicalDepol, state.basalDepol)
  if (qrs > 0.12) {
    return {
      phase: 'qrs',
      label: 'QRS — ventricular depolarization',
      drivenBy: 'ventricular_depolarization',
    }
  }
  if (state.repol > 0.1) {
    return {
      phase: 't_wave',
      label: 'T wave — repolarization',
      drivenBy: 'repolarization',
    }
  }
  if (state.atrialDepol > 0.1) {
    return {
      phase: 'p_wave',
      label: 'P wave — atrial activation',
      drivenBy: 'atrial_activation',
    }
  }
  if (state.stWindow > 0.35) {
    return {
      phase: 'st_segment',
      label: 'ST segment',
      drivenBy: 'st_window',
    }
  }
  return {
    phase: 'isoelectric',
    label: 'Isoelectric / diastole',
    drivenBy: 'none',
  }
}

/** Map a discrete physiological event to the ECG wave it produces. */
export function ecgWaveForEvent(
  event: PhysiologicalEvent | null,
): EcgWavePhase | null {
  if (!event) return null
  switch (event.type) {
    case 'atrial_activation':
      return 'p_wave'
    case 'his_activation':
    case 'bundle_branch_activation':
    case 'ventricular_activation':
      return 'qrs'
    case 'repolarization':
      return 't_wave'
    default:
      return null
  }
}

/** Fiducial times within the current beat (absolute seconds). */
export function beatFiducials(beat: HeartbeatCycle): {
  pPeak_s: number | null
  qrsPeak_s: number | null
  tPeak_s: number | null
} {
  const find = (type: PhysiologicalEvent['type']) =>
    beat.events.find((e) => e.type === type)?.t ?? null

  return {
    pPeak_s: find('atrial_activation'),
    qrsPeak_s: find('ventricular_activation') ?? find('his_activation'),
    tPeak_s: find('repolarization'),
  }
}
