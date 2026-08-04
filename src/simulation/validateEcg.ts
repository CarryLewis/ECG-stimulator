/**
 * Physiological validation of generated 12-lead ECG strips.
 *
 * Checks limb polarity, precordial R-wave progression, and interval ranges
 * before visualization consumes the signals.
 */

import type {
  EcgStrip,
  EcgValidationResult,
  LeadName,
  ValidationIssue,
} from './types'

function meanWindow(
  samples: Float32Array,
  fs: number,
  t0: number,
  center: number,
  halfWidth_s: number,
): number {
  const i0 = Math.max(
    0,
    Math.floor((center - halfWidth_s - t0) * fs),
  )
  const i1 = Math.min(
    samples.length - 1,
    Math.ceil((center + halfWidth_s - t0) * fs),
  )
  if (i1 < i0) return 0
  let sum = 0
  let n = 0
  for (let i = i0; i <= i1; i++) {
    sum += samples[i]
    n++
  }
  return n ? sum / n : 0
}

/** Net QRS polarity ≈ signed area around R peak. */
function qrsPolarity(
  strip: EcgStrip,
  lead: LeadName,
  rPeak: number,
): number {
  return meanWindow(strip.leads[lead], strip.fs, strip.t0, rPeak, 0.04)
}

function peakAround(
  samples: Float32Array,
  fs: number,
  t0: number,
  center: number,
  halfWidth_s: number,
): number {
  const i0 = Math.max(0, Math.floor((center - halfWidth_s - t0) * fs))
  const i1 = Math.min(
    samples.length - 1,
    Math.ceil((center + halfWidth_s - t0) * fs),
  )
  let peak = 0
  for (let i = i0; i <= i1; i++) {
    const v = samples[i]
    if (Math.abs(v) > Math.abs(peak)) peak = v
  }
  return peak
}

export function validateEcgStrip(strip: EcgStrip): EcgValidationResult {
  const issues: ValidationIssue[] = []
  const rPeak =
    strip.ventricularBeats[0] ?? strip.t0 + strip.rr_s * 0.35
  const pPeak =
    strip.atrialBeats[0] != null
      ? strip.atrialBeats[0] + 0.04
      : rPeak - strip.intervals.pr_s + 0.04

  const leadII = qrsPolarity(strip, 'II', rPeak)
  const aVR = qrsPolarity(strip, 'aVR', rPeak)
  const leadI = qrsPolarity(strip, 'I', rPeak)
  const v1 = qrsPolarity(strip, 'V1', rPeak)
  const v6 = qrsPolarity(strip, 'V6', rPeak)

  const pII = peakAround(strip.leads.II, strip.fs, strip.t0, pPeak, 0.05)
  const pAVR = peakAround(strip.leads.aVR, strip.fs, strip.t0, pPeak, 0.05)
  const tII = peakAround(
    strip.leads.II,
    strip.fs,
    strip.t0,
    rPeak + strip.intervals.qrs_s * 0.5 + strip.intervals.qt_s * 0.35,
    0.06,
  )

  const rProgression = (['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as const).map(
    (lead) => peakAround(strip.leads[lead], strip.fs, strip.t0, rPeak, 0.05),
  )

  // --- P wave ---
  if (pII < 0.08) {
    issues.push({
      code: 'p_wave_too_small',
      severity: 'error',
      message: `Lead II P wave should be visible (≥0.08 mV, got ${pII.toFixed(3)} mV)`,
    })
  }
  if (pAVR > -0.04) {
    issues.push({
      code: 'p_avr_not_negative',
      severity: 'warn',
      message: `aVR P wave expected inverted (got ${pAVR.toFixed(3)} mV)`,
    })
  }

  // --- Limb leads ---
  if (leadII <= 0.05) {
    issues.push({
      code: 'lead_ii_not_positive',
      severity: 'error',
      message: `Lead II QRS should be predominantly positive (got ${leadII.toFixed(3)} mV)`,
    })
  }
  if (aVR >= -0.05) {
    issues.push({
      code: 'avr_not_negative',
      severity: 'error',
      message: `aVR QRS should be predominantly negative (got ${aVR.toFixed(3)} mV)`,
    })
  }
  if (leadI <= 0) {
    issues.push({
      code: 'lead_i_not_positive',
      severity: 'warn',
      message: `Lead I QRS expected positive in normal axis (got ${leadI.toFixed(3)} mV)`,
    })
  }
  if (tII < 0.1) {
    issues.push({
      code: 't_wave_too_small',
      severity: 'warn',
      message: `Lead II T wave should be clearly positive (got ${tII.toFixed(3)} mV)`,
    })
  }

  // --- Chest leads ---
  if (v1 >= 0.05) {
    issues.push({
      code: 'v1_not_negative',
      severity: 'error',
      message: `V1 QRS should be mainly negative (got ${v1.toFixed(3)} mV)`,
    })
  }
  if (v6 <= 0.05) {
    issues.push({
      code: 'v6_not_positive',
      severity: 'error',
      message: `V6 QRS should be mainly positive (got ${v6.toFixed(3)} mV)`,
    })
  }

  // R-wave progression: peak amplitude should generally rise V1→V5/V6
  const rAmps = rProgression.map((v) => Math.max(0, v))
  let rises = 0
  for (let i = 1; i < rAmps.length; i++) {
    if (rAmps[i] + 0.02 >= rAmps[i - 1]) rises++
  }
  if (rises < 3) {
    issues.push({
      code: 'poor_r_progression',
      severity: 'warn',
      message: `Poor R-wave progression across V1–V6: [${rAmps
        .map((v) => v.toFixed(2))
        .join(', ')}]`,
    })
  }

  // --- Timing ---
  const { pr_s, qrs_s, qt_s, rate_bpm } = strip.intervals
  const pr_ms = pr_s * 1000
  const qrs_ms = qrs_s * 1000
  const qt_ms = qt_s * 1000

  if (rate_bpm < 60 || rate_bpm > 100) {
    issues.push({
      code: 'rate_out_of_nsr',
      severity: 'warn',
      message: `Heart rate ${rate_bpm} bpm is outside normal sinus 60–100 (allowed for teaching)`,
    })
  }
  if (pr_ms < 120 || pr_ms > 200) {
    issues.push({
      code: 'pr_out_of_range',
      severity: pr_ms < 80 || pr_ms > 320 ? 'error' : 'warn',
      message: `PR ${pr_ms.toFixed(0)} ms outside normal 120–200 ms`,
    })
  }
  if (qrs_ms >= 120) {
    issues.push({
      code: 'qrs_wide',
      severity: 'warn',
      message: `QRS ${qrs_ms.toFixed(0)} ms ≥ 120 ms (wide complex)`,
    })
  }
  // Bazett-ish physiological QT upper bound ~440–460 ms at this RR
  const qtc = qt_ms / Math.sqrt(strip.rr_s)
  if (qtc > 480 || qt_ms < 250) {
    issues.push({
      code: 'qt_out_of_range',
      severity: 'warn',
      message: `QT ${qt_ms.toFixed(0)} ms (QTc≈${qtc.toFixed(0)}) outside typical range`,
    })
  }

  const errors = issues.filter((i) => i.severity === 'error')
  return {
    ok: errors.length === 0,
    issues,
    metrics: {
      leadII_qrsPolarity: leadII,
      aVR_qrsPolarity: aVR,
      leadI_qrsPolarity: leadI,
      v1_qrsPolarity: v1,
      v6_qrsPolarity: v6,
      leadII_pPeak: pII,
      leadII_tPeak: tII,
      rProgression: rAmps,
      pr_ms,
      qrs_ms,
      qt_ms,
      rate_bpm,
    },
  }
}
