import type { LeadAxis, LeadName, Territory } from '../ecg/types'
import type { Vec3 } from './types'

/**
 * Standard 12-lead viewing axes in body coordinates.
 *
 * Limb leads follow Einthoven / Goldberger angles in the frontal (x–y) plane.
 * Precordial leads look primarily in the horizontal (x–z) plane with a small
 * inferior component so R-wave progression emerges from a single cardiac dipole.
 *
 * Axes: +x patient left, +y inferior (Einthoven convention for frontal plane),
 * +z anterior — matching the anatomy viewport body frame for y-down scene coords
 * after the teaching sign convention used by the dipole projection.
 *
 * Note: anatomy meshes use +y superior. Lead axes here use clinical Einthoven
 * +y inferior so Lead II / aVF read positive for a normal QRS.
 */
export const LEAD_AXES: readonly LeadAxis[] = [
  { name: 'I', x: 1, y: 0, z: 0, territory: 'lateral' },
  { name: 'II', x: 0.5, y: 0.866, z: 0, territory: 'inferior' },
  { name: 'III', x: -0.5, y: 0.866, z: 0, territory: 'inferior' },
  { name: 'aVR', x: -0.866, y: -0.5, z: 0, territory: 'none' },
  { name: 'aVL', x: 0.866, y: -0.5, z: 0, territory: 'lateral' },
  { name: 'aVF', x: 0, y: 1, z: 0, territory: 'inferior' },
  { name: 'V1', x: -0.35, y: 0.1, z: 0.93, territory: 'septal' },
  { name: 'V2', x: -0.1, y: 0.12, z: 0.99, territory: 'anterior' },
  { name: 'V3', x: 0.25, y: 0.15, z: 0.96, territory: 'anterior' },
  { name: 'V4', x: 0.55, y: 0.18, z: 0.81, territory: 'anterior' },
  { name: 'V5', x: 0.85, y: 0.15, z: 0.5, territory: 'lateral' },
  { name: 'V6', x: 1.0, y: 0.12, z: 0.15, territory: 'lateral' },
]

export const LEAD_BY_NAME: Readonly<Record<LeadName, LeadAxis>> =
  Object.fromEntries(LEAD_AXES.map((l) => [l.name, l])) as Record<
    LeadName,
    LeadAxis
  >

export const LEAD_ORDER: readonly LeadName[] = LEAD_AXES.map((l) => l.name)

/** Unit injury-current direction for each infarct territory. */
export const TERRITORY_VECTOR: Readonly<
  Record<Exclude<Territory, 'none'>, Vec3>
> = {
  anterior: { x: 0.15, y: 0.1, z: 1 },
  inferior: { x: 0.1, y: 1, z: 0.1 },
  lateral: { x: 1, y: 0.1, z: 0.2 },
  septal: { x: -0.2, y: 0.05, z: 0.9 },
  posterior: { x: 0.15, y: 0.1, z: -1 },
}

/** Lead axes in the vector-engine Vec3 shape (for projection context). */
export function leadAxesAsProjection(): ReadonlyArray<{
  name: LeadName
  axis: Vec3
  territory: Territory
}> {
  return LEAD_AXES.map((l) => ({
    name: l.name,
    axis: { x: l.x, y: l.y, z: l.z },
    territory: l.territory,
  }))
}
