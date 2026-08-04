/**
 * Disease registry — plugin catalog for the Clinical layer.
 */

import type {
  DiseaseDefinition,
  DiseaseParamValues,
  DiseasePipelineImpact,
  SimulationPipelineStage,
} from './types'
import { SIMULATION_PIPELINE } from './types'

const registry = new Map<string, DiseaseDefinition>()

export function registerDisease(disease: DiseaseDefinition): void {
  if (registry.has(disease.id)) {
    throw new Error(`Disease already registered: ${disease.id}`)
  }
  registry.set(disease.id, disease)
}

export function registerDiseases(diseases: readonly DiseaseDefinition[]): void {
  for (const d of diseases) registerDisease(d)
}

export function getDisease(id: string): DiseaseDefinition | undefined {
  return registry.get(id)
}

export function requireDisease(id: string): DiseaseDefinition {
  const d = registry.get(id)
  if (!d) throw new Error(`Unknown disease: ${id}`)
  return d
}

export function listDiseases(): readonly DiseaseDefinition[] {
  return [...registry.values()]
}

export function listDiseasesByCategory(
  category: DiseaseDefinition['category'],
): readonly DiseaseDefinition[] {
  return listDiseases().filter((d) => d.category === category)
}

export function defaultParamsFor(disease: DiseaseDefinition): DiseaseParamValues {
  const out: Record<string, number | string | boolean> = {}
  for (const p of disease.params) out[p.key] = p.default
  return out
}

export function clearDiseaseRegistry(): void {
  registry.clear()
}

/**
 * Infer which pipeline stages a disease primarily mutates vs which emerge.
 * ECG / clinical interpretation are always emergent (never primary mutation).
 */
export function inferPipelineImpact(disease: DiseaseDefinition): DiseasePipelineImpact {
  const effects = disease.apply(defaultParamsFor(disease))
  const primary = new Set<SimulationPipelineStage>(['cardiac_anatomy', 'electrophysiology'])

  if (effects.ischemia || effects.bundleBranches || effects.conductionVelocityScale) {
    primary.add('electrical_activation')
  }
  if (
    effects.ischemia ||
    effects.repolarization ||
    effects.bundleBranches ||
    effects.ventricularMode === 'tachycardia' ||
    effects.ventricularMode === 'flutter' ||
    effects.ventricularMode === 'fibrillation'
  ) {
    primary.add('electrical_vector')
  }

  const emergent: SimulationPipelineStage[] = SIMULATION_PIPELINE.filter(
    (s) =>
      s === 'body_surface_potential' ||
      s === 'twelve_lead_ecg' ||
      s === 'clinical_interpretation' ||
      !primary.has(s),
  )

  return {
    diseaseId: disease.id,
    primaryStages: [...primary],
    emergentStages: emergent,
  }
}
