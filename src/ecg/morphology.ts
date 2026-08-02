/**
 * Clinical ECG morphology envelopes + one-cycle conduction plan.
 *
 * Timings align with the shared sinus event schedule (SA → atria → AV → His
 * → ventricle → repolarization) so the monitor stays locked to 3D glow,
 * but envelopes are ECG-specific — not the wide animation Gaussians.
 */

import { cycleLength_s, DEFAULT_HEART_RATE_BPM, SINUS_OFFSET_S } from '../sim/sinusTiming'

export interface EcgConductionPlan {
  rate_bpm: number
  rr_s: number
  pOnset_s: number
  pPeak_s: number
  pEnd_s: number
  qrsOnset_s: number
  septalPeak_s: number
  rPeak_s: number
  sPeak_s: number
  qrsEnd_s: number
  tPeak_s: number
  tEnd_s: number
  pr_s: number
  qrs_s: number
  qt_s: number
}

/** Raised-cosine lobe on [center − halfWidth, center + halfWidth]. */
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
 * Asymmetric QRS spike: faster upstroke, slightly slower downstroke.
 * `sharpness` > 1 narrows the peak toward a clinical R morphology.
 */
export function qrsEnvelope(
  t: number,
  peak: number,
  width: number,
  sharpness = 1.8,
): number {
  if (width <= 1e-6) return 0
  const up = width * 0.3
  const down = width * 0.7
  if (t < peak - up || t > peak + down) return 0
  if (t <= peak) {
    const x = (t - (peak - up)) / up
    return Math.sin((x * Math.PI) / 2) ** sharpness
  }
  const x = (t - peak) / down
  return Math.cos((x * Math.PI) / 2) ** (sharpness * 0.85)
}

/** Broad T wave with slower descending limb. */
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

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Build ECG timings relative to SA onset (phase 0).
 * Anchors match SINUS_OFFSET_S so P/QRS/T track the teaching events.
 */
export function buildEcgConductionPlan(
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
): EcgConductionPlan {
  const rate = clamp(rateBpm, 30, 220)
  const rr = cycleLength_s(rate)

  // P: ~90 ms, peak near atrial event (40 ms).
  const pOnset = 0.02
  const pPeak = SINUS_OFFSET_S.atrial
  const pEnd = pOnset + 0.09

  // QRS starts at His (~200 ms); clinical QRS ~90 ms (still <120 ms).
  const qrsOnset = SINUS_OFFSET_S.his
  const qrs = 0.092
  const septalPeak = qrsOnset + 0.016
  const rPeak = qrsOnset + 0.04
  const sPeak = qrsOnset + 0.068
  const qrsEnd = qrsOnset + qrs

  // ST then T. Aim QT ≈ 360–400 ms at 60–80 bpm (still after QRS).
  const stDur = clamp(0.07 + (rr - 0.8) * 0.05, 0.05, 0.12)
  const tWidth = clamp(0.18 + (rr - 0.8) * 0.08, 0.14, 0.26)
  // Teaching glow uses 350 ms for "repolarization start"; T peak is later.
  const tPeak = qrsEnd + stDur + tWidth * 0.4
  const tEnd = Math.min(tPeak + tWidth * 0.6, rr - 0.02)

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
    tPeak_s: tPeak,
    tEnd_s: tEnd,
    pr_s: qrsOnset - pOnset,
    qrs_s: qrs,
    qt_s: tEnd - qrsOnset,
  }
}
