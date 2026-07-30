/**
 * Cardiac anatomy coordinate model for the electrical dipole.
 *
 * Axes (ECG convention used by the vector engine):
 *   X: left (+) ↔ right (−)
 *   Y: inferior (+) ↔ superior (−)
 *   Z: anterior (+) ↔ posterior (−)
 */

import type { CardiacVector, Vec3 } from './types'

/** Heart electrical centre in body coordinates (scene units). */
export const HEART_CENTER: Vec3 = { x: 0.08, y: 0.05, z: 0.15 }

/**
 * Nominal mean QRS axis direction at +60° (normal axis, toward Lead II).
 * Rotated in the frontal plane by SimulationParams.cardiacAxis_deg.
 */
export const NOMINAL_CARDIAC_AXIS_DEG = 60

/**
 * Default ventricular free-wall activation direction.
 * Left + inferior (axis ~60°), mildly posterior — enough for V1 S waves
 * while leftward magnitude still yields R progression toward V5–V6.
 */
export const VENTRICULAR_ACTIVATION_DIRECTION: CardiacVector = {
  x: 0.55,
  y: 0.82,
  z: -0.12,
}

/** Atrial depolarization: left-inferior, slightly posterior. */
export const ATRIAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: 0.45,
  y: 0.55,
  z: -0.12,
}

/** Early septal: rightward and anterior (left → right septum). */
export const SEPTAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: -0.45,
  y: 0.05,
  z: 0.65,
}

/** Late basal contribution: slight superior / right residual. */
export const BASAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: -0.12,
  y: -0.2,
  z: -0.15,
}

/** Territory outward directions for injury current (STEMI). */
export const TERRITORY_INJURY_DIRECTION: Record<
  'anterior' | 'septal' | 'inferior' | 'lateral',
  CardiacVector
> = {
  anterior: { x: 0.15, y: 0.05, z: 1 },
  septal: { x: -0.35, y: 0.05, z: 0.75 },
  inferior: { x: 0.1, y: 1, z: -0.05 },
  lateral: { x: 1, y: 0.05, z: 0.15 },
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

/** Rotate a vector in the frontal (x–y) plane to a target QRS axis. */
export function rotateFrontalAxis(
  v: CardiacVector,
  axisDeg: number,
  referenceDeg: number = NOMINAL_CARDIAC_AXIS_DEG,
): CardiacVector {
  const delta = degToRad(axisDeg - referenceDeg)
  const c = Math.cos(delta)
  const s = Math.sin(delta)
  return {
    x: v.x * c - v.y * s,
    y: v.x * s + v.y * c,
    z: v.z,
  }
}

export function addVec(a: CardiacVector, b: CardiacVector): CardiacVector {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function scaleVec(v: CardiacVector, s: number): CardiacVector {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

export function dot(a: CardiacVector, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z)
}

export function normalize(v: Vec3): Vec3 {
  const L = length(v)
  if (L < 1e-9) return { x: 0, y: 0, z: 0 }
  return { x: v.x / L, y: v.y / L, z: v.z / L }
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

/**
 * Convert ECG-convention dipole to Three.js anatomy scene axes
 * (anatomy: +x left, +y superior, +z anterior).
 */
export function dipoleToAnatomyScene(m: CardiacVector): Vec3 {
  return { x: m.x, y: -m.y, z: m.z }
}
