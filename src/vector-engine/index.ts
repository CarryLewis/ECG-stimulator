import { evaluateElectricalField } from './evaluate'
import { analyzeMeanElectricalAxis } from './meanAxis'
import { projectFieldToLeads } from './project'
import type {
  EvaluateFieldInput,
} from './evaluate'
import type { VectorAnalysis } from './types'

/**
 * Full vector-engine tick: EP wavefronts → field → lead voltages → axis.
 */
export function analyzeElectricalVectors(
  input: EvaluateFieldInput,
): VectorAnalysis {
  const field = evaluateElectricalField(input)
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

  return { field, leads, axis, activationIntensity }
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
export type * from './types'
export { DEFAULT_TISSUE } from './types'
