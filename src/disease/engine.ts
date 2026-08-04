/**
 * Disease Simulation Engine — orchestration.
 *
 * Clinical layer selects a disease + params.
 * Engine resolves PhysiologicalModel for the EP stack.
 * ECG is never written here.
 */

import {
  applyPhysiologicalEffects,
  BASELINE_PHYSIOLOGY,
} from './physiology'
import {
  defaultParamsFor,
  getDisease,
  inferPipelineImpact,
  listDiseases,
  requireDisease,
} from './registry'
import type {
  DiseaseDefinition,
  DiseaseParamValues,
  DiseasePipelineImpact,
  PhysiologicalEffects,
  PhysiologicalModel,
} from './types'

export interface DiseaseSimulationRequest {
  diseaseId: string
  params?: DiseaseParamValues
  /** Optional prior physiology (e.g. stacked modifiers). Default = healthy baseline. */
  baseline?: PhysiologicalModel
}

export interface DiseaseSimulationResult {
  disease: DiseaseDefinition
  params: DiseaseParamValues
  effects: PhysiologicalEffects
  model: PhysiologicalModel
  pipelineImpact: DiseasePipelineImpact
  /**
   * Teaching chain for UI:
   * Affected anatomy → conduction pathway → expected propagation → ECG morphology
   */
  teachingTrace: {
    affectedAnatomy: DiseaseDefinition['affectedAnatomy']
    affectedConductionPathway: DiseaseDefinition['conduction']
    expectedPropagation: string
    expectedEcgMorphology: DiseaseDefinition['ecgManifestations']
    clinicalExplanation: DiseaseDefinition['clinical']
  }
}

/**
 * Resolve a disease into a physiological model ready for the EP engine.
 */
export function resolveDiseaseSimulation(
  request: DiseaseSimulationRequest,
): DiseaseSimulationResult {
  const disease = requireDisease(request.diseaseId)
  const params = {
    ...defaultParamsFor(disease),
    ...request.params,
  }
  const effects = disease.apply(params)
  const baseline = request.baseline ?? {
    ...BASELINE_PHYSIOLOGY,
    ischemia: {},
    reciprocalIschemia: {},
    repolarization: { ...BASELINE_PHYSIOLOGY.repolarization },
  }
  const model = applyPhysiologicalEffects(baseline, effects)

  return {
    disease,
    params,
    effects,
    model,
    pipelineImpact: inferPipelineImpact(disease),
    teachingTrace: {
      affectedAnatomy: disease.affectedAnatomy,
      affectedConductionPathway: disease.conduction,
      expectedPropagation: disease.conduction.expectedPropagation.en,
      expectedEcgMorphology: disease.ecgManifestations,
      clinicalExplanation: disease.clinical,
    },
  }
}

/** Catalog snapshot for scenario pickers. */
export function diseaseCatalog(): readonly {
  id: string
  name: DiseaseDefinition['name']
  category: DiseaseDefinition['category']
  short: DiseaseDefinition['short']
}[] {
  return listDiseases().map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    short: d.short,
  }))
}

export function tryResolveDisease(
  diseaseId: string,
  params?: DiseaseParamValues,
): DiseaseSimulationResult | null {
  if (!getDisease(diseaseId)) return null
  return resolveDiseaseSimulation({ diseaseId, params })
}

/**
 * Assert invariant: disease packs must not claim ECG as a primary mutation stage.
 */
export function assertPhysiologyDriven(disease: DiseaseDefinition): void {
  const impact = inferPipelineImpact(disease)
  if (impact.primaryStages.includes('twelve_lead_ecg')) {
    throw new Error(
      `Disease ${disease.id} must not mutate twelve_lead_ecg directly`,
    )
  }
}
