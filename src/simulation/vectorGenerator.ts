/**
 * Cardiac electrical vector generator (physiological VCG teaching model).
 *
 * One dipole M(t) is composed from sequential activation contributions.
 * All 12 leads are later projections of this same vector.
 *
 * Wave-forming sequence (healthy adult):
 *   1. Atrial depol — RA then LA  → P wave
 *   2. Septal depol — right/anterior → early q / r
 *   3. Free-wall depol — left/inferior/posterior → R
 *   4. Basal residual — terminal S forces
 *   5. ST isoelectric (or injury current)
 *   6. Repolarization — concordant T
 */

import {
  ATRIAL_EARLY_DIRECTION,
  ATRIAL_LATE_DIRECTION,
  BASAL_ACTIVATION_DIRECTION,
  SEPTAL_ACTIVATION_DIRECTION,
  TERRITORY_INJURY_DIRECTION,
  VENTRICULAR_ACTIVATION_DIRECTION,
  addVec,
  rotateFrontalAxis,
  scaleVec,
} from './cardiacModel'
import {
  activationEnvelope,
  buildConductionPlan,
  qrsEnvelope,
  tWaveEnvelope,
  type ConductionPlan,
} from './conductionSystem'
import type {
  CardiacVector,
  InstantaneousField,
  SimulationParams,
  VectorContribution,
} from './types'
import { DEFAULT_SIM_PARAMS } from './types'

function hypertrophyBias(
  params: SimulationParams,
  freeWall: CardiacVector,
): CardiacVector {
  const s = params.hypertrophySeverity
  if (s <= 0 || params.hypertrophy === 'none') return freeWall
  if (params.hypertrophy === 'lvh') {
    return addVec(
      freeWall,
      scaleVec({ x: 0.55, y: 0.08, z: -0.5 }, 1.0 * s),
    )
  }
  return addVec(freeWall, scaleVec({ x: -0.6, y: 0.05, z: 0.7 }, 1.0 * s))
}

function injuryContribution(
  params: SimulationParams,
  stWeight: number,
): VectorContribution | null {
  if (
    params.injuryLocation === 'none' ||
    params.injurySeverity <= 0 ||
    stWeight <= 0
  ) {
    return null
  }
  const dir = TERRITORY_INJURY_DIRECTION[params.injuryLocation]
  const mag = 0.45 * params.injurySeverity * stWeight
  return {
    kind: 'injury_current',
    weight: stWeight,
    vector: scaleVec(dir, mag),
  }
}

/**
 * Instantaneous cardiac dipole at absolute time t (seconds).
 */
export function sampleCardiacVector(
  t: number,
  params: SimulationParams = DEFAULT_SIM_PARAMS,
  plan?: ConductionPlan,
): InstantaneousField {
  const p = { ...DEFAULT_SIM_PARAMS, ...params }
  const cplan = plan ?? buildConductionPlan(p)
  const phase = ((t % cplan.rr_s) + cplan.rr_s) % cplan.rr_s

  const axis = p.cardiacAxis_deg

  // Atrial axis is anatomically ~+50° and does NOT follow ventricular axis.
  const atrialEarly = ATRIAL_EARLY_DIRECTION
  const atrialLate = ATRIAL_LATE_DIRECTION

  // Septal forces are mostly anatomical (left→right); do not follow QRS axis.
  const septalDir = SEPTAL_ACTIVATION_DIRECTION

  let freeWallDir = rotateFrontalAxis(VENTRICULAR_ACTIVATION_DIRECTION, axis)
  freeWallDir = hypertrophyBias(p, freeWallDir)
  const basalDir = rotateFrontalAxis(BASAL_ACTIVATION_DIRECTION, axis)

  // T: concordant with QRS, slightly more anterior / left (normal adult).
  const tDir = addVec(
    scaleVec(freeWallDir, 0.9),
    scaleVec({ x: 0.08, y: 0.02, z: 0.2 }, 1),
  )

  // --- Envelopes (non-overlapping P vs QRS; sequenced QRS parts) ---
  const pWidth = Math.max(0.035, (cplan.pEnd_s - cplan.pOnset_s) * 0.5)
  const earlyP = activationEnvelope(
    phase,
    cplan.pOnset_s + (cplan.pPeak_s - cplan.pOnset_s) * 0.55,
    pWidth * 0.85,
  )
  const lateP = activationEnvelope(
    phase,
    cplan.pPeak_s + (cplan.pEnd_s - cplan.pPeak_s) * 0.25,
    pWidth * 0.9,
  )

  const septalW = qrsEnvelope(
    phase,
    cplan.septalPeak_s,
    cplan.qrs_s * 0.38,
    2.0,
  )
  const apicalW = qrsEnvelope(phase, cplan.rPeak_s, cplan.qrs_s * 0.52, 2.2)
  const basalW = qrsEnvelope(phase, cplan.sPeak_s, cplan.qrs_s * 0.42, 1.8)

  const stWeight = (() => {
    const a = cplan.qrsEnd_s + 0.008
    const b = cplan.tPeak_s - 0.035
    if (phase <= a || phase >= b) return 0
    const mid = (a + b) / 2
    const half = Math.max(0.02, (b - a) / 2)
    return activationEnvelope(phase, mid, half)
  })()

  const tWidth = Math.max(0.055, cplan.tEnd_s - cplan.qrsEnd_s)
  const repolW = tWaveEnvelope(phase, cplan.tPeak_s, tWidth)

  /**
   * Peak scales (body-surface mV after typical Lead II projection):
   *   P  ≈ 0.20–0.28 mV
   *   R  ≈ 1.1–1.6 mV
   *   T  ≈ 0.30–0.45 mV
   */
  const atrialVec = addVec(
    scaleVec(atrialEarly, 0.2 * earlyP),
    scaleVec(atrialLate, 0.28 * lateP),
  )
  const atrialW = Math.max(earlyP, lateP)

  const contributions: VectorContribution[] = [
    {
      kind: 'atrial_depol',
      weight: atrialW,
      vector: atrialVec,
    },
    {
      kind: 'septal_depol',
      weight: septalW,
      // Strong enough for visible q in I/V6 and r in V1.
      vector: scaleVec(septalDir, 0.55 * septalW),
    },
    {
      kind: 'apical_depol',
      weight: apicalW,
      vector: scaleVec(freeWallDir, 1.55 * apicalW),
    },
    {
      kind: 'basal_depol',
      weight: basalW,
      vector: scaleVec(basalDir, 0.45 * basalW),
    },
    {
      kind: 'ventricular_repol',
      weight: repolW,
      // T ~ 25–35% of R after projection.
      vector: scaleVec(tDir, 0.38 * repolW),
    },
  ]

  const injury = injuryContribution(p, Math.max(stWeight, repolW * 0.25))
  if (injury) contributions.push(injury)

  let dipole: CardiacVector = { x: 0, y: 0, z: 0 }
  for (const c of contributions) {
    dipole = addVec(dipole, c.vector)
  }

  return { t, dipole, contributions }
}

/** Sample M(t) over [t0, t0+duration) at fixed fs. */
export function sampleCardiacVectorSeries(
  params: SimulationParams = DEFAULT_SIM_PARAMS,
  t0 = 0,
): { times: Float64Array; fields: InstantaneousField[]; plan: ConductionPlan } {
  const p = { ...DEFAULT_SIM_PARAMS, ...params }
  const plan = buildConductionPlan(p)
  const n = Math.max(1, Math.round(p.duration_s * p.sampleRate_Hz))
  const times = new Float64Array(n)
  const fields: InstantaneousField[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const t = t0 + i / p.sampleRate_Hz
    times[i] = t
    fields[i] = sampleCardiacVector(t, p, plan)
  }
  return { times, fields, plan }
}
