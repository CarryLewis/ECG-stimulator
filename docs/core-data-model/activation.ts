/**
 * Electrical activation state — who is depolarizing / recovering *now*.
 *
 * Produced by the Cardiac Electrophysiology Engine each tick.
 * Consumed by the Vector Engine and by real-time 3D animation.
 */

import type {
  DurationSeconds,
  TimeSeconds,
  UnitInterval,
} from './common'
import type { RegionId, TerritoryId } from './anatomy'
import type { AvBlockDegree } from './conduction'

export type ActivationPhase =
  | 'resting'
  | 'depolarizing'
  | 'plateau'
  | 'repolarizing'
  | 'refractory'

/**
 * Per-region instantaneous electrical activity.
 * Intensities are animation- and vector-friendly unit intervals.
 */
export interface RegionActivation {
  region: RegionId
  phase: ActivationPhase
  /** Depolarization wavefront strength [0,1]. */
  depol: UnitInterval
  /** Repolarization strength [0,1]. */
  repol: UnitInterval
  /** Absolute refractory / unavailable for re-excitation. */
  refractory: boolean
  /** False if this region is blocked or not participating. */
  conducts: boolean
}

/**
 * Full heart activation snapshot at time t.
 * Dense enough for glow animation; sparse enough for 60–120 Hz UI ticks.
 */
export interface ActivationMap {
  t: TimeSeconds
  regions: Readonly<Record<RegionId, RegionActivation>>
  /** Organised atrial wavefront present (false in AF). */
  atriaOrganized: boolean
  ventriclesDrivenBy: 'sa_av' | 'escape' | 'irregular' | 'paced' // paced reserved
  /** ST-segment window weight [0,1] for injury-current injection. */
  stWindow: UnitInterval
}

/**
 * Slowly varying tissue / membrane modifiers (pathology & electrolytes).
 * Applied by disease packs; read by EP + Vector engines.
 */
export interface TissueState {
  /** Regional ischemia severity [0,1]. */
  ischemia: Partial<Record<Exclude<TerritoryId, 'none'>, UnitInterval>>
  /** Extracellular potassium (mmol/L), if electrolyte scenario active. */
  potassium_mmol_L?: number
  /** Extracellular calcium / other ions — reserved for future packs. */
  calcium_mmol_L?: number
  sodium_mmol_L?: number
  /** Scales conduction velocity globally (hyperK slows, etc.). */
  conductionVelocityScale: number
  /** Scales APD / T-wave timing. */
  actionPotentialDurationScale: number
  /** Enables injury-current path in the vector engine. */
  injuryCurrentEnabled: boolean
  /** Optional AV block mirror for clinical snapshot convenience. */
  avBlock?: AvBlockDegree
}

/**
 * Continuous EP tick output (event-driven engine may also emit discrete events).
 */
export interface ElectrophysiologyFrame {
  t: TimeSeconds
  activation: ActivationMap
  tissue: TissueState
  /** Time since last ventricular activation onset (for RR display). */
  timeSinceVentricularOnset_s?: DurationSeconds
}
