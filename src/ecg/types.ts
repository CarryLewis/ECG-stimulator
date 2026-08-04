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
  | 'posterior'
  | 'none'

/** Cardiac electrical vector in body coordinates (mV·scale). */
export interface CardiacVector {
  /** Left (+) / right (−) */
  x: number
  /** Inferior (+) / superior (−) */
  y: number
  /** Anterior (+) / posterior (−) */
  z: number
}

/** Unit projection axis for a surface lead. */
export interface LeadAxis {
  name: LeadName
  x: number
  y: number
  z: number
  territory: Territory
}

/** Instantaneous activation of each conduction structure (0–1). */
export interface ConductionState {
  sa: number
  atria: number
  av: number
  his: number
  bundle: number
  ventricle: number
  /** False when AV conduction is blocked or absent (AF / complete block). */
  avConducts: boolean
  status: string
  /** Wavefront intensities that feed the cardiac dipole. */
  atrialDepol: number
  septalDepol: number
  apicalDepol: number
  basalDepol: number
  repol: number
  /** Window used to inject injury current onto the ST segment. */
  stWindow: number
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
  /** Absolute time of the first sample (seconds). */
  t0: number
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
  /** Continuous atrial flutter (sawtooth) waves instead of discrete P. */
  flutterBaseline: boolean
  /** Chaotic ventricular fibrillation — no organized QRS. */
  ventricularFibrillation: boolean
  /** Rapid regular sine-wave ventricular flutter. */
  ventricularFlutter: boolean
  /** Amplitude scale for VF / ventricular-flutter wave energy (0–1). */
  chaosAmplitude: number
  /** Deterministic seed forwarded from the physiological model. */
  rhythmSeed: number
}
