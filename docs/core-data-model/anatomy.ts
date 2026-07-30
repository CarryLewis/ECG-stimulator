/**
 * Cardiac anatomy — spatial / topological truth.
 *
 * Independent of electrophysiology timing and ECG millivolts.
 * Suitable for 3D teaching views and as the address space for activation maps.
 */

import type { ModelVersion, SpatialPose, Vec3 } from './common'

/** Macroscopic chambers. */
export type ChamberId = 'RA' | 'LA' | 'RV' | 'LV'

/**
 * Myocardial / ECG territory used for ischemia and lead teaching.
 * Extensible string union allows future territories (e.g. 'posterior').
 */
export type TerritoryId =
  | 'anterior'
  | 'septal'
  | 'inferior'
  | 'lateral'
  | 'posterior'
  | 'none'

/** Standard surface electrode labels (10 electrodes → 12 leads). */
export type ElectrodeId =
  | 'RA'
  | 'LA'
  | 'RL'
  | 'LL'
  | 'V1'
  | 'V2'
  | 'V3'
  | 'V4'
  | 'V5'
  | 'V6'

/**
 * Addressable electrical / anatomical regions for activation & pathology.
 * Keep stable across simulation versions; add new ids rather than rename.
 */
export type RegionId =
  | 'sa_node'
  | 'right_atrium'
  | 'left_atrium'
  | 'av_node'
  | 'his_bundle'
  | 'right_bundle'
  | 'left_bundle'
  | 'purkinje_rv'
  | 'purkinje_lv'
  | 'rv_myocardium'
  | 'lv_myocardium'
  | 'septum'
  | 'lv_anterior'
  | 'lv_lateral'
  | 'lv_inferior'
  | 'apex'
  /** Escape / pathological foci (future packs). */
  | 'ventricular_escape_focus'
  | 'accessory_pathway'

export type RegionKind =
  | 'pacemaker'
  | 'conduction'
  | 'myocardium'
  | 'pathological_focus'

export interface CardiacRegion {
  id: RegionId
  kind: RegionKind
  chamber?: ChamberId
  /** Primary wall territory this region belongs to (ischemia targeting). */
  territory: TerritoryId
  label: {
    en: string
    zh: string
  }
  /** Optional mesh / landmark pose for real-time animation. */
  pose?: SpatialPose
}

export interface ChamberDescriptor {
  id: ChamberId
  side: 'right' | 'left'
  level: 'atrium' | 'ventricle'
  label: { en: string; zh: string }
  pose?: SpatialPose
}

export interface TerritoryDescriptor {
  id: Exclude<TerritoryId, 'none'>
  /** Typical coronary supply (educational; not a full perfusion model). */
  coronarySupply: Array<'LAD' | 'RCA' | 'LCx' | 'other'>
  /** Unit direction used for injury-current contribution. */
  injuryDirection: Vec3
  label: { en: string; zh: string }
}

export type ElectrodeGroup = 'limb' | 'precordial'

export interface ElectrodeSite {
  id: ElectrodeId
  group: ElectrodeGroup
  /** Surface position on the torso anatomy. */
  position: Vec3
  place: { en: string; zh: string }
  /**
   * Leads for which this electrode is a primary exploring / contributing pole.
   * (Educational highlighting — Wilson central terminal math lives in vector layer.)
   */
  contributesToLeads: LeadNameRef[]
}

/**
 * Forward reference to lead names without importing the ECG module
 * (avoids circular deps at the type level).
 */
export type LeadNameRef =
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

export interface GreatVesselCue {
  id: 'aorta' | 'pulmonary_trunk' | 'svc' | 'ivc'
  pose?: SpatialPose
}

/**
 * Immutable anatomy snapshot loaded once (or swapped for different models).
 * Rendering adapters may attach meshes; the sim only needs ids + graph hooks.
 */
export interface HeartAnatomyModel {
  version: ModelVersion
  regions: readonly CardiacRegion[]
  chambers: readonly ChamberDescriptor[]
  territories: readonly TerritoryDescriptor[]
  electrodes: readonly ElectrodeSite[]
  vessels?: readonly GreatVesselCue[]
  /**
   * Body-frame origin note for documentation / tooling.
   * Axes: +x patient left, +y superior, +z anterior.
   */
  coordinateFrame: 'patient_body'
}

export interface AnatomyLookup {
  region(id: RegionId): CardiacRegion | undefined
  territory(id: Exclude<TerritoryId, 'none'>): TerritoryDescriptor | undefined
  electrode(id: ElectrodeId): ElectrodeSite | undefined
}
