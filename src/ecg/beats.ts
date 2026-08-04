import type { CyclePlan } from './types'

/** Small deterministic PRNG so re-renders / live streams stay stable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface BeatTimes {
  ventricular: number[]
  atrial: number[]
}

/**
 * Build beat onset times over `[t0, t0 + duration)`.
 *
 * - Regular: fixed RR / AA from the plan rates.
 * - Irregular (AF): RR drawn from a seeded distribution around the mean.
 * - Dissociated: independent atrial and ventricular clocks.
 * - Conducted sinus: atrial onsets = ventricular − PR.
 */
export function buildBeatTimes(
  plan: CyclePlan,
  duration: number,
  rng: () => number,
  t0 = 0,
): BeatTimes {
  const ventricular: number[] = []
  const atrial: number[] = []

  if (plan.irregular) {
    const meanRR = 60 / plan.ventricularRate
    let t = t0 + 0.25 + rng() * 0.25
    while (t < t0 + duration) {
      ventricular.push(t)
      t += meanRR * (0.55 + 0.9 * rng())
    }
  } else if (plan.ventricularFibrillation || plan.ventricularFlutter) {
    // No discrete QRS annotations — continuous undulation / sine wave.
  } else {
    const rr = 60 / plan.ventricularRate
    let t = t0 + 0.05
    while (t < t0 + duration) {
      // R peak at SA onset + PR so annotations match conductionAt phases.
      ventricular.push(t + plan.prInterval)
      t += rr
    }
  }

  if (plan.dissociated && !plan.ventricularFibrillation && !plan.ventricularFlutter) {
    const arr = 60 / plan.atrialRate
    let t = t0 + 0.05
    while (t < t0 + duration) {
      atrial.push(t)
      t += arr
    }
  } else if (
    !plan.fibrillatoryBaseline &&
    !plan.flutterBaseline &&
    !plan.ventricularFibrillation &&
    !plan.ventricularFlutter
  ) {
    for (const v of ventricular) atrial.push(v - plan.prInterval)
  }

  return { ventricular, atrial }
}

interface OnsetCache {
  meanRR: number
  seed: number
  onsets: number[]
  next: number
  rng: () => number
}

const onsetCaches = new Map<string, OnsetCache>()

function cacheKey(plan: CyclePlan, seed: number): string {
  return `${seed}:${plan.ventricularRate.toFixed(3)}`
}

function getCache(plan: CyclePlan, seed: number): OnsetCache {
  const key = cacheKey(plan, seed)
  let c = onsetCaches.get(key)
  if (!c) {
    const rng = mulberry32(seed)
    const meanRR = 60 / plan.ventricularRate
    const first = 0.2 + rng() * 0.2
    c = {
      meanRR,
      seed,
      onsets: [first],
      next: first + meanRR * (0.55 + 0.9 * rng()),
      rng,
    }
    onsetCaches.set(key, c)
  }
  return c
}

function ensureOnsetsUntil(c: OnsetCache, t: number) {
  while (c.next <= t + c.meanRR) {
    c.onsets.push(c.next)
    c.next = c.next + c.meanRR * (0.55 + 0.9 * c.rng())
    // Hard cap to avoid runaway if t is huge.
    if (c.onsets.length > 500000) break
  }
}

/**
 * Pure lookup: ventricular beat onset that contains absolute time `t`.
 * Safe to call from ECG backfill and the conduction diagram in any order.
 */
export function irregularBeatOnset(
  plan: CyclePlan,
  t: number,
  seed = 23,
): number {
  const c = getCache(plan, seed)
  if (t < c.onsets[0]!) {
    return c.onsets[0]! - c.meanRR
  }
  ensureOnsetsUntil(c, t)
  // Linear scan from the end — live calls are near the frontier.
  for (let i = c.onsets.length - 1; i >= 0; i--) {
    const onset = c.onsets[i]!
    const end = i + 1 < c.onsets.length ? c.onsets[i + 1]! : c.next
    if (t >= onset && t < end) return onset
  }
  return c.onsets[c.onsets.length - 1]!
}

/**
 * Streaming cursor kept for API compatibility; delegates to the pure cache.
 */
export class IrregularBeatCursor {
  constructor(
    private plan: CyclePlan,
    private seed = 23,
  ) {}

  onsetAt(t: number): number {
    return irregularBeatOnset(this.plan, t, this.seed)
  }
}

/** Drop cached AF schedules (e.g. after hot-reload). */
export function clearIrregularBeatCache() {
  onsetCaches.clear()
}
