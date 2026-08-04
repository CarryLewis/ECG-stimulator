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
 */
export function generateEcg(
  plan: CyclePlan,
  opts: GenerateOptions = {},
): EcgResult {
  const fs = opts.fs ?? 250
  const duration = opts.duration ?? 2.5
  const t0 = opts.t0 ?? 0
  const rng = mulberry32(opts.seed ?? plan.rhythmSeed ?? 1)
  const beats = buildBeatTimes(plan, duration, rng, t0)
  const afSeed = opts.afSeed ?? plan.rhythmSeed ?? 23

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
  const afSeed = ctx.afSeed ?? plan.rhythmSeed ?? 23
  const state = conductionAt(plan, t, { afSeed })
  const dipole = dipoleFromConduction(plan, state)
  let y = projectLead(dipole, lead)

  // Atrial fibrillation — fine fibrillatory baseline.
  if (plan.fibrillatoryBaseline) {
    const amp = 0.04
    y +=
      amp *
      0.5 *
      (Math.sin(2 * Math.PI * 6.2 * t) +
        0.55 * Math.sin(2 * Math.PI * 9.1 * t + 1.3))
  }

  // Atrial flutter — continuous sawtooth F waves (classic in inferior leads).
  if (plan.flutterBaseline) {
    const flutterHz = plan.atrialRate / 60
    const inferiorBoost =
      lead === 'II' || lead === 'III' || lead === 'aVF' ? 1.35 : 0.75
    const saw =
      2 *
        (flutterHz * t - Math.floor(flutterHz * t + 0.5)) // sawtooth −1..1
    y += 0.12 * inferiorBoost * plan.pAmpFactor * saw
  }

  // Ventricular fibrillation — irregular undulating baseline, no QRS.
  if (plan.ventricularFibrillation) {
    const amp = 0.35 * (plan.chaosAmplitude || 0.7)
    y =
      amp *
      (0.55 * Math.sin(2 * Math.PI * 4.7 * t) +
        0.35 * Math.sin(2 * Math.PI * 7.3 * t + 0.8) +
        0.25 * Math.sin(2 * Math.PI * 11.1 * t + 1.7) +
        0.15 * Math.sin(2 * Math.PI * 17.0 * t + 0.3))
  }

  // Ventricular flutter — large regular sine wave.
  if (plan.ventricularFlutter) {
    const hz = plan.ventricularRate / 60
    const amp = 1.1 * (plan.chaosAmplitude || 0.85)
    y = amp * Math.sin(2 * Math.PI * hz * t)
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
