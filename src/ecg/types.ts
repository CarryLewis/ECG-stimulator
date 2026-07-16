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

export type Territory =
  | 'anterior'
  | 'inferior'
  | 'lateral'
  | 'septal'
  | 'none'

export interface LeadConfig {
  name: LeadName
  /** P wave amplitude multiplier (may be negative to invert) */
  p: number
  /** R wave amplitude multiplier */
  r: number
  /** S wave amplitude multiplier */
  s: number
  /** T wave amplitude multiplier */
  t: number
  /** Anatomical territory used for ischemia / ST changes */
  territory: Territory
}

/** A single generated lead trace. */
export interface LeadTrace {
  name: LeadName
  /** Signal samples in millivolts. */
  samples: number[]
}

export interface EcgResult {
  leads: LeadTrace[]
  /** Sampling frequency (Hz). */
  fs: number
  /** Duration in seconds. */
  duration: number
  /** R-peak times (seconds) used for the rhythm strip. */
  ventricularBeats: number[]
  /** P-wave activation times (seconds). */
  atrialBeats: number[]
}

/** Parameters that shape the cardiac cycle, derived from a disease + user input. */
export interface CyclePlan {
  /** Ventricular rate (bpm). */
  ventricularRate: number
  /** Atrial rate (bpm) - relevant for AV dissociation. */
  atrialRate: number
  /** PR interval in seconds (P onset to QRS). */
  prInterval: number
  /** Multiplier applied to QRS wave widths (>1 widens the complex). */
  qrsWidthFactor: number
  /** Global P wave amplitude factor (0 = no P waves). */
  pAmpFactor: number
  /** Global T wave amplitude factor. */
  tAmpFactor: number
  /** Global T wave width factor (<1 = narrow/peaked). */
  tWidthFactor: number
  /** U wave amplitude in mV (0 = none). */
  uAmp: number
  /** Global ST-segment offset in mV (applied to every lead). */
  stGlobal: number
  /** ST-segment offset in mV keyed by territory (ischemia). */
  stByTerritory: Partial<Record<Territory, number>>
  /** RR interval is irregular (atrial fibrillation). */
  irregular: boolean
  /** Atria and ventricles beat independently (complete heart block). */
  dissociated: boolean
  /** Draw a chaotic fibrillatory baseline instead of P waves. */
  fibrillatoryBaseline: boolean
}
