/**
 * Electrical vector field — cardiac dipole / multipole in body coordinates.
 *
 * Consumes ActivationMap + TissueState; produces lead projections.
 */

import type { Millivolts, TimeSeconds, UnitInterval, Vec3 } from './common'
import type { LeadNameRef, TerritoryId } from './anatomy'

/** Standard 12-lead names (alias of anatomy LeadNameRef). */
export type LeadName = LeadNameRef

/**
 * Instantaneous equivalent cardiac dipole (single-dipole MVP).
 * Magnitude is in arbitrary mV·scale units consistent with lead axes.
 */
export interface CardiacDipole {
  /** Left (+) / right (−) */
  x: number
  /** Inferior (+) / superior (−) */
  y: number
  /** Anterior (+) / posterior (−) */
  z: number
}

/**
 * Named wavefront contribution — extensible for pathology-specific vectors
 * (e.g. delta wave, Brugada pattern) without changing the ECG sampler.
 */
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
  /** Optional pathology / pack tag (e.g. 'stemi.anterior'). */
  tag?: string
  weight: UnitInterval
  vector: CardiacDipole
}

/** Unit projection axis for one surface lead. */
export interface LeadAxis {
  name: LeadName
  axis: Vec3
  territory: TerritoryId
}

/**
 * Instantaneous electrical field summary at time t.
 * MVP uses `dipole`; `contributions` support debugging & teaching overlays;
 * `multipoles` reserved for future fidelity.
 */
export interface InstantaneousElectricalField {
  t: TimeSeconds
  dipole: CardiacDipole
  contributions: readonly VectorContribution[]
  /** Reserved — higher-order terms for future BSPM-style models. */
  multipoles?: readonly CardiacDipole[]
}

/** Lead voltages obtained by projecting the field onto each lead axis. */
export interface LeadVoltages {
  t: TimeSeconds
  leads: Readonly<Record<LeadName, Millivolts>>
}

export interface LeadProjectionContext {
  axes: readonly LeadAxis[]
  /** Territory injury directions (usually from anatomy territories). */
  territoryInjuryDirection: Readonly<
    Record<Exclude<TerritoryId, 'none'>, Vec3>
  >
}

/**
 * Pure function contract (documentation as types).
 * Implementations live in the Vector Engine package.
 */
export type ProjectFieldToLeads = (
  field: InstantaneousElectricalField,
  ctx: LeadProjectionContext,
) => LeadVoltages
