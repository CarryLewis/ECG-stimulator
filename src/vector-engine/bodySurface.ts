import type { ElectrodeId } from '../ecg/electrodeMap'
import type { CardiacVector, InstantaneousElectricalField } from './types'
import { LEAD_BY_NAME } from './leads'

/**
 * Instantaneous body-surface potentials at the ten clinical electrodes.
 * Derived from the cardiac dipole using clinical lead-axis geometry
 * (Einthoven / Wilson), not the decorative torso mesh positions.
 */
export interface BodySurfacePotentials {
  t: number
  electrodes: Readonly<Record<ElectrodeId, number>>
  wilsonCT: number
}

/**
 * Clinical electrode look-directions in Einthoven body coordinates
 * (+x left, +y inferior, +z anterior). Chosen so that:
 *   I = Φ_LA − Φ_RA ,  II = Φ_LL − Φ_RA ,  Vn = Φ_Vn − CT
 * reproduce standard 12-lead axes.
 */
const CLINICAL_ELECTRODE_DIR: Readonly<Record<ElectrodeId, CardiacVector>> = {
  // Limb — Einthoven triangle vertices (unit-ish)
  RA: { x: -0.866, y: -0.5, z: 0 },
  LA: { x: 0.866, y: -0.5, z: 0 },
  LL: { x: 0, y: 1, z: 0 },
  RL: { x: 0, y: 0, z: 0 },
  // Precordial — match LEAD_AXES exploring poles (vs Wilson CT)
  V1: { x: LEAD_BY_NAME.V1.x, y: LEAD_BY_NAME.V1.y, z: LEAD_BY_NAME.V1.z },
  V2: { x: LEAD_BY_NAME.V2.x, y: LEAD_BY_NAME.V2.y, z: LEAD_BY_NAME.V2.z },
  V3: { x: LEAD_BY_NAME.V3.x, y: LEAD_BY_NAME.V3.y, z: LEAD_BY_NAME.V3.z },
  V4: { x: LEAD_BY_NAME.V4.x, y: LEAD_BY_NAME.V4.y, z: LEAD_BY_NAME.V4.z },
  V5: { x: LEAD_BY_NAME.V5.x, y: LEAD_BY_NAME.V5.y, z: LEAD_BY_NAME.V5.z },
  V6: { x: LEAD_BY_NAME.V6.x, y: LEAD_BY_NAME.V6.y, z: LEAD_BY_NAME.V6.z },
}

/** Heart origin kept for 3D overlays / documentation. */
export const HEART_ORIGIN_SCENE = { x: 0.05, y: -0.35, z: 0.05 } as const

/**
 * Far-field potential Φ(electrode) = D · û_electrode.
 * Equal-distance assumption yields clinically correct lead differences.
 */
export function computeBodySurfacePotentials(
  field: InstantaneousElectricalField,
): BodySurfacePotentials {
  const D = field.dipole
  const electrodes = {
    RA: 0,
    LA: 0,
    RL: 0,
    LL: 0,
    V1: 0,
    V2: 0,
    V3: 0,
    V4: 0,
    V5: 0,
    V6: 0,
  } as Record<ElectrodeId, number>

  for (const id of Object.keys(CLINICAL_ELECTRODE_DIR) as ElectrodeId[]) {
    if (id === 'RL') {
      electrodes.RL = 0
      continue
    }
    const u = CLINICAL_ELECTRODE_DIR[id]
    electrodes[id] = D.x * u.x + D.y * u.y + D.z * u.z
  }

  const wilsonCT = (electrodes.RA + electrodes.LA + electrodes.LL) / 3

  return { t: field.t, electrodes, wilsonCT }
}
