/**
 * Cardiac electrical vector generator.
 *
 * Produces a single time-dependent dipole M(t) = [Mx, My, Mz] from the
 * conduction activation sequence. All 12 leads are later obtained by
 * projecting this same vector — never by independent PQRST curves.
 */

import {
  ATRIAL_ACTIVATION_DIRECTION,
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
    // Larger left / posterior forces.
    return addVec(
      freeWall,
      scaleVec({ x: 0.55, y: 0.1, z: -0.45 }, 0.9 * s),
    )
  }
  // RVH: right / anterior.
  return addVec(freeWall, scaleVec({ x: -0.55, y: 0.05, z: 0.65 }, 0.9 * s))
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
  const mag = 0.35 * params.injurySeverity * stWeight
  return {
    kind: 'injury_current',
    weight: stWeight,
    vector: scaleVec(dir, mag),
  }
}

/**
 * Instantaneous cardiac dipole at absolute time t (seconds).
 * Phase is taken modulo RR from the conduction plan.
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
  const atrialDir = rotateFrontalAxis(ATRIAL_ACTIVATION_DIRECTION, axis)
  const septalDir = rotateFrontalAxis(SEPTAL_ACTIVATION_DIRECTION, axis)
  let freeWallDir = rotateFrontalAxis(VENTRICULAR_ACTIVATION_DIRECTION, axis)
  freeWallDir = hypertrophyBias(p, freeWallDir)
  const basalDir = rotateFrontalAxis(BASAL_ACTIVATION_DIRECTION, axis)
  // T wave follows QRS direction (concordant) in the healthy model.
  const tDir = scaleVec(freeWallDir, 0.32)

  const pHalf = Math.max(0.025, (cplan.qrsOnset_s - cplan.pOnset_s) * 0.45)
  const atrialW = activationEnvelope(phase, cplan.pPeak_s, pHalf)

  const septalW = qrsEnvelope(
    phase,
    cplan.qrsOnset_s + cplan.qrs_s * 0.18,
    cplan.qrs_s * 0.35,
  )
  const apicalW = qrsEnvelope(phase, cplan.rPeak_s, cplan.qrs_s * 0.55)
  const basalW = qrsEnvelope(
    phase,
    cplan.qrsEnd_s - cplan.qrs_s * 0.15,
    cplan.qrs_s * 0.4,
  )

  const stWeight = (() => {
    const a = cplan.qrsEnd_s
    const b = cplan.tPeak_s - 0.02
    if (phase <= a || phase >= b) return 0
    const mid = (a + b) / 2
    const half = (b - a) / 2
    return activationEnvelope(phase, mid, half)
  })()

  const tHalf = Math.max(0.04, (cplan.tEnd_s - cplan.qrsEnd_s) * 0.4)
  const repolW = activationEnvelope(phase, cplan.tPeak_s, tHalf)

  // Peak magnitudes chosen so Lead II QRS ≈ 1.0–1.4 mV after projection.
  const contributions: VectorContribution[] = [
    {
      kind: 'atrial_depol',
      weight: atrialW,
      vector: scaleVec(atrialDir, 0.22 * atrialW),
    },
    {
      kind: 'septal_depol',
      weight: septalW,
      vector: scaleVec(septalDir, 0.35 * septalW),
    },
    {
      kind: 'apical_depol',
      weight: apicalW,
      vector: scaleVec(freeWallDir, 1.35 * apicalW),
    },
    {
      kind: 'basal_depol',
      weight: basalW,
      vector: scaleVec(basalDir, 0.28 * basalW),
    },
    {
      kind: 'ventricular_repol',
      weight: repolW,
      vector: scaleVec(tDir, 1.0 * repolW),
    },
  ]

  const injury = injuryContribution(p, Math.max(stWeight, repolW * 0.35))
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
