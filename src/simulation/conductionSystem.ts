/**
 * Simplified cardiac conduction sequence with distinct P / QRS / T windows.
 *
 * SA → atria → AV delay → His → bundles → Purkinje → ventricular depol
 * → ST → ventricular repolarization
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
  onset_s: number
  duration_s: number
  label: string
}

export interface ConductionPlan {
  rate_bpm: number
  rr_s: number
  pOnset_s: number
  pPeak_s: number
  /** End of atrial electrical contribution (isoelectric PR segment starts). */
  pEnd_s: number
  qrsOnset_s: number
  /** Early septal peak (q / r). */
  septalPeak_s: number
  rPeak_s: number
  /** Late basal / S-wave peak. */
  sPeak_s: number
  qrsEnd_s: number
  stMid_s: number
  tPeak_s: number
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

  const sa = 0
  // Clinical P ~80–100 ms; keep clearly separated from QRS by PR segment.
  const pOnset = 0.02
  const pWidth = clamp(0.095 / vel, 0.07, 0.14)
  const pPeak = pOnset + pWidth * 0.42
  const pEnd = pOnset + pWidth

  // AV delay so PR (P onset → QRS) lands in 120–200 ms at defaults.
  const avDelay = clamp((0.085 * prScale) / vel, 0.04, 0.22)
  const qrsOnset = pEnd + avDelay

  // QRS: septal → free wall → basal, total <120 ms at qrsScale=1.
  const septalDur = clamp((0.02 * qrsScale) / vel, 0.012, 0.04)
  const freeWallDur = clamp((0.05 * qrsScale) / vel, 0.03, 0.09)
  const basalDur = clamp((0.022 * qrsScale) / vel, 0.012, 0.045)
  const septalPeak = qrsOnset + septalDur * 0.55
  const rPeak = qrsOnset + septalDur + freeWallDur * 0.4
  const sPeak = qrsOnset + septalDur + freeWallDur + basalDur * 0.45
  const qrsEnd = qrsOnset + septalDur + freeWallDur + basalDur

  const stDur = clamp(0.06 + (rr - 0.6) * 0.03, 0.04, 0.12)
  const tWidth = clamp(0.16 + (rr - 0.6) * 0.06, 0.12, 0.22)
  const tPeak = qrsEnd + stDur + tWidth * 0.4
  const tEnd = qrsEnd + stDur + tWidth

  const pr = qrsOnset - pOnset
  const qrs = qrsEnd - qrsOnset
  const qt = tEnd - qrsOnset

  const stages: ConductionStage[] = [
    { id: 'sa', onset_s: sa, duration_s: 0.025, label: 'SA node activation' },
    {
      id: 'atrial',
      onset_s: pOnset,
      duration_s: pWidth,
      label: 'Atrial depolarization',
    },
    {
      id: 'av',
      onset_s: pEnd,
      duration_s: avDelay,
      label: 'AV node delay',
    },
    {
      id: 'his',
      onset_s: qrsOnset - 0.008 / vel,
      duration_s: 0.012 / vel,
      label: 'His bundle conduction',
    },
    {
      id: 'bundle',
      onset_s: qrsOnset,
      duration_s: septalDur,
      label: 'Bundle branches / septal',
    },
    {
      id: 'purkinje',
      onset_s: qrsOnset + septalDur * 0.4,
      duration_s: freeWallDur,
      label: 'Purkinje activation',
    },
    {
      id: 'ventricular',
      onset_s: qrsOnset + septalDur * 0.5,
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
      onset_s: qrsEnd + stDur * 0.35,
      duration_s: tWidth,
      label: 'Ventricular repolarization',
    },
  ]

  return {
    rate_bpm: rate,
    rr_s: rr,
    pOnset_s: pOnset,
    pPeak_s: pPeak,
    pEnd_s: pEnd,
    qrsOnset_s: qrsOnset,
    septalPeak_s: septalPeak,
    rPeak_s: rPeak,
    sPeak_s: sPeak,
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

/** Smooth cosine lobe on [center − halfWidth, center + halfWidth]. */
export function activationEnvelope(
  t: number,
  center: number,
  halfWidth: number,
): number {
  if (halfWidth <= 1e-6) return 0
  const x = (t - center) / halfWidth
  if (x <= -1 || x >= 1) return 0
  return 0.5 * (1 + Math.cos(Math.PI * x))
}

/**
 * Asymmetric spike for QRS components.
 * `sharpness` > 1 narrows the peak for a more clinical R morphology.
 */
export function qrsEnvelope(
  t: number,
  peak: number,
  width: number,
  sharpness = 1.6,
): number {
  if (width <= 1e-6) return 0
  const up = width * 0.32
  const down = width * 0.68
  if (t < peak - up || t > peak + down) return 0
  if (t <= peak) {
    const x = (t - (peak - up)) / up
    return Math.sin((x * Math.PI) / 2) ** sharpness
  }
  const x = (t - peak) / down
  return Math.cos((x * Math.PI) / 2) ** (sharpness * 0.85)
}

/** Broad, slightly asymmetric T-wave lobe (slower downslope). */
export function tWaveEnvelope(t: number, peak: number, width: number): number {
  if (width <= 1e-6) return 0
  const up = width * 0.42
  const down = width * 0.58
  if (t < peak - up || t > peak + down) return 0
  if (t <= peak) {
    const x = (t - (peak - up)) / up
    return Math.sin((x * Math.PI) / 2) ** 1.15
  }
  const x = (t - peak) / down
  return Math.cos((x * Math.PI) / 2) ** 1.35
}

export function stageAt(plan: ConductionPlan, phase_s: number): ConductionStageId {
  if (phase_s < plan.pOnset_s) return 'sa'
  if (phase_s < plan.pEnd_s) return 'atrial'
  if (phase_s < plan.qrsOnset_s) return 'av'
  if (phase_s < plan.qrsEnd_s) {
    if (phase_s < plan.septalPeak_s + plan.qrs_s * 0.05) return 'bundle'
    return 'ventricular'
  }
  if (phase_s < plan.tPeak_s - plan.qt_s * 0.08) return 'st'
  if (phase_s < plan.tEnd_s) return 'repolarization'
  return 'diastole'
}
