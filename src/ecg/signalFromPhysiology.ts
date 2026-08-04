/**
 * Physiology → cardiac dipole → lead voltages.
 *
 * Morphology uses sequenced clinical envelopes (P → septal → R → S → T)
 * timed to the shared sinus event schedule. The 3D glow Gaussians are NOT
 * reused as ECG amplitudes — that produced double-peaked QRS and weak T waves.
 */

import { heartbeatAt } from '../sim/heartbeatScheduler'
import { conductionStateFromEvents } from '../sim/conductionFromEvents'
import { DEFAULT_HEART_RATE_BPM } from '../sim/sinusTiming'
import { LEAD_ORDER, projectDipole } from './leads'
import {
  activationEnvelope,
  buildEcgConductionPlan,
  qrsEnvelope,
  tWaveEnvelope,
  type EcgConductionPlan,
} from './morphology'
import type { CardiacVector, ConductionState, LeadName } from './types'

export interface EcgSample {
  t: number
  leads: Readonly<Record<LeadName, number>>
  state: ConductionState
}

/** ECG body coords: +x left, +y inferior, +z anterior. */
const ATRIAL_EARLY: CardiacVector = { x: 0.25, y: 0.55, z: 0.45 }
const ATRIAL_LATE: CardiacVector = { x: 0.75, y: 0.55, z: -0.25 }
/** Early septal: left → right, anterior (q in I/V6, r in V1). */
const SEPTAL: CardiacVector = { x: -0.55, y: 0.12, z: 0.78 }
/** Main LV free-wall / apical vector ~+60° (Lead II). */
const FREE_WALL: CardiacVector = { x: 0.5, y: 0.866, z: -0.18 }
/** Late basal residual (terminal S forces). */
const BASAL: CardiacVector = { x: -0.22, y: -0.32, z: -0.3 }
/** T concordant with QRS, slightly more anterior. */
const REPOL: CardiacVector = { x: 0.48, y: 0.78, z: 0.08 }

function scale(v: CardiacVector, s: number): CardiacVector {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

function add(a: CardiacVector, b: CardiacVector): CardiacVector {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

/**
 * Instantaneous cardiac dipole from ECG morphology plan (phase within RR).
 *
 * Target Lead II surface amplitudes after projection:
 *   P ≈ 0.15–0.25 mV · R ≈ 1.0–1.4 mV · T ≈ 0.25–0.4 mV
 */
export function dipoleFromPlan(
  phase: number,
  plan: EcgConductionPlan,
): CardiacVector {
  const pHalf = Math.max(0.035, (plan.pEnd_s - plan.pOnset_s) * 0.5)
  const earlyP = activationEnvelope(
    phase,
    plan.pOnset_s + (plan.pPeak_s - plan.pOnset_s) * 0.55,
    pHalf * 0.85,
  )
  const lateP = activationEnvelope(
    phase,
    plan.pPeak_s + (plan.pEnd_s - plan.pPeak_s) * 0.3,
    pHalf * 0.9,
  )

  // Sequenced QRS (septal → free-wall → basal).
  // Soft envelopes + strong free-wall scale so R reads taller than T on paper.
  const septalW = qrsEnvelope(phase, plan.septalPeak_s, plan.qrs_s * 0.45, 1.4)
  const apicalW = qrsEnvelope(phase, plan.rPeak_s, plan.qrs_s * 0.7, 1.45)
  const basalW = qrsEnvelope(phase, plan.sPeak_s, plan.qrs_s * 0.5, 1.35)

  const tWidth = Math.max(0.06, plan.tEnd_s - plan.qrsEnd_s)
  const repolW = tWaveEnvelope(phase, plan.tPeak_s, tWidth)

  let m: CardiacVector = { x: 0, y: 0, z: 0 }
  m = add(m, scale(ATRIAL_EARLY, 0.2 * earlyP))
  m = add(m, scale(ATRIAL_LATE, 0.26 * lateP))
  m = add(m, scale(SEPTAL, 0.5 * septalW))
  m = add(m, scale(FREE_WALL, 1.5 * apicalW))
  m = add(m, scale(BASAL, 0.5 * basalW))
  m = add(m, scale(REPOL, 0.22 * repolW))
  return m
}

/** One simultaneous 12-lead sample at absolute simulation time t. */
export function sampleEcgAt(
  t: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): EcgSample {
  const beat = heartbeatAt(t, rateBpm)
  const state = conductionStateFromEvents(t, beat)
  const plan = buildEcgConductionPlan(rateBpm)
  const phase = t - beat.t0
  const dipole = dipoleFromPlan(phase, plan)
  return {
    t,
    leads: projectDipole(dipole),
    state,
  }
}

/** Rising-edge helper near R peak for beat markers. */
export function isNearVentricularPeak(
  state: ConductionState,
  threshold = 0.85,
): boolean {
  // Prefer morphology R detection via sample path; this remains for glow sync.
  return state.apicalDepol >= threshold
}

/**
 * True near the ECG R peak (morphology), used by the recorder for annotations.
 */
export function isNearMorphologyRPeak(
  t: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
  window_s = 0.012,
): boolean {
  const beat = heartbeatAt(t, rateBpm)
  const plan = buildEcgConductionPlan(rateBpm)
  const rAbs = beat.t0 + plan.rPeak_s
  return Math.abs(t - rAbs) <= window_s
}

export function emptyLeadMap(value = 0): Record<LeadName, number> {
  const out = {} as Record<LeadName, number>
  for (const name of LEAD_ORDER) out[name] = value
  return out
}
