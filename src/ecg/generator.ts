import { buildBeatTimes, mulberry32 } from './beats'
import { conductionAt } from './conduction'
import { dipoleFromConduction, projectLead } from './dipole'
import { LEAD_AXES, LEAD_ORDER } from './leads'
import type { CyclePlan, EcgResult, LeadName, LeadTrace } from './types'

export interface GenerateOptions {
  fs?: number
  duration?: number
  seed?: number
  /** Absolute start time of the strip (seconds). Defaults to 0. */
  t0?: number
  /** Restrict output to specific leads (defaults to all 12). */
  leads?: LeadName[]
  /** AF irregular-RR seed — keep in sync with the conduction diagram. */
  afSeed?: number
}

/**
 * Synthesise a multi-lead ECG by sampling the cardiac dipole over time and
 * projecting onto each lead axis.
 *
 * This is the offline / batch path. The live monitor uses the same
 * `voltageSample` function frame-by-frame so the printed strip and the
 * scrolling display stay physically consistent.
 */
export function generateEcg(
  plan: CyclePlan,
  opts: GenerateOptions = {},
): EcgResult {
  const fs = opts.fs ?? 250
  const duration = opts.duration ?? 2.5
  const t0 = opts.t0 ?? 0
  const rng = mulberry32(opts.seed ?? 1)
  const beats = buildBeatTimes(plan, duration, rng, t0)
  const afSeed = opts.afSeed ?? 23

  const wanted = opts.leads
    ? LEAD_AXES.filter((c) => opts.leads!.includes(c.name))
    : LEAD_AXES

  const leads: LeadTrace[] = wanted.map((axis) => ({
    name: axis.name,
    samples: sampleLead(plan, axis.name, fs, duration, t0, rng, afSeed),
  }))

  return {
    leads,
    fs,
    duration,
    t0,
    ventricularBeats: beats.ventricular,
    atrialBeats: beats.atrial,
  }
}

export interface SampleContext {
  afSeed?: number
}

/** Single-sample voltage for one lead at absolute time `t` (seconds). */
export function voltageSample(
  plan: CyclePlan,
  lead: LeadName,
  t: number,
  noise = 0,
  ctx: SampleContext = {},
): number {
  const state = conductionAt(plan, t, { afSeed: ctx.afSeed })
  const dipole = dipoleFromConduction(plan, state)
  let y = projectLead(dipole, lead)

  if (plan.fibrillatoryBaseline) {
    const amp = 0.04
    y +=
      amp *
      0.5 *
      (Math.sin(2 * Math.PI * 6.2 * t) +
        0.55 * Math.sin(2 * Math.PI * 9.1 * t + 1.3))
  }

  if (noise !== 0) y += noise
  return y
}

function sampleLead(
  plan: CyclePlan,
  lead: LeadName,
  fs: number,
  duration: number,
  t0: number,
  rng: () => number,
  afSeed: number,
): number[] {
  const n = Math.floor(fs * duration)
  const out = new Array<number>(n)
  const ctx: SampleContext = { afSeed }
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fs
    out[i] = voltageSample(plan, lead, t, (rng() - 0.5) * 0.008, ctx)
  }
  return out
}

export { LEAD_ORDER }
