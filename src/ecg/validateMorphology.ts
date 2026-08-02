/**
 * Headless morphology check — Lead II should look like normal sinus rhythm.
 *
 * Run: npx tsx src/ecg/validateMorphology.ts
 */

import { buildEcgConductionPlan } from './morphology'
import { sampleEcgAt } from './signalFromPhysiology'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

const fs = 500
const rate = 72
const plan = buildEcgConductionPlan(rate)
const n = Math.round(plan.rr_s * fs)
const ii = new Float32Array(n)
for (let i = 0; i < n; i++) {
  const t = i / fs
  ii[i] = sampleEcgAt(t, rate).leads.II
}

function peakIn(t0: number, t1: number): { t: number; v: number } {
  let bestT = t0
  let bestV = -Infinity
  const i0 = Math.max(0, Math.floor(t0 * fs))
  const i1 = Math.min(n - 1, Math.ceil(t1 * fs))
  for (let i = i0; i <= i1; i++) {
    if (ii[i]! > bestV) {
      bestV = ii[i]!
      bestT = i / fs
    }
  }
  return { t: bestT, v: bestV }
}

function minIn(t0: number, t1: number): { t: number; v: number } {
  let bestT = t0
  let bestV = Infinity
  const i0 = Math.max(0, Math.floor(t0 * fs))
  const i1 = Math.min(n - 1, Math.ceil(t1 * fs))
  for (let i = i0; i <= i1; i++) {
    if (ii[i]! < bestV) {
      bestV = ii[i]!
      bestT = i / fs
    }
  }
  return { t: bestT, v: bestV }
}

const p = peakIn(plan.pOnset_s, plan.pEnd_s)
const r = peakIn(plan.qrsOnset_s, plan.qrsEnd_s)
const s = minIn(plan.rPeak_s, plan.qrsEnd_s + 0.02)
const t = peakIn(plan.qrsEnd_s + 0.02, plan.tEnd_s)

// Second local max inside QRS window (detect double-spike artifact).
let secondQrsPeak = 0
{
  const i0 = Math.floor(plan.qrsOnset_s * fs)
  const i1 = Math.ceil(plan.qrsEnd_s * fs)
  const rIdx = Math.round(r.t * fs)
  for (let i = i0; i <= i1; i++) {
    if (Math.abs(i - rIdx) < 6) continue
    const v = ii[i]!
    if (
      v > 0.35 * r.v &&
      v > (ii[i - 1] ?? 0) &&
      v >= (ii[i + 1] ?? 0)
    ) {
      secondQrsPeak = Math.max(secondQrsPeak, v)
    }
  }
}

assert(p.v > 0.1 && p.v < 0.35, `P amplitude out of range: ${p.v}`)
assert(r.v > 0.9 && r.v < 2.0, `R amplitude out of range: ${r.v}`)
assert(t.v > 0.12 && t.v < 0.55, `T amplitude out of range: ${t.v}`)
assert(t.v < r.v * 0.4, `T should be clearly smaller than R (T=${t.v}, R=${r.v})`)
assert(p.v < r.v * 0.3, `P should be much smaller than R`)
assert(plan.pr_s >= 0.12 && plan.pr_s <= 0.22, `PR out of range: ${plan.pr_s}`)
assert(plan.qrs_s < 0.12, `QRS too wide: ${plan.qrs_s}`)
assert(r.t > p.t + 0.1, 'R should follow P with AV delay')
assert(t.t > r.t + 0.08, 'T should follow QRS')
assert(secondQrsPeak < 0.55 * r.v, `Double R spike detected (2nd=${secondQrsPeak}, R=${r.v})`)

// aVR should be predominantly negative around R.
const aVR_at_R = sampleEcgAt(r.t, rate).leads.aVR
assert(aVR_at_R < -0.2, `aVR should be negative at R: ${aVR_at_R}`)

console.log(
  JSON.stringify(
    {
      ok: true,
      plan: {
        pr_ms: Math.round(plan.pr_s * 1000),
        qrs_ms: Math.round(plan.qrs_s * 1000),
        qt_ms: Math.round(plan.qt_s * 1000),
      },
      leadII: {
        P: +p.v.toFixed(3),
        R: +r.v.toFixed(3),
        S: +s.v.toFixed(3),
        T: +t.v.toFixed(3),
      },
      aVR_at_R: +aVR_at_R.toFixed(3),
      secondQrsPeak: +secondQrsPeak.toFixed(3),
    },
    null,
    2,
  ),
)
