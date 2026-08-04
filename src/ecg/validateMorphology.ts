/**
 * Headless NSR morphology check against a First Aid–style normal cycle.
 *
 * Targets (Lead II):
 *   P ≈ 0.10–0.20 mV · PR 120–200 ms · QRS < 100 ms · R ≈ 0.9–1.5 mV
 *   ST ≈ 0 mV · T ≈ 0.20–0.40 mV · T ≪ R · P ≪ R
 *
 * Run: npx tsx src/ecg/validateMorphology.ts
 */

import { physiologicalModelToCyclePlan } from '../disease/toCyclePlan'
import { resolveDiseaseSimulation } from '../disease'
import { voltageSample } from './generator'
import type { CyclePlan } from './types'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

function nsrPlan(): CyclePlan {
  const result = resolveDiseaseSimulation({
    diseaseId: 'normal_sinus_rhythm',
    params: { heartRate: 72 },
  })
  return physiologicalModelToCyclePlan(result.model)
}

const plan = nsrPlan()
const fs = 500
const rr = 60 / plan.ventricularRate
const n = Math.round(rr * fs)
const ii = new Float32Array(n)
const v6 = new Float32Array(n)

for (let i = 0; i < n; i++) {
  const t = i / fs
  ii[i] = voltageSample(plan, 'II', t)
  v6[i] = voltageSample(plan, 'V6', t)
}

function peakIn(
  arr: Float32Array,
  t0: number,
  t1: number,
): { t: number; v: number } {
  let bestT = t0
  let bestV = -Infinity
  const i0 = Math.max(0, Math.floor(t0 * fs))
  const i1 = Math.min(n - 1, Math.ceil(t1 * fs))
  for (let i = i0; i <= i1; i++) {
    if (arr[i]! > bestV) {
      bestV = arr[i]!
      bestT = i / fs
    }
  }
  return { t: bestT, v: bestV }
}

function minIn(
  arr: Float32Array,
  t0: number,
  t1: number,
): { t: number; v: number } {
  let bestT = t0
  let bestV = Infinity
  const i0 = Math.max(0, Math.floor(t0 * fs))
  const i1 = Math.min(n - 1, Math.ceil(t1 * fs))
  for (let i = i0; i <= i1; i++) {
    if (arr[i]! < bestV) {
      bestV = arr[i]!
      bestT = i / fs
    }
  }
  return { t: bestT, v: bestV }
}

function meanIn(arr: Float32Array, t0: number, t1: number): number {
  let s = 0
  let c = 0
  const i0 = Math.max(0, Math.floor(t0 * fs))
  const i1 = Math.min(n - 1, Math.ceil(t1 * fs))
  for (let i = i0; i <= i1; i++) {
    s += arr[i]!
    c++
  }
  return c ? s / c : 0
}

/** First sample crossing `frac` of peak on the rising edge. */
function onsetOf(arr: Float32Array, peakT: number, peakV: number, frac = 0.1): number {
  const thr = frac * peakV
  const iPeak = Math.round(peakT * fs)
  for (let i = iPeak; i >= 0; i--) {
    if (arr[i]! < thr) return (i + 1) / fs
  }
  return 0
}

const pr = plan.prInterval
const p = peakIn(ii, 0.0, Math.max(0.05, pr - 0.04))
const r = peakIn(ii, pr - 0.01, pr + 0.1)
const s = minIn(ii, r.t, pr + 0.12)
const t = peakIn(ii, pr + 0.12, pr + 0.42)
const st = meanIn(ii, pr + 0.085, pr + 0.14)

const pOnset = onsetOf(ii, p.t, p.v, 0.15)
// Clinical QRS duration: first/last deflection above a small absolute floor
// near the planned QRS window (more stable than % of R for sharp spikes).
const qrsFloor = 0.025
let qrsOnset = pr
let qrsEnd = pr
{
  const i0 = Math.max(0, Math.floor((pr - 0.02) * fs))
  const i1 = Math.min(n - 1, Math.ceil((pr + 0.16) * fs))
  for (let i = i0; i <= i1; i++) {
    if (Math.abs(ii[i]!) > qrsFloor) {
      qrsOnset = i / fs
      break
    }
  }
  for (let i = i1; i >= i0; i--) {
    if (Math.abs(ii[i]!) > qrsFloor) {
      qrsEnd = i / fs
      break
    }
  }
}
const qrsMs = (qrsEnd - qrsOnset) * 1000
const prMs = (qrsOnset - pOnset) * 1000

assert(p.v > 0.08 && p.v < 0.22, `P amplitude out of range: ${p.v.toFixed(3)}`)
assert(r.v > 0.85 && r.v < 1.6, `R amplitude out of range: ${r.v.toFixed(3)}`)
assert(t.v > 0.18 && t.v < 0.45, `T amplitude out of range: ${t.v.toFixed(3)}`)
assert(t.v < r.v * 0.45, `T should be clearly smaller than R (T=${t.v}, R=${r.v})`)
assert(p.v < r.v * 0.25, `P should be much smaller than R (P=${p.v}, R=${r.v})`)
assert(Math.abs(st) < 0.08, `ST should be near isoelectric: ${st.toFixed(3)}`)
assert(prMs >= 120 && prMs <= 210, `PR out of range: ${prMs.toFixed(0)} ms`)
assert(qrsMs >= 60 && qrsMs < 100, `QRS duration out of range: ${qrsMs.toFixed(0)} ms`)
assert(r.t > p.t + 0.1, 'R should follow P with AV delay')
assert(t.t > qrsEnd + 0.03, 'T should follow a short ST segment')

const aVR = voltageSample(plan, 'aVR', r.t)
assert(aVR < -0.15, `aVR should be negative at R: ${aVR}`)

const v6P = peakIn(v6, 0.0, Math.max(0.05, pr - 0.04))
const v6R = peakIn(v6, pr - 0.01, pr + 0.1)
const v6ST = meanIn(v6, pr + 0.085, pr + 0.14)
assert(v6P.v < v6R.v * 0.3, `V6 P too tall relative to R`)
assert(Math.abs(v6ST) < 0.12, `V6 ST should be near isoelectric: ${v6ST.toFixed(3)}`)

console.log(
  JSON.stringify(
    {
      ok: true,
      plan: {
        pr_ms: Math.round(plan.prInterval * 1000),
        rate: plan.ventricularRate,
      },
      leadII: {
        P: +p.v.toFixed(3),
        R: +r.v.toFixed(3),
        S: +s.v.toFixed(3),
        T: +t.v.toFixed(3),
        ST: +st.toFixed(3),
      },
      timings_ms: {
        pOnset: Math.round(pOnset * 1000),
        pPeak: Math.round(p.t * 1000),
        qrsOnset: Math.round(qrsOnset * 1000),
        rPeak: Math.round(r.t * 1000),
        qrsEnd: Math.round(qrsEnd * 1000),
        tPeak: Math.round(t.t * 1000),
        PR: Math.round(prMs),
        QRS: Math.round(qrsMs),
      },
      V6: {
        P: +v6P.v.toFixed(3),
        R: +v6R.v.toFixed(3),
        ST: +v6ST.toFixed(3),
      },
      aVR_at_R: +aVR.toFixed(3),
    },
    null,
    2,
  ),
)
