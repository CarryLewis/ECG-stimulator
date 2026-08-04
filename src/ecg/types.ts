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

/**
 * Instantaneous activation of each conduction structure (0–1).
 * Used for 3D glow / teaching HUD — not millivolt synthesis.
 */
export interface ConductionState {
  sa: number
  atria: number
  av: number
  his: number
  bundle: number
  ventricle: number
  /** False when AV conduction is blocked (reserved for future block packs). */
  avConducts: boolean
  /** Teaching status line for the conduction timeline HUD. */
  status: string
  /** Ventricular repolarization envelope (T-wave teaching window). */
  repol: number
}
