/**
 * Event-driven heartbeat model.
 *
 * A heartbeat is a physiological event aggregate: one cardiac cycle's
 * schedule + realized activation markers + vectors + ECG products.
 *
 * Real-time animation subscribes to:
 * - discrete `PhysiologicalEvent` (glow SA → AV → ventricle)
 * - continuous `ElectrophysiologyFrame` / `EcgSample` streams
 *
 * Pathology may omit stages (e.g. no atrial activation in AF) or
 * dissociate atrial vs ventricular cycles (complete AV block).
 */

import type {
  DurationSeconds,
  EventId,
  HeartbeatId,
  Millivolts,
  RandomSeed,
  TimeSeconds,
  UnitInterval,
  Vec3,
} from './common'
import type { RegionId, TerritoryId } from './anatomy'
import type { ActivationMap, TissueState } from './activation'
import type { ConductionSystemState } from './conduction'
import type {
  CardiacDipole,
  InstantaneousElectricalField,
  LeadVoltages,
  VectorContribution,
} from './vector'
import type { EcgAnnotation, EcgSample } from './ecg'
import type { ClinicalSnapshot } from './clinical'

/** Which macroscopic stage of the cycle an event belongs to. */
export type CardiacCycleStage =
  | 'sa_activation'
  | 'atrial_activation'
  | 'av_delay'
  | 'his_purkinje'
  | 'ventricular_activation'
  | 'st_segment'
  | 'repolarization'
  | 'diastole'

/**
 * Discrete physiological events — primary animation / teaching triggers.
 * Emit in time order; consumers need not know disease ids.
 */
export type PhysiologicalEventType =
  | 'sa_node_activation'
  | 'atrial_activation'
  | 'av_node_activation'
  | 'av_conduction_blocked'
  | 'his_activation'
  | 'bundle_branch_activation'
  | 'ventricular_activation'
  | 'repolarization'
  | 'fibrillatory_wavelet'
  | 'escape_beat'
  | 'cycle_start'
  | 'cycle_end'

export interface PhysiologicalEventBase {
  id: EventId
  type: PhysiologicalEventType
  /** Absolute simulation time of the event onset. */
  t: TimeSeconds
  /** Optional duration for sustained stages (AV delay, ST window). */
  duration_s?: DurationSeconds
  heartbeatId?: HeartbeatId
  region?: RegionId
  stage?: CardiacCycleStage
  intensity?: UnitInterval
}

export interface SaNodeActivationEvent extends PhysiologicalEventBase {
  type: 'sa_node_activation'
  stage: 'sa_activation'
}

export interface AtrialActivationEvent extends PhysiologicalEventBase {
  type: 'atrial_activation'
  stage: 'atrial_activation'
  organized: boolean
}

export interface AvNodeActivationEvent extends PhysiologicalEventBase {
  type: 'av_node_activation'
  stage: 'av_delay'
  delay_s: DurationSeconds
}

export interface AvConductionBlockedEvent extends PhysiologicalEventBase {
  type: 'av_conduction_blocked'
  stage: 'av_delay'
}

export interface VentricularActivationEvent extends PhysiologicalEventBase {
  type: 'ventricular_activation'
  stage: 'ventricular_activation'
  origin: 'conducted' | 'escape' | 'irregular' | 'paced'
  qrsWidthScale: number
}

export interface RepolarizationEvent extends PhysiologicalEventBase {
  type: 'repolarization'
  stage: 'repolarization'
}

export type PhysiologicalEvent =
  | SaNodeActivationEvent
  | AtrialActivationEvent
  | AvNodeActivationEvent
  | AvConductionBlockedEvent
  | PhysiologicalEventBase
  | VentricularActivationEvent
  | RepolarizationEvent

/**
 * Planned timings for one ventricular (or dissociated atrial) cycle.
 * Used to schedule events before/while the continuous engines run.
 */
export interface HeartbeatSchedule {
  /** SA / atrial onset (absent in AF). */
  saActivation_s?: TimeSeconds
  atrialActivation_s?: TimeSeconds
  /** AV nodal dwell relative to atrial onset. */
  avDelay_s?: DurationSeconds
  avOnset_s?: TimeSeconds
  hisOnset_s?: TimeSeconds
  ventricularActivation_s: TimeSeconds
  /** Approximate QRS width used for animation envelopes. */
  qrsDuration_s: DurationSeconds
  stSegmentStart_s?: TimeSeconds
  stSegmentEnd_s?: TimeSeconds
  repolarizationPeak_s?: TimeSeconds
  cycleEnd_s: TimeSeconds
}

/**
 * Electrical vectors realized for this heartbeat (summary + peak samples).
 * Full continuous field remains in the vector stream; this is cycle-scoped.
 */
export interface HeartbeatElectricalVectors {
  /** Peak QRS dipole (main ventricular vector). */
  qrsPeak: CardiacDipole
  /** Peak T dipole. */
  tPeak?: CardiacDipole
  /** Peak P dipole when organised atrial activity exists. */
  pPeak?: CardiacDipole
  /** Injury-current contribution during ST (STEMI etc.). */
  injuryCurrent?: {
    territory: Exclude<TerritoryId, 'none'>
    vector: Vec3
    magnitude_mV: Millivolts
  }
  /** Debug / teaching breakdown at ventricular peak. */
  contributionsAtQrsPeak?: readonly VectorContribution[]
}

/**
 * ECG products attributable to this heartbeat (not the full rolling buffer).
 */
export interface HeartbeatEcgOutput {
  /** Representative sample at R-peak (all leads). */
  atRPeak?: EcgSample
  /** Lead voltages at ST midpoint when applicable. */
  atStMid?: LeadVoltages
  annotations: readonly EcgAnnotation[]
  /** Optional morphologic tags for this beat only. */
  morphologyNotes?: readonly string[]
}

/**
 * Heartbeat Event — one physiological cardiac cycle as a first-class object.
 *
 * Example shape (conceptual):
 * {
 *   time,
 *   SA node activation,
 *   atrial activation,
 *   AV delay,
 *   ventricular activation,
 *   repolarization,
 *   electrical vectors,
 *   ECG output
 * }
 */
export interface HeartbeatEvent {
  id: HeartbeatId
  /** Cycle index in the simulation (monotonic per stream). */
  sequence: number
  /** Absolute time of cycle start (usually SA or ventricular onset). */
  t: TimeSeconds
  /** Wall-clock-aligned schedule for this beat. */
  schedule: HeartbeatSchedule

  /** --- Physiological stage markers (may be null if skipped by pathology) --- */
  saNodeActivation: SaNodeActivationEvent | null
  atrialActivation: AtrialActivationEvent | null
  avDelay: AvNodeActivationEvent | AvConductionBlockedEvent | null
  ventricularActivation: VentricularActivationEvent
  repolarization: RepolarizationEvent | null

  /** Ordered discrete events belonging to this beat (for animation queues). */
  events: readonly PhysiologicalEvent[]

  /** Snapshot samples useful for scrubbing / tooltips (optional density). */
  activationAtVentricularPeak?: ActivationMap
  conductionAtVentricularPeak?: ConductionSystemState
  tissue?: TissueState

  electricalVectors: HeartbeatElectricalVectors
  ecgOutput: HeartbeatEcgOutput

  /**
   * True when this ventricular beat is not coupled to a P wave
   * (AF, complete block escape, etc.).
   */
  atrioventricularCoupled: boolean
}

/**
 * Event bus payload union for an event-driven runtime.
 * UI / engines subscribe without importing each other.
 */
export type SimulationBusMessage =
  | { kind: 'physiological_event'; event: PhysiologicalEvent }
  | { kind: 'heartbeat'; heartbeat: HeartbeatEvent }
  | { kind: 'ep_frame'; frame: import('./activation').ElectrophysiologyFrame }
  | { kind: 'field'; field: InstantaneousElectricalField }
  | { kind: 'ecg_sample'; sample: EcgSample }
  | { kind: 'clinical'; snapshot: ClinicalSnapshot }

/**
 * Clock + seeding shared across ECG and conduction animation.
 */
export interface SimulationClockState {
  t: TimeSeconds
  /** Wall-clock multiplier (e.g. 0.35 for learning pace). */
  timeScale: number
  paused: boolean
  afSeed: RandomSeed
}

/**
 * Contract for scheduling the next beat(s) — EP engine implements this.
 */
export interface HeartbeatScheduler {
  /** Peek / plan the beat that contains absolute time t. */
  heartbeatAt(t: TimeSeconds): HeartbeatEvent | null
  /** Enumerate discrete events in [t0, t1). */
  eventsInRange(t0: TimeSeconds, t1: TimeSeconds): readonly PhysiologicalEvent[]
}
