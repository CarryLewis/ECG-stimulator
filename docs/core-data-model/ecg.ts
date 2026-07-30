/**
 * ECG signal generation — sampling, buffers, annotations.
 *
 * Presentation-agnostic: cascade monitor and paper strip are UI adapters.
 */

import type {
  BeatsPerMinute,
  Millivolts,
  RandomSeed,
  TimeSeconds,
} from './common'
import type { LeadName } from './vector'

export type { LeadName }

/** Sampling configuration for live or batch generation. */
export interface EcgSamplingConfig {
  /** Samples per second (typical teaching: 250–500). */
  fs: number
  /** Optional additive noise amplitude (mV peak). */
  noiseAmplitude_mV?: Millivolts
  /** Seed for stochastic noise / AF-related display jitter if any. */
  seed?: RandomSeed
}

/** One simultaneous 12-lead sample. */
export interface EcgSample {
  t: TimeSeconds
  leads: Readonly<Record<LeadName, Millivolts>>
}

/** Fixed layout order for monitors and strips. */
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

/** Classic 3×4 print grid (columns × rows of lead names). */
export type EcgLeadGrid = readonly (readonly LeadName[])[]

export const LEAD_PRINT_GRID: EcgLeadGrid = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]

/**
 * Ring buffer for real-time cascade sweep (one lead).
 * `writeIndex` is the next write slot; UI maps index → x column.
 */
export interface EcgLeadRingBuffer {
  lead: LeadName
  samples: Float32Array
  writeIndex: number
  /** Total samples ever written (caps first sweep). */
  written: number
  capacity: number
}

export interface EcgStream {
  fs: number
  tEnd: TimeSeconds
  leads: Readonly<Record<LeadName, EcgLeadRingBuffer>>
  /** Instantaneous / measured ventricular rate from annotations when available. */
  measuredHR_bpm?: BeatsPerMinute
}

/** Fiducial / beat markers derived from the EP schedule or signal. */
export type EcgAnnotationKind =
  | 'p_onset'
  | 'p_peak'
  | 'qrs_onset'
  | 'r_peak'
  | 'qrs_end'
  | 't_peak'
  | 't_end'
  | 'u_peak'

export interface EcgAnnotation {
  t: TimeSeconds
  kind: EcgAnnotationKind
  lead?: LeadName
  heartbeatId?: string
}

export interface EcgAnnotationTrack {
  annotations: readonly EcgAnnotation[]
}

/**
 * Batch / offline strip (tests, export, paper mode).
 */
export interface EcgStrip {
  fs: number
  t0: TimeSeconds
  duration_s: number
  leads: Readonly<Record<LeadName, Float32Array>>
  annotations: EcgAnnotationTrack
  ventricularOnsets_s: readonly TimeSeconds[]
  atrialOnsets_s: readonly TimeSeconds[]
}

/**
 * Generator output at one simulation sample step.
 * Ties vector projection to the ECG product line.
 */
export interface EcgGeneratorFrame {
  sample: EcgSample
  annotationsDelta: readonly EcgAnnotation[]
}
