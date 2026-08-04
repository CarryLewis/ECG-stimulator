import type { LeadAxis, LeadName, Territory } from './types'

/**
 * Standard 12-lead viewing axes in body coordinates.
 *
 * Limb leads follow Einthoven / Goldberger angles in the frontal (x–y) plane.
 * Precordial leads look primarily in the horizontal (x–z) plane with a small
 * inferior component so R-wave progression emerges naturally from a single
 * cardiac dipole.
 */
export const LEAD_AXES: LeadAxis[] = [
  // Limb — frontal plane
  { name: 'I', x: 1, y: 0, z: 0, territory: 'lateral' },
  { name: 'II', x: 0.5, y: 0.866, z: 0, territory: 'inferior' },
  { name: 'III', x: -0.5, y: 0.866, z: 0, territory: 'inferior' },
  { name: 'aVR', x: -0.866, y: -0.5, z: 0, territory: 'none' },
  { name: 'aVL', x: 0.866, y: -0.5, z: 0, territory: 'lateral' },
  { name: 'aVF', x: 0, y: 1, z: 0, territory: 'inferior' },
  // Precordial — horizontal plane (angles ≈ 120° → 0°)
  { name: 'V1', x: -0.35, y: 0.1, z: 0.93, territory: 'septal' },
  { name: 'V2', x: -0.1, y: 0.12, z: 0.99, territory: 'anterior' },
  { name: 'V3', x: 0.25, y: 0.15, z: 0.96, territory: 'anterior' },
  { name: 'V4', x: 0.55, y: 0.18, z: 0.81, territory: 'anterior' },
  { name: 'V5', x: 0.85, y: 0.15, z: 0.5, territory: 'lateral' },
  { name: 'V6', x: 1.0, y: 0.12, z: 0.15, territory: 'lateral' },
]

export const LEAD_BY_NAME: Record<LeadName, LeadAxis> = Object.fromEntries(
  LEAD_AXES.map((l) => [l.name, l]),
) as Record<LeadName, LeadAxis>

export const LEAD_ORDER: LeadName[] = LEAD_AXES.map((l) => l.name)

/** Standard 12-lead print layout: 4 columns × 3 rows. */
export const LEAD_GRID: LeadName[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]

/** Unit injury-current direction for each infarct territory. */
export const TERRITORY_VECTOR: Record<
  Exclude<Territory, 'none'>,
  { x: number; y: number; z: number }
> = {
  anterior: { x: 0.15, y: 0.1, z: 1 },
  inferior: { x: 0.1, y: 1, z: 0.1 },
  lateral: { x: 1, y: 0.1, z: 0.2 },
  septal: { x: -0.2, y: 0.05, z: 0.9 },
  posterior: { x: 0.15, y: 0.1, z: -1 },
}
