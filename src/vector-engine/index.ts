import { evaluateElectricalField } from './evaluate'
import { analyzeMeanElectricalAxis } from './meanAxis'
import { computeBodySurfacePotentials } from './bodySurface'
import { projectFieldToLeads } from './project'
import type { EvaluateFieldInput } from './evaluate'
import type { VectorAnalysis } from './types'

/**
 * Full vector-engine tick:
 *   cardiac wavefronts → electrical field → body-surface potentials → leads
 *
 * Lead voltages use clinical Einthoven / precordial unit axes (D · a_lead)
 * so morphology matches a real 12-lead strip. Body-surface potentials remain
 * available for electrode teaching overlays.
 */
export function analyzeElectricalVectors(
  input: EvaluateFieldInput,
): VectorAnalysis {
  const field = evaluateElectricalField(input)
  const surface = computeBodySurfacePotentials(field)
  const leads = projectFieldToLeads(field)
  const axis = analyzeMeanElectricalAxis(field)

  let activationIntensity = 0
  for (const c of field.contributions) {
    if (
      c.kind === 'atrial_depol' ||
      c.kind === 'septal_depol' ||
      c.kind === 'apical_depol' ||
      c.kind === 'basal_depol' ||
      c.kind === 'ventricular_repol'
    ) {
      activationIntensity = Math.max(activationIntensity, c.weight)
    }
  }

  return { field, surface, leads, axis, activationIntensity }
}

export { evaluateElectricalField, ventricularDepolarizationVector } from './evaluate'
export type { EvaluateFieldInput } from './evaluate'
export { projectFieldToLeads, projectDipole, projectLead, LEAD_ORDER } from './project'
export {
  LEAD_AXES,
  LEAD_BY_NAME,
  TERRITORY_VECTOR,
  leadAxesAsProjection,
} from './leads'
export {
  analyzeMeanElectricalAxis,
  frontalAxisDegrees,
  axisQuadrantLabel,
} from './meanAxis'
export {
  WAVEFRONT_DIRECTION,
  electricalToScene,
  normalizeVector,
  vectorMagnitude,
  scaleVector,
  addVectors,
} from './wavefronts'
export {
  computeBodySurfacePotentials,
  HEART_ORIGIN_SCENE,
} from './bodySurface'
export type { BodySurfacePotentials } from './bodySurface'
export { calculateLeadsFromPotentials } from './leadsFromPotentials'
export type * from './types'
export { DEFAULT_TISSUE } from './types'
