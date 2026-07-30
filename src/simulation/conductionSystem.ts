/**
 * Simplified cardiac conduction sequence.
 *
 * SA → atria → AV delay → His → bundles → Purkinje → ventricular depol
 * → ST → ventricular repolarization
 *
 * Timings are physiologically meaningful and respond to conductionVelocity,
 * prScale, and qrsScale. Stages drive M(t) magnitudes — not per-lead curves.
 */

import { cycleLength_s } from '../sim/sinusTiming'
import type { SimulationParams } from './types'

export type ConductionStageId =
  | 'sa'
  | 'atrial'
  | 'av'
  | 'his'
  | 'bundle'
  | 'purkinje'
  | 'ventricular'
  | 'st'
  | 'repolarization'
  | 'diastole'

export interface ConductionStage {
  id: ConductionStageId
  /** Onset relative to SA / cycle start (seconds). */
  onset_s: number
  /** Approximate duration of the electrical contribution (seconds). */
  duration_s: number
  label: string
}

export interface ConductionPlan {
  rate_bpm: number
  rr_s: number
  /** P onset (atrial depolarization start). */
  pOnset_s: number
  /** Approximate P peak. */
  pPeak_s: number
  /** QRS onset (His / early septal). */
  qrsOnset_s: number
  /** R peak (main free-wall vector). */
  rPeak_s: number
  /** QRS end / J point. */
  qrsEnd_s: number
  /** ST midpoint. */
  stMid_s: number
  /** T peak. */
  tPeak_s: number
  /** T end. */
  tEnd_s: number
  pr_s: number
  qrs_s: number
  qt_s: number
  stages: readonly ConductionStage[]
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Build one-cycle conduction timings from simulation parameters.
 * Offsets are relative to SA onset (t_cycle = 0).
 */
export function buildConductionPlan(params: SimulationParams): ConductionPlan {
  const rate = clamp(params.heartRate_bpm, 30, 220)
  const rr = cycleLength_s(rate)
  const vel = clamp(params.conductionVelocity, 0.35, 2.5)
  const prScale = clamp(params.prScale, 0.5, 2.5)
  const qrsScale = clamp(params.qrsScale, 0.6, 2.5)

  // Base healthy timings (velocity = 1).
  const sa = 0
  const atrialOnset = 0.02
  const pWidth = 0.09 / vel
  const avDelay = (0.1 * prScale) / vel
  const hisOnset = atrialOnset + 0.04 + avDelay
  const septalDur = (0.018 * qrsScale) / vel
  const freeWallDur = (0.055 * qrsScale) / vel
  const basalDur = (0.02 * qrsScale) / vel
  const qrsOnset = hisOnset
  const rPeak = qrsOnset + septalDur + freeWallDur * 0.45
  const qrsEnd = qrsOnset + septalDur + freeWallDur + basalDur
  const stDur = clamp(0.08 + (rr - 0.6) * 0.04, 0.05, 0.14)
  const tWidth = clamp(0.14 + (rr - 0.6) * 0.05, 0.1, 0.2)
  const tPeak = qrsEnd + stDur + tWidth * 0.35
  const tEnd = qrsEnd + stDur + tWidth

  const pOnset = atrialOnset
  const pPeak = atrialOnset + pWidth * 0.45
  const pr = qrsOnset - pOnset
  const qrs = qrsEnd - qrsOnset
  const qt = tEnd - qrsOnset

  const stages: ConductionStage[] = [
    { id: 'sa', onset_s: sa, duration_s: 0.03, label: 'SA node activation' },
    {
      id: 'atrial',
      onset_s: atrialOnset,
      duration_s: pWidth,
      label: 'Atrial depolarization',
    },
    {
      id: 'av',
      onset_s: atrialOnset + pWidth * 0.6,
      duration_s: avDelay,
      label: 'AV node delay',
    },
    {
      id: 'his',
      onset_s: hisOnset,
      duration_s: 0.015 / vel,
      label: 'His bundle conduction',
    },
    {
      id: 'bundle',
      onset_s: hisOnset + 0.01 / vel,
      duration_s: septalDur,
      label: 'Bundle branches',
    },
    {
      id: 'purkinje',
      onset_s: hisOnset + septalDur * 0.5,
      duration_s: freeWallDur,
      label: 'Purkinje activation',
    },
    {
      id: 'ventricular',
      onset_s: qrsOnset + septalDur * 0.4,
      duration_s: freeWallDur + basalDur,
      label: 'Ventricular depolarization',
    },
    {
      id: 'st',
      onset_s: qrsEnd,
      duration_s: stDur,
      label: 'ST segment',
    },
    {
      id: 'repolarization',
      onset_s: qrsEnd + stDur * 0.5,
      duration_s: tWidth,
      label: 'Ventricular repolarization',
    },
  ]

  return {
    rate_bpm: rate,
    rr_s: rr,
    pOnset_s: pOnset,
    pPeak_s: pPeak,
    qrsOnset_s: qrsOnset,
    rPeak_s: rPeak,
    qrsEnd_s: qrsEnd,
    stMid_s: qrsEnd + stDur * 0.5,
    tPeak_s: tPeak,
    tEnd_s: tEnd,
    pr_s: pr,
    qrs_s: qrs,
    qt_s: qt,
    stages,
  }
}

/** Smooth raised-cosine / Tukey-like pulse in [0,1] over [center±halfWidth]. */
export function activationEnvelope(
  t: number,
  center: number,
  halfWidth: number,
  skew = 0,
): number {
  if (halfWidth <= 1e-6) return 0
  const c = center + skew * halfWidth * 0.25
  const x = (t - c) / halfWidth
  if (x <= -1 || x >= 1) return 0
  // Cosine lobe — continuous and differentiable enough for ECG teaching.
  return 0.5 * (1 + Math.cos(Math.PI * x))
}

/** Asymmetric QRS-like spike: faster upstroke, slightly slower downstroke. */
export function qrsEnvelope(t: number, peak: number, width: number): number {
  if (width <= 1e-6) return 0
  const up = width * 0.35
  const down = width * 0.65
  if (t < peak - up || t > peak + down) return 0
  if (t <= peak) {
    const x = (t - (peak - up)) / up
    return Math.sin((x * Math.PI) / 2) ** 1.2
  }
  const x = (t - peak) / down
  return Math.cos((x * Math.PI) / 2) ** 1.1
}

export function stageAt(plan: ConductionPlan, phase_s: number): ConductionStageId {
  if (phase_s < plan.pOnset_s) return 'sa'
  if (phase_s < plan.qrsOnset_s) {
    const av = plan.stages.find((s) => s.id === 'av')
    if (av && phase_s >= av.onset_s) return 'av'
    return 'atrial'
  }
  if (phase_s < plan.qrsEnd_s) {
    if (phase_s < plan.qrsOnset_s + plan.qrs_s * 0.25) return 'bundle'
    return 'ventricular'
  }
  if (phase_s < plan.tPeak_s - 0.02) return 'st'
  if (phase_s < plan.tEnd_s) return 'repolarization'
  return 'diastole'
}
