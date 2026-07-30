import { LEAD_AXES, LEAD_ORDER } from './leads'
import type {
  InstantaneousElectricalField,
  LeadVoltages,
} from './types'
import type { CardiacVector, LeadName } from './types'

/**
 * Project the instantaneous field onto each lead axis:
 *   V_lead = D · a_lead
 *
 * Pure function — the ECG Generator must only sample these voltages.
 */
export function projectFieldToLeads(
  field: InstantaneousElectricalField,
): LeadVoltages {
  const leads = {} as Record<LeadName, number>
  for (const axis of LEAD_AXES) {
    leads[axis.name] = projectDipole(field.dipole, {
      x: axis.x,
      y: axis.y,
      z: axis.z,
    })
  }
  return { t: field.t, leads }
}

export function projectDipole(
  dipole: CardiacVector,
  axis: CardiacVector,
): number {
  return dipole.x * axis.x + dipole.y * axis.y + dipole.z * axis.z
}

export function projectLead(
  dipole: CardiacVector,
  lead: LeadName,
): number {
  const axis = LEAD_AXES.find((l) => l.name === lead)
  if (!axis) return 0
  return projectDipole(dipole, { x: axis.x, y: axis.y, z: axis.z })
}

export { LEAD_ORDER }
