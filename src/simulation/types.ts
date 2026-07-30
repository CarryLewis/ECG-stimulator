/**
 * Physiological ECG simulation — shared types.
 *
 * Body / cardiac electrical coordinates (ECG convention):
 *   +x = patient's left
 *   +y = inferior
 *   +z = anterior
 *
 * Frontal-plane Einthoven angles: 0° = +x (left), +90° = +y (inferior).
 */

export type LeadName =
  | 'I'
  | 'II'
  | 'III'
  | 'aVR'
  | 'aVL'
  | 'aVF'
  | 'V1'
  | 'V2'
  | 'V3'
  | 'V4'
  | 'V5'
  | 'V6'

export const LEAD_ORDER: readonly LeadName[] = [
  'I',
  'II',
  'III',
  'aVR',
  'aVL',
  'aVF',
  'V1',
  'V2',
  'V3',
  'V4',
  'V5',
  'V6',
] as const

/** Instantaneous equivalent cardiac dipole M(t). */
export interface CardiacVector {
  /** Left (+) / right (−) */
  x: number
  /** Inferior (+) / superior (−) */
  y: number
  /** Anterior (+) / posterior (−) */
  z: number
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export type TerritoryId =
  | 'anterior'
  | 'septal'
  | 'inferior'
  | 'lateral'
  | 'none'

export type HypertrophyKind = 'none' | 'lvh' | 'rvh'

export type InjuryLocation =
  | 'none'
  | 'anterior'
  | 'inferior'
  | 'lateral'
  | 'septal'

/**
 * User-tunable physiology parameters.
 * Changing these alters M(t) and therefore all 12 leads together.
 */
export interface SimulationParams {
  /** Heart rate (bpm). */
  heartRate_bpm: number
  /**
   * Global conduction velocity scale.
   * <1 slows atrial / His–Purkinje timing (wider PR / QRS).
   */
  conductionVelocity: number
  /**
   * Mean QRS axis in the frontal plane (degrees).
   * Normal ≈ +60° (toward Lead II).
   */
  cardiacAxis_deg: number
  /** PR interval scale (1 = ~160 ms at velocity 1). */
  prScale: number
  /** Ventricular activation / QRS width scale. */
  qrsScale: number
  /** Myocardial injury territory (STEMI-style ST shift). */
  injuryLocation: InjuryLocation
  /** Injury severity 0–1. */
  injurySeverity: number
  /** Chamber hypertrophy affecting QRS magnitude / direction. */
  hypertrophy: HypertrophyKind
  /** Hypertrophy strength 0–1. */
  hypertrophySeverity: number
  /** Sampling rate for generated strips (Hz). */
  sampleRate_Hz: number
  /** Strip duration in seconds. */
  duration_s: number
}

export const DEFAULT_SIM_PARAMS: SimulationParams = {
  heartRate_bpm: 72,
  conductionVelocity: 1,
  cardiacAxis_deg: 60,
  prScale: 1,
  qrsScale: 1,
  injuryLocation: 'none',
  injurySeverity: 0,
  hypertrophy: 'none',
  hypertrophySeverity: 0,
  sampleRate_Hz: 500,
  duration_s: 2.5,
}

/** Named contribution to the cardiac dipole (teaching / debug). */
export type VectorContributionKind =
  | 'atrial_depol'
  | 'septal_depol'
  | 'apical_depol'
  | 'basal_depol'
  | 'ventricular_repol'
  | 'injury_current'

export interface VectorContribution {
  kind: VectorContributionKind
  weight: number
  vector: CardiacVector
}

export interface InstantaneousField {
  t: number
  dipole: CardiacVector
  contributions: readonly VectorContribution[]
}

export interface LeadAxis {
  name: LeadName
  axis: Vec3
  territory: TerritoryId
}

export type LeadVoltages = Readonly<Record<LeadName, number>>

export interface EcgSample {
  t: number
  leads: LeadVoltages
}

export interface EcgStrip {
  fs: number
  t0: number
  duration_s: number
  leads: Readonly<Record<LeadName, Float32Array>>
  /** Absolute R-peak times within the strip. */
  ventricularBeats: number[]
  /** Absolute P-onset times. */
  atrialBeats: number[]
  /** Cycle length used for scheduling. */
  rr_s: number
  /** Measured intervals from the conduction plan (seconds). */
  intervals: {
    pr_s: number
    qrs_s: number
    qt_s: number
    rate_bpm: number
  }
}

export interface ValidationIssue {
  code: string
  severity: 'error' | 'warn'
  message: string
}

export interface EcgValidationResult {
  ok: boolean
  issues: ValidationIssue[]
  metrics: {
    leadII_qrsPolarity: number
    aVR_qrsPolarity: number
    leadI_qrsPolarity: number
    v1_qrsPolarity: number
    v6_qrsPolarity: number
    rProgression: number[]
    pr_ms: number
    qrs_ms: number
    qt_ms: number
    rate_bpm: number
  }
}
