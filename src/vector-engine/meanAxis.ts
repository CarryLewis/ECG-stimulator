import { ventricularDepolarizationVector } from './evaluate'
import type {
  InstantaneousElectricalField,
  MeanElectricalAxis,
} from './types'
import {
  electricalToScene,
  normalizeVector,
  vectorMagnitude,
} from './wavefronts'

/**
 * Frontal-plane mean electrical axis from a dipole.
 * Angle in degrees from Lead I (+x), positive toward Lead aVF (+y inferior).
 * Range: (−180, 180].
 */
export function frontalAxisDegrees(dipole: {
  x: number
  y: number
}): number {
  if (Math.abs(dipole.x) < 1e-8 && Math.abs(dipole.y) < 1e-8) return 0
  return (Math.atan2(dipole.y, dipole.x) * 180) / Math.PI
}

/**
 * Derive mean electrical axis + ventricular depolarization direction
 * from the instantaneous field (and its QRS contributions).
 */
export function analyzeMeanElectricalAxis(
  field: InstantaneousElectricalField,
): MeanElectricalAxis {
  const qrs = ventricularDepolarizationVector(field)
  const mag = vectorMagnitude(field.dipole)
  const qrsMag = vectorMagnitude(qrs)

  return {
    instantaneousDeg: frontalAxisDegrees(field.dipole),
    qrsDeg: frontalAxisDegrees(qrs),
    magnitude: mag,
    qrsMagnitude: qrsMag,
    fieldDirection: electricalToScene(normalizeVector(field.dipole)),
    ventricularDepolarization: electricalToScene(
      normalizeVector(qrs, { x: 0.7, y: 0.6, z: 0.3 }),
    ),
  }
}

/** Human-readable quadrant label for teaching HUD. */
export function axisQuadrantLabel(deg: number): string {
  const d = ((deg % 360) + 360) % 360
  const signed = d > 180 ? d - 360 : d
  if (signed >= -30 && signed <= 90) return 'Normal'
  if (signed > 90 && signed <= 180) return 'Right axis deviation'
  if (signed < -30 && signed >= -90) return 'Left axis deviation'
  return 'Extreme axis'
}
