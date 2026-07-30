/**
 * Dev / CI helper: generate default NSR ECG and assert morphology rules.
 * Run: npx tsx scripts/validate-ecg.ts
 */

import { generateValidatedEcg } from '../src/simulation/ecgGenerator'

const { strip, validation } = generateValidatedEcg({
  heartRate_bpm: 72,
  conductionVelocity: 1,
  cardiacAxis_deg: 60,
  duration_s: 2.5,
  sampleRate_Hz: 500,
})

console.log('Intervals:', {
  rate: strip.intervals.rate_bpm,
  pr_ms: Math.round(strip.intervals.pr_s * 1000),
  qrs_ms: Math.round(strip.intervals.qrs_s * 1000),
  qt_ms: Math.round(strip.intervals.qt_s * 1000),
})
console.log('P/QRS/T (Lead II):', {
  P: validation.metrics.leadII_pPeak.toFixed(3),
  QRS: validation.metrics.leadII_qrsPolarity.toFixed(3),
  T: validation.metrics.leadII_tPeak.toFixed(3),
})
console.log('Metrics:', validation.metrics)
console.log('Issues:', validation.issues)

if (!validation.ok) {
  console.error('FAIL: ECG validation errors')
  process.exit(1)
}

if (validation.metrics.leadII_pPeak < 0.08) {
  console.error('FAIL: Lead II P wave not visible')
  process.exit(1)
}

// Spot-check Einthoven: I − II + III ≈ 0 at R peak sample
const r = strip.ventricularBeats[0] ?? 0
const idx = Math.round((r - strip.t0) * strip.fs)
const I = strip.leads.I[idx]
const II = strip.leads.II[idx]
const III = strip.leads.III[idx]
const residual = I - II + III
console.log('Einthoven residual I−II+III:', residual.toFixed(6))
if (Math.abs(residual) > 1e-6) {
  console.error('FAIL: Einthoven law violated')
  process.exit(1)
}

console.log('PASS')
