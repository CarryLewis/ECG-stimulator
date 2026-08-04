/**
 * Runtime types for the Electrical Vector Engine.
 * Aligned with docs/core-data-model/vector.ts + activation.ts.
 */

import type { CardiacVector, LeadName, Territory } from '../ecg/types'

export type { CardiacVector, LeadName, Territory }

export type Vec3 = CardiacVector

export type VectorContributionKind =
  | 'atrial_depol'
  | 'septal_depol'
  | 'apical_depol'
  | 'basal_depol'
  | 'ventricular_repol'
  | 'u_wave'
  | 'injury_current'
  | 'fibrillatory'
  | 'global_st'
  | 'custom'

export interface VectorContribution {
  kind: VectorContributionKind
  tag?: string
  /** Wavefront / contribution weight [0,1] (activation intensity). */
  weight: number
  vector: CardiacVector
}

export interface InstantaneousElectricalField {
  t: number
  dipole: CardiacVector
  contributions: readonly VectorContribution[]
}

export type LeadVoltages = {
  t: number
  leads: Readonly<Record<LeadName, number>>
}

/** Aggregated myocardial wavefront intensities from the EP engine. */
export interface MyocardialWavefronts {
  atrialDepol: number
  septalDepol: number
  apicalDepol: number
  basalDepol: number
  repol: number
  stWindow: number
  /** Organised atrial activity (false in AF). */
  atriaOrganized: boolean
}

export interface TissueModifiers {
  ischemia: Partial<Record<Exclude<Territory, 'none'>, number>>
  injuryCurrentEnabled: boolean
  /** Scales T-wave contribution amplitude. */
  repolarizationAmpScale: number
  /** Optional global ST offset along inferior-left (e.g. electrolyte). */
  stGlobal_mV: number
  /** Late after-potential (U wave) amplitude along the T axis. */
  uAmp_mV: number
  /** Chaotic atrial dipole when atria are not organised. */
  fibrillatoryBaseline: boolean
}

export const DEFAULT_TISSUE: TissueModifiers = {
  ischemia: {},
  injuryCurrentEnabled: false,
  repolarizationAmpScale: 1,
  stGlobal_mV: 0,
  uAmp_mV: 0,
  fibrillatoryBaseline: false,
}

/**
 * Mean electrical axis in the frontal plane (degrees from Lead I).
 * Normal sinus QRS typically ≈ −30° to +90° (often ~+60°).
 */
export interface MeanElectricalAxis {
  /** Instantaneous frontal-plane angle of the net dipole (deg). */
  instantaneousDeg: number
  /** Angle of the ventricular (QRS) depolarization vector (deg). */
  qrsDeg: number
  /** Magnitude of the net dipole. */
  magnitude: number
  /** Magnitude of the ventricular depolarization vector. */
  qrsMagnitude: number
  /** Frontal-plane unit direction of the net field (for viz). */
  fieldDirection: Vec3
  /** 3D ventricular depolarization direction (scene body axes). */
  ventricularDepolarization: Vec3
}

/** Teaching summary for overlays / HUD. */
export interface VectorAnalysis {
  field: InstantaneousElectricalField
  /** Body-surface electrode potentials derived from the dipole. */
  surface: import('./bodySurface').BodySurfacePotentials
  leads: LeadVoltages
  axis: MeanElectricalAxis
  /** Peak intensity among myocardial contributions (0–1). */
  activationIntensity: number
}
