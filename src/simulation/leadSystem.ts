/**
 * 12-lead ECG measurement model.
 *
 * ECG_lead(t) = dot(M(t), LeadVector)
 *
 * Limb leads use Einthoven / Goldberger angles in the frontal plane.
 * Precordial leads use normalize(electrode_position − heart_center).
 */

import { HEART_CENTER, dot, normalize, sub } from './cardiacModel'
import type {
  CardiacVector,
  LeadAxis,
  LeadName,
  LeadVoltages,
  TerritoryId,
  Vec3,
} from './types'
import { LEAD_ORDER } from './types'

function frontalLead(angleDeg: number): Vec3 {
  const r = (angleDeg * Math.PI) / 180
  return { x: Math.cos(r), y: Math.sin(r), z: 0 }
}

/**
 * Anatomical chest electrode positions (ECG body coordinates).
 * Derived from clinical placements / existing torso electrode map:
 *   x left (+), y inferior (+), z anterior (+)
 *
 * V1: 4th ICS right sternal border
 * V2: 4th ICS left sternal border
 * V3: between V2 and V4
 * V4: 5th ICS midclavicular line
 * V5: anterior axillary line (V4 level)
 * V6: midaxillary line (V4 level)
 */
export const PRECORDIAL_ELECTRODES: Record<
  'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6',
  Vec3
> = {
  V1: { x: -0.14, y: -0.22, z: 0.78 },
  V2: { x: 0.14, y: -0.2, z: 0.8 },
  V3: { x: 0.34, y: 0.02, z: 0.82 },
  V4: { x: 0.55, y: 0.28, z: 0.74 },
  V5: { x: 0.88, y: 0.28, z: 0.48 },
  V6: { x: 1.08, y: 0.28, z: 0.12 },
}

function precordialAxis(pos: Vec3): Vec3 {
  return normalize(sub(pos, HEART_CENTER))
}

const LIMB_TERRITORY: Record<
  'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF',
  TerritoryId
> = {
  I: 'lateral',
  II: 'inferior',
  III: 'inferior',
  aVR: 'none',
  aVL: 'lateral',
  aVF: 'inferior',
}

const PRECORDIAL_TERRITORY: Record<
  'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6',
  TerritoryId
> = {
  V1: 'septal',
  V2: 'anterior',
  V3: 'anterior',
  V4: 'anterior',
  V5: 'lateral',
  V6: 'lateral',
}

/**
 * Build the full set of unit lead vectors.
 * Limb: Einthoven angles. Augmented: Goldberger equivalents.
 * Chest: anatomical electrode − heart centre.
 */
export function buildLeadAxes(): readonly LeadAxis[] {
  const limb: LeadAxis[] = [
    { name: 'I', axis: frontalLead(0), territory: LIMB_TERRITORY.I },
    { name: 'II', axis: frontalLead(60), territory: LIMB_TERRITORY.II },
    { name: 'III', axis: frontalLead(120), territory: LIMB_TERRITORY.III },
    { name: 'aVR', axis: frontalLead(-150), territory: LIMB_TERRITORY.aVR },
    { name: 'aVL', axis: frontalLead(-30), territory: LIMB_TERRITORY.aVL },
    { name: 'aVF', axis: frontalLead(90), territory: LIMB_TERRITORY.aVF },
  ]

  const chest: LeadAxis[] = (
    ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as const
  ).map((name) => ({
    name,
    axis: precordialAxis(PRECORDIAL_ELECTRODES[name]),
    territory: PRECORDIAL_TERRITORY[name],
  }))

  return [...limb, ...chest]
}

export const LEAD_AXES: readonly LeadAxis[] = buildLeadAxes()

export const LEAD_AXIS_BY_NAME: Record<LeadName, LeadAxis> = Object.fromEntries(
  LEAD_AXES.map((a) => [a.name, a]),
) as Record<LeadName, LeadAxis>

/** Project one dipole onto every lead: V = M · a_lead */
export function projectDipoleToLeads(m: CardiacVector): LeadVoltages {
  const out = {} as Record<LeadName, number>
  for (const axis of LEAD_AXES) {
    out[axis.name] = dot(m, axis.axis)
  }
  return out
}

/**
 * Enforce Einthoven / Goldberger algebraic consistency on limb leads.
 * I & II from projection; III / aVR / aVL / aVF derived.
 */
export function projectDipoleToLeadsConsistent(m: CardiacVector): LeadVoltages {
  const I = dot(m, LEAD_AXIS_BY_NAME.I.axis)
  const II = dot(m, LEAD_AXIS_BY_NAME.II.axis)
  const III = II - I
  const aVR = -(I + II) / 2
  const aVL = I - II / 2
  const aVF = II - I / 2

  const out: Record<LeadName, number> = {
    I,
    II,
    III,
    aVR,
    aVL,
    aVF,
    V1: 0,
    V2: 0,
    V3: 0,
    V4: 0,
    V5: 0,
    V6: 0,
  }

  for (const name of ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as const) {
    out[name] = dot(m, LEAD_AXIS_BY_NAME[name].axis)
  }
  return out
}

export function emptyLeadVoltages(): LeadVoltages {
  const out = {} as Record<LeadName, number>
  for (const name of LEAD_ORDER) out[name] = 0
  return out
}
