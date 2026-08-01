/**
 * 12-lead measurement geometry.
 * V_lead = M · a_lead  (single cardiac dipole projection)
 */

import type { CardiacVector, LeadAxis, LeadName, Territory } from './types'

export const LEAD_ORDER: readonly LeadName[] = [
  'I',
  'II',
  'III',
  'aVR',
  'aVL',
  'aVF',
  'V1',
  'V2',
  'V3',
  'V4',
  'V5',
  'V6',
] as const

/** Classic diagnostic print / monitor grid. */
export const LEAD_PRINT_GRID: readonly (readonly LeadName[])[] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]

/** Limb + augmented + common six-lead teaching set. */
export const SIX_LEAD_SET: readonly LeadName[] = [
  'I',
  'II',
  'III',
  'aVR',
  'aVL',
  'aVF',
] as const

function frontal(angleDeg: number): Pick<LeadAxis, 'x' | 'y' | 'z'> {
  const r = (angleDeg * Math.PI) / 180
  return { x: Math.cos(r), y: Math.sin(r), z: 0 }
}

function normalize(x: number, y: number, z: number) {
  const L = Math.hypot(x, y, z) || 1
  return { x: x / L, y: y / L, z: z / L }
}

/** Heart electrical centre (ECG body coords: +x left, +y inferior, +z anterior). */
const HEART = { x: 0.08, y: 0.05, z: 0.15 }

const PRECORDIAL: Record<'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6', typeof HEART> =
  {
    V1: { x: -0.14, y: -0.22, z: 0.78 },
    V2: { x: 0.14, y: -0.2, z: 0.8 },
    V3: { x: 0.34, y: 0.02, z: 0.82 },
    V4: { x: 0.55, y: 0.28, z: 0.74 },
    V5: { x: 0.88, y: 0.28, z: 0.48 },
    V6: { x: 1.08, y: 0.28, z: 0.12 },
  }

function chest(name: keyof typeof PRECORDIAL): Pick<LeadAxis, 'x' | 'y' | 'z'> {
  const p = PRECORDIAL[name]
  return normalize(p.x - HEART.x, p.y - HEART.y, p.z - HEART.z)
}

const TERR: Record<LeadName, Territory> = {
  I: 'lateral',
  II: 'inferior',
  III: 'inferior',
  aVR: 'none',
  aVL: 'lateral',
  aVF: 'inferior',
  V1: 'septal',
  V2: 'anterior',
  V3: 'anterior',
  V4: 'anterior',
  V5: 'lateral',
  V6: 'lateral',
}

export const LEAD_AXES: readonly LeadAxis[] = [
  { name: 'I', ...frontal(0), territory: TERR.I },
  { name: 'II', ...frontal(60), territory: TERR.II },
  { name: 'III', ...frontal(120), territory: TERR.III },
  { name: 'aVR', ...frontal(-150), territory: TERR.aVR },
  { name: 'aVL', ...frontal(-30), territory: TERR.aVL },
  { name: 'aVF', ...frontal(90), territory: TERR.aVF },
  { name: 'V1', ...chest('V1'), territory: TERR.V1 },
  { name: 'V2', ...chest('V2'), territory: TERR.V2 },
  { name: 'V3', ...chest('V3'), territory: TERR.V3 },
  { name: 'V4', ...chest('V4'), territory: TERR.V4 },
  { name: 'V5', ...chest('V5'), territory: TERR.V5 },
  { name: 'V6', ...chest('V6'), territory: TERR.V6 },
]

export const LEAD_AXIS_BY_NAME = Object.fromEntries(
  LEAD_AXES.map((a) => [a.name, a]),
) as Record<LeadName, LeadAxis>

export function projectDipole(m: CardiacVector): Record<LeadName, number> {
  const out = {} as Record<LeadName, number>
  for (const a of LEAD_AXES) {
    out[a.name] = m.x * a.x + m.y * a.y + m.z * a.z
  }
  // Einthoven consistency
  out.III = out.II - out.I
  out.aVR = -0.5 * (out.I + out.II)
  out.aVL = out.I - 0.5 * out.II
  out.aVF = out.II - 0.5 * out.I
  return out
}
