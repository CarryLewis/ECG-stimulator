/**
 * Clinical interpretation — findings, risk, learning content.
 *
 * Consumes ECG + EP context; never mutates millivolts.
 * Disease packs supply explain() / deriveFindings().
 */

import type { BeatsPerMinute, DurationMs, LocaleCode, TimeSeconds } from './common'
import type { TerritoryId } from './anatomy'
import type { AvBlockDegree } from './conduction'
import type { LeadName } from './vector'

export type DiseaseCategory =
  | 'Baseline'
  | 'Cardiovascular'
  | 'Electrolyte'
  | 'Conduction'
  | 'Respiratory'
  | 'Endocrine'
  | 'Other'

export type ClinicalSeverity =
  | 'normal'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'critical'

export type FindingCode =
  | 'nsr'
  | 'sinus_tachycardia'
  | 'sinus_bradycardia'
  | 'st_elevation'
  | 'st_depression'
  | 'hyperacute_t'
  | 'peaked_t'
  | 'flat_t'
  | 'u_wave'
  | 'wide_qrs'
  | 'prolonged_pr'
  | 'absent_p'
  | 'fibrillatory_baseline'
  | 'irregularly_irregular'
  | 'av_dissociation'
  | 'escape_rhythm'
  | string // extensible

export interface ClinicalFinding {
  code: FindingCode
  severity: ClinicalSeverity
  /** Leads where the finding is most evident (if applicable). */
  leads?: readonly LeadName[]
  territory?: TerritoryId
  summary: { en: string; zh: string }
}

export type RiskFlagCode =
  | 'time_critical_stemi'
  | 'arrhythmia_risk'
  | 'hemodynamic_instability'
  | 'stroke_risk'
  | 'pacing_indication'
  | string

export interface ClinicalRiskFlag {
  code: RiskFlagCode
  severity: ClinicalSeverity
  message: { en: string; zh: string }
}

/**
 * Machine-checkable measurements for tutoring / assertions.
 * Prefer measured values from annotations when available.
 */
export interface ClinicalMeasurements {
  ventricularRate_bpm: BeatsPerMinute
  atrialRate_bpm?: BeatsPerMinute
  pr_ms?: DurationMs
  qrs_ms?: DurationMs
  qtc_ms?: DurationMs
  /** Peak ST deviation by lead (mV), if computed. */
  stDeviation_mV?: Partial<Record<LeadName, number>>
}

export interface LearningContent {
  summary: string
  mechanism: readonly string[]
  ecgFindings: readonly string[]
  clinical: readonly string[]
}

/**
 * Localized learning payload. Generators may produce one locale at a time
 * or both for caching.
 */
export type LocalizedLearningContent = Partial<
  Record<LocaleCode, LearningContent>
>

/**
 * Snapshot for UI panels, AI tutor, and case scoring.
 * Derived — never a source of simulation truth.
 */
export interface ClinicalSnapshot {
  t: TimeSeconds
  scenarioId: string
  category: DiseaseCategory
  params: Readonly<Record<string, number | string | boolean>>
  measurements: ClinicalMeasurements
  findings: readonly ClinicalFinding[]
  riskFlags: readonly ClinicalRiskFlag[]
  learning: LocalizedLearningContent
  /** Convenience mirrors from EP (optional). */
  avBlock?: AvBlockDegree
  atrialMode?: 'sinus' | 'fibrillation' | 'standstill' | 'flutter'
}

/**
 * Disease pack control-plane mapping (types only).
 * Implementations register with a registry in the Clinical Layer.
 */
export interface EpModifiers {
  saRate_bpm?: BeatsPerMinute
  meanVentricularRate_bpm?: BeatsPerMinute
  atrialRate_bpm?: BeatsPerMinute
  avDelay_s?: number
  avBlock?: AvBlockDegree
  atrialMode?: 'sinus' | 'fibrillation' | 'standstill' | 'flutter'
  ventricularEscapeRate_bpm?: BeatsPerMinute
  qrsDurationScale?: number
  pAmplitudeScale?: number
  repolarization?: {
    tAmpScale?: number
    tWidthScale?: number
    uAmp_mV?: number
    stGlobal_mV?: number
  }
  ischemia?: {
    territory: Exclude<TerritoryId, 'none'>
    severity: number
  }
  potassium_mmol_L?: number
}

export interface DiseaseParamDef {
  key: string
  kind: 'slider' | 'select'
  label: { en: string; zh: string }
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: readonly { value: string; label: { en: string; zh: string } }[]
  default: number | string
}

export interface DiseasePackDescriptor {
  id: string
  version: string
  category: DiseaseCategory
  name: { en: string; zh: string }
  short: { en: string; zh: string }
  params: readonly DiseaseParamDef[]
}
