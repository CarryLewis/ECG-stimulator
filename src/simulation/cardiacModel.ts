/**
 * Cardiac anatomy + reference electrical vectors (teaching VCG).
 *
 * Axes (ECG convention):
 *   +x patient left · +y inferior · +z anterior
 *
 * Directions follow classic vectorcardiography:
 *   P   ≈ +45–60° frontal, left-inferior (slightly anterior)
 *   septal QRS early: right + anterior (LV→RV septum)
 *   free-wall QRS: left + inferior + mildly posterior (mean axis ~+60°)
 *   late basal: superior / right residual (S-wave termination)
 *   T: concordant with QRS, slightly more anterior
 */

import type { CardiacVector, Vec3 } from './types'

/** Heart electrical centre in body coordinates (scene units). */
export const HEART_CENTER: Vec3 = { x: 0.08, y: 0.05, z: 0.15 }

/** Nominal mean QRS axis (toward Lead II). */
export const NOMINAL_CARDIAC_AXIS_DEG = 60

/**
 * Unit-ish activation directions at the nominal +60° QRS axis.
 * Magnitudes are applied separately in the vector generator.
 */

/** Mean atrial depolarization (~+50°). Independent of ventricular axis. */
export const ATRIAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: 0.64, // cos(50°)
  y: 0.77, // sin(50°)
  z: 0.18, // slight anterior — helps P in V3–V6
}

/** Early right-atrial emphasis (more right/anterior) for V1 biphasic P. */
export const ATRIAL_EARLY_DIRECTION: CardiacVector = {
  x: 0.25,
  y: 0.55,
  z: 0.45,
}

/** Late left-atrial emphasis (more left/posterior). */
export const ATRIAL_LATE_DIRECTION: CardiacVector = {
  x: 0.75,
  y: 0.55,
  z: -0.25,
}

/** Early septal: left → right, anterior. */
export const SEPTAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: -0.55,
  y: 0.1,
  z: 0.8,
}

/** Main LV free-wall / apical vector at +60°. */
export const VENTRICULAR_ACTIVATION_DIRECTION: CardiacVector = {
  x: 0.5,
  y: 0.866,
  z: -0.22,
}

/** Late basal / posterobasal residual (S-wave / terminal forces). */
export const BASAL_ACTIVATION_DIRECTION: CardiacVector = {
  x: -0.25,
  y: -0.35,
  z: -0.35,
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
