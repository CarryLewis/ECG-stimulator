/**
 * Disease Simulation Engine — contracts.
 *
 * A disease modifies the physiological model. ECG morphology emerges from:
 *   Anatomy → Electrophysiology → Activation → Vector → BSP → 12-lead ECG → Clinical
 *
 * Disease packs NEVER write lead millivolts or waveform templates.
 */

import type { LeadName, Territory } from '../ecg/types'

/* -------------------------------------------------------------------------- */
/*  Shared primitives (aligned with docs/core-data-model)                     */
/* -------------------------------------------------------------------------- */

export type LocaleCode = 'en' | 'zh'

export type LocalizedString = { en: string; zh: string }

export type DiseaseCategory =
  | 'Baseline'
  | 'Cardiovascular'
  | 'Electrolyte'
  | 'Conduction'
  | 'Arrhythmia'

export type ClinicalSeverity =
  | 'normal'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'critical'

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
  | 'lv_posterior'
  | 'apex'
  | 'ventricular_escape_focus'
  | 'ventricular_tachycardia_focus'
  | 'accessory_pathway'

export type ConductionPathwayId =
  | 'sa_to_atria'
  | 'intra_atrial'
  | 'av_nodal'
  | 'his_bundle'
  | 'right_bundle_branch'
  | 'left_bundle_branch'
  | 'purkinje_network'
  | 'myocardial_spread'
  | 'escape_focus'
  | 'reentry_circuit'

export type AvBlockDegree =
  | 'none'
  | 'first'
  | 'second_type1'
  | 'second_type2'
  | 'third'

export type AtrialMode =
  | 'sinus'
  | 'fibrillation'
  | 'flutter'
  | 'standstill'

export type VentricularMode =
  | 'conducted'
  | 'escape'
  | 'tachycardia'
  | 'flutter'
  | 'fibrillation'
  | 'irregular'

export type BundleBranchState = 'normal' | 'blocked' | 'delayed'

export type DiseaseParamKind = 'slider' | 'select'

export interface DiseaseParamOption {
  value: string
  label: LocalizedString
}

export interface DiseaseParamDef {
  key: string
  kind: DiseaseParamKind
  label: LocalizedString
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: readonly DiseaseParamOption[]
  default: number | string
}

export type DiseaseParamValues = Readonly<Record<string, number | string | boolean>>

/* -------------------------------------------------------------------------- */
/*  Disease knowledge model (educational + simulation contract)               */
/* -------------------------------------------------------------------------- */

/** Myocardial wall territories addressable by disease packs. */
export type DiseaseTerritory = Exclude<Territory, 'none'>

/** 1. Anatomical location(s) the disease affects. */
export interface AffectedAnatomy {
  regions: readonly RegionId[]
  territories: readonly DiseaseTerritory[]
  chambers?: readonly ('RA' | 'LA' | 'RV' | 'LV')[]
  coronarySupply?: readonly ('LAD' | 'RCA' | 'LCx' | 'other')[]
  summary: LocalizedString
}

/** 2. Pathophysiological mechanism (why tissue behaves differently). */
export interface PathophysiologicalMechanism {
  primaryProcess: LocalizedString
  cascade: readonly LocalizedString[]
  severityDrivers?: readonly LocalizedString[]
}

/** 3. Electrophysiological membrane / automaticity changes. */
export interface ElectrophysiologicalChanges {
  automaticity?: LocalizedString
  excitability?: LocalizedString
  actionPotential?: LocalizedString
  refractory?: LocalizedString
  ionChannels?: readonly LocalizedString[]
}

/** 4. Conduction pathway changes. */
export interface ConductionChanges {
  pathways: readonly ConductionPathwayId[]
  effect: LocalizedString
  expectedPropagation: LocalizedString
}

/** 5. Expected electrical vector consequences (not lead mV templates). */
export interface ElectricalVectorChanges {
  meanQrsAxisHint?: LocalizedString
  injuryCurrent?: LocalizedString
  atrialContribution?: LocalizedString
  ventricularContribution?: LocalizedString
  repolarization?: LocalizedString
}

/**
 * 6. ECG manifestations — *emergent expectations* for teaching / assertions.
 * These describe what should appear after physiology runs; they are not
 * drawn onto the ECG generator.
 */
export interface EcgManifestations {
  rhythm: LocalizedString
  intervals: LocalizedString
  morphology: LocalizedString
  leadEmphasis?: readonly LeadName[]
  keyFindings: readonly LocalizedString[]
}

/** 7. Clinical explanation for the tutor / UI. */
export interface ClinicalExplanation {
  summary: LocalizedString
  bedside: readonly LocalizedString[]
  urgency: ClinicalSeverity
  teachingPoints: readonly LocalizedString[]
}

/**
 * Full disease knowledge + simulation adapter.
 * Implementations live under `library/`.
 */
export interface DiseaseDefinition {
  id: string
  version: string
  category: DiseaseCategory
  name: LocalizedString
  short: LocalizedString

  affectedAnatomy: AffectedAnatomy
  pathophysiology: PathophysiologicalMechanism
  electrophysiology: ElectrophysiologicalChanges
  conduction: ConductionChanges
  electricalVector: ElectricalVectorChanges
  ecgManifestations: EcgManifestations
  clinical: ClinicalExplanation

  params: readonly DiseaseParamDef[]

  /**
   * Map user/scenario parameters → physiological effects.
   * The simulation engine consumes only this output — never disease ids
   * inside the ECG sampler.
   */
  apply(params: DiseaseParamValues): PhysiologicalEffects
}

/* -------------------------------------------------------------------------- */
/*  Physiological effects (control plane into the sim stack)                  */
/* -------------------------------------------------------------------------- */

export interface IschemiaModifier {
  territory: DiseaseTerritory
  severity: number // 0..1
  /** Reciprocal territories get opposite injury current. */
  reciprocal?: readonly DiseaseTerritory[]
}

export interface RepolarizationModifiers {
  tAmplitudeScale?: number
  tWidthScale?: number
  uAmplitude_mV?: number
  stGlobal_mV?: number
  qtScale?: number
}

export interface BundleBranchModifiers {
  left: BundleBranchState
  right: BundleBranchState
  /** QRS duration scale when a branch is blocked/delayed. */
  qrsDurationScale?: number
  /** Approximate QRS axis shift in degrees (teaching vector). */
  axisShift_deg?: number
}

/**
 * Compact modifier bag applied onto the baseline PhysiologicalModel.
 * Downstream: EP engine + vector engine read these; ECG never sees disease ids.
 */
export interface PhysiologicalEffects {
  /** SA / atrial automaticity. */
  saRate_bpm?: number
  atrialRate_bpm?: number
  meanVentricularRate_bpm?: number

  atrialMode?: AtrialMode
  ventricularMode?: VentricularMode

  /** AV nodal delay (seconds) when conduction succeeds. */
  avDelay_s?: number
  avBlock?: AvBlockDegree
  /** For Mobitz I: PR increment per conducted beat (seconds). */
  avWenckebachIncrement_s?: number
  /** For Mobitz I/II patterning: conducted:blocked ratio hint. */
  avConductionRatio?: string

  ventricularEscapeRate_bpm?: number
  /** Flutter atrial cycle length (seconds), ~300/min → 0.2 s. */
  flutterCycle_s?: number

  qrsDurationScale?: number
  pAmplitudeScale?: number
  conductionVelocityScale?: number
  actionPotentialDurationScale?: number

  bundleBranches?: BundleBranchModifiers
  ischemia?: IschemiaModifier | IschemiaModifier[]
  repolarization?: RepolarizationModifiers

  potassium_mmol_L?: number
  calcium_mmol_L?: number

  /** Deterministic seed for irregular rhythms (AF RR). */
  rhythmSeed?: number
}

/**
 * Resolved physiological model after disease application.
 * This is what the Electrophysiology engine should receive.
 */
export interface PhysiologicalModel {
  saRate_bpm: number
  atrialRate_bpm: number
  ventricularRate_bpm: number
  atrialMode: AtrialMode
  ventricularMode: VentricularMode
  avDelay_s: number
  avBlock: AvBlockDegree
  avWenckebachIncrement_s: number
  avConductionRatio: string | null
  ventricularEscapeRate_bpm: number
  flutterCycle_s: number | null
  qrsDurationScale: number
  pAmplitudeScale: number
  conductionVelocityScale: number
  actionPotentialDurationScale: number
  leftBundle: BundleBranchState
  rightBundle: BundleBranchState
  qrsAxis_deg: number
  ischemia: Partial<Record<DiseaseTerritory, number>>
  reciprocalIschemia: Partial<Record<DiseaseTerritory, number>>
  injuryCurrentEnabled: boolean
  repolarization: Required<RepolarizationModifiers>
  potassium_mmol_L: number | null
  calcium_mmol_L: number | null
  rhythmSeed: number
}

/** Pipeline stage labels for architecture / UI. */
export type SimulationPipelineStage =
  | 'cardiac_anatomy'
  | 'electrophysiology'
  | 'electrical_activation'
  | 'electrical_vector'
  | 'body_surface_potential'
  | 'twelve_lead_ecg'
  | 'clinical_interpretation'

export const SIMULATION_PIPELINE: readonly SimulationPipelineStage[] = [
  'cardiac_anatomy',
  'electrophysiology',
  'electrical_activation',
  'electrical_vector',
  'body_surface_potential',
  'twelve_lead_ecg',
  'clinical_interpretation',
] as const

/**
 * Traceability record: which pipeline stages a disease primarily perturbs.
 * ECG is never listed as a *primary* mutation target.
 */
export interface DiseasePipelineImpact {
  diseaseId: string
  primaryStages: readonly SimulationPipelineStage[]
  emergentStages: readonly SimulationPipelineStage[]
}
