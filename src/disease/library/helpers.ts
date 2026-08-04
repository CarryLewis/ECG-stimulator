/**
 * Shared helpers for disease pack definitions.
 */

import type {
  DiseaseParamDef,
  DiseaseParamValues,
  LocalizedString,
} from '../types'

export const L = (en: string, zh: string): LocalizedString => ({ en, zh })

export function num(
  params: DiseaseParamValues,
  key: string,
  fallback: number,
): number {
  const raw = params[key]
  return typeof raw === 'number' && !Number.isNaN(raw) ? raw : fallback
}

export function str(
  params: DiseaseParamValues,
  key: string,
  fallback: string,
): string {
  const raw = params[key]
  return typeof raw === 'string' ? raw : fallback
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}

export const HR_PARAM = (
  defaultBpm: number,
  label: LocalizedString = L('Heart rate', '心率'),
): DiseaseParamDef => ({
  key: 'heartRate',
  kind: 'slider',
  label,
  min: 20,
  max: 220,
  step: 1,
  unit: 'bpm',
  default: defaultBpm,
})

export const SEVERITY_PARAM = (
  key: string,
  label: LocalizedString,
  def = 80,
): DiseaseParamDef => ({
  key,
  kind: 'slider',
  label,
  min: 0,
  max: 100,
  step: 1,
  unit: '%',
  default: def,
})
