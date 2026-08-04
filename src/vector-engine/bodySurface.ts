import type { ElectrodeId } from '../ecg/electrodeMap'
import { ELECTRODE_SITES } from '../ecg/electrodeMap'
import type { CardiacVector, InstantaneousElectricalField } from './types'
import { vectorMagnitude } from './wavefronts'

/** Heart electrical origin in scene body coordinates (matches Vec view). */
export const HEART_ORIGIN_SCENE = { x: 0.05, y: -0.35, z: 0.05 } as const

/**
 * Instantaneous body-surface potentials at the ten clinical electrodes.
 * Derived from the cardiac dipole (far-field approximation) — not invented
 * millivolt templates.
 */
export interface BodySurfacePotentials {
  t: number
  /** Potential at each electrode (arbitrary mV·scale, consistent with leads). */
  electrodes: Readonly<Record<ElectrodeId, number>>
  /** Wilson central terminal = (RA + LA + LL) / 3. */
  wilsonCT: number
}

interface ElectrodeGeometry {
  id: ElectrodeId
  /** Unit direction heart → electrode in Einthoven electrical coords. */
  unit: CardiacVector
  /** Distance used for 1/r² falloff. */
  distance: number
}

/**
 * Scene (+y superior) → electrical (+y inferior) for potential math.
 */
function sceneToElectrical(v: CardiacVector): CardiacVector {
  return { x: v.x, y: -v.y, z: v.z }
}

function buildElectrodeGeometry(): readonly ElectrodeGeometry[] {
  return ELECTRODE_SITES.map((site) => {
    const dx = site.position[0] - HEART_ORIGIN_SCENE.x
    const dy = site.position[1] - HEART_ORIGIN_SCENE.y
    const dz = site.position[2] - HEART_ORIGIN_SCENE.z
    const scene = { x: dx, y: dy, z: dz }
    const elec = sceneToElectrical(scene)
    const distance = Math.max(0.35, vectorMagnitude(elec))
    const unit = {
      x: elec.x / distance,
      y: elec.y / distance,
      z: elec.z / distance,
    }
    return { id: site.id, unit, distance }
  })
}

const ELECTRODE_GEOMETRY = buildElectrodeGeometry()

/**
 * Far-field body-surface potential from the equivalent cardiac dipole:
 *   Φ(r) ≈ (D · r̂) / r²
 *
 * RL is ground / right-leg drive and is held at 0 for teaching.
 */
export function computeBodySurfacePotentials(
  field: InstantaneousElectricalField,
): BodySurfacePotentials {
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

  const D = field.dipole
  for (const g of ELECTRODE_GEOMETRY) {
    if (g.id === 'RL') {
      electrodes.RL = 0
      continue
    }
    const r2 = g.distance * g.distance
    electrodes[g.id] =
      (D.x * g.unit.x + D.y * g.unit.y + D.z * g.unit.z) / r2
  }

  const wilsonCT =
    (electrodes.RA + electrodes.LA + electrodes.LL) / 3

  return { t: field.t, electrodes, wilsonCT }
}
