import type { CardiacVector, VectorContributionKind } from './types'

/**
 * Characteristic body-coordinate directions for sequential myocardial
 * activation wavefronts (Einthoven: +x left, +y inferior, +z anterior).
 *
 * These are the teaching “source vectors” — ECG millivolts come only from
 * projecting their weighted sum onto lead axes.
 */
export const WAVEFRONT_DIRECTION: Readonly<
  Record<
    Exclude<
      VectorContributionKind,
      'injury_current' | 'fibrillatory' | 'global_st' | 'custom' | 'u_wave'
    >,
    CardiacVector
  >
> = {
  // Atrial depolarisation — inferior / slightly leftward (upright P in II).
  atrial_depol: { x: 0.15, y: 0.55, z: 0.05 },
  // Septal L→R — brief early r in V1 (keep modest so it does not dwarf S).
  septal_depol: { x: -0.4, y: 0.05, z: 0.55 },
  // Apical / free-wall — main R (left + inferior; mild anterior so V1 stays net −).
  apical_depol: { x: 1.35, y: 1.05, z: 0.18 },
  // Late basal — deepens S in V1–V2 (right / superior / posterior).
  basal_depol: { x: -0.7, y: -0.2, z: -0.75 },
  // Repolarisation — upright T in II / V5–V6.
  ventricular_repol: { x: 0.55, y: 0.5, z: 0.15 },
}

export function scaleVector(v: CardiacVector, s: number): CardiacVector {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

export function addVectors(a: CardiacVector, b: CardiacVector): CardiacVector {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function vectorMagnitude(v: CardiacVector): number {
  return Math.hypot(v.x, v.y, v.z)
}

export function normalizeVector(
  v: CardiacVector,
  fallback: CardiacVector = { x: 1, y: 0, z: 0 },
): CardiacVector {
  const m = vectorMagnitude(v)
  if (m < 1e-8) return fallback
  return { x: v.x / m, y: v.y / m, z: v.z / m }
}

/**
 * Convert Einthoven electrical coords (+y inferior) to anatomy scene
 * coords (+y superior) for 3D arrow rendering.
 */
export function electricalToScene(v: CardiacVector): CardiacVector {
  return { x: v.x, y: -v.y, z: v.z }
}
