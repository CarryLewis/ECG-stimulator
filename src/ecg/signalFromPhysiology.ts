/**
 * Physiology → cardiac dipole → lead voltages.
 *
 * The recorder calls `sampleEcgAt(t)` each sample tick.
 * Intensities come from the same event schedule that drives 3D conduction glow.
 * This module does NOT invent an independent animation timeline.
 */

import { conductionStateFromEvents } from '../sim/conductionFromEvents'
import { heartbeatAt } from '../sim/heartbeatScheduler'
import { DEFAULT_HEART_RATE_BPM } from '../sim/sinusTiming'
import { projectDipole } from './leads'
import type { CardiacVector, ConductionState, LeadName } from './types'
import { LEAD_ORDER } from './leads'

export interface EcgSample {
  t: number
  leads: Readonly<Record<LeadName, number>>
  state: ConductionState
}

/** Teaching VCG directions (ECG body coords). */
const ATRIAL: CardiacVector = { x: 0.55, y: 0.7, z: 0.15 }
const SEPTAL: CardiacVector = { x: -0.55, y: 0.1, z: 0.8 }
const APICAL: CardiacVector = { x: 0.5, y: 0.866, z: -0.22 }
const BASAL: CardiacVector = { x: -0.25, y: -0.35, z: -0.35 }
const REPOL: CardiacVector = { x: 0.48, y: 0.75, z: 0.05 }

function scale(v: CardiacVector, s: number): CardiacVector {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

function add(a: CardiacVector, b: CardiacVector): CardiacVector {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

/**
 * Compose instantaneous dipole from conduction wavefront intensities.
 * Same physiological anchors as the 3D heart glow.
 */
export function dipoleFromConduction(state: ConductionState): CardiacVector {
  let m: CardiacVector = { x: 0, y: 0, z: 0 }
  m = add(m, scale(ATRIAL, 0.28 * state.atrialDepol))
  m = add(m, scale(SEPTAL, 0.5 * state.septalDepol))
  m = add(m, scale(APICAL, 1.55 * state.apicalDepol))
  m = add(m, scale(BASAL, 0.42 * state.basalDepol))
  m = add(m, scale(REPOL, 0.38 * state.repol))
  return m
}

/** One simultaneous 12-lead sample at absolute simulation time t. */
export function sampleEcgAt(
  t: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): EcgSample {
  const beat = heartbeatAt(t, rateBpm)
  const state = conductionStateFromEvents(t, beat)
  const dipole = dipoleFromConduction(state)
  return {
    t,
    leads: projectDipole(dipole),
    state,
  }
}

/** Detect likely R-peak near ventricular activation for annotations. */
export function isNearVentricularPeak(
  state: ConductionState,
  threshold = 0.85,
): boolean {
  return state.apicalDepol >= threshold
}

export function emptyLeadMap(value = 0): Record<LeadName, number> {
  const out = {} as Record<LeadName, number>
  for (const name of LEAD_ORDER) out[name] = value
  return out
}
