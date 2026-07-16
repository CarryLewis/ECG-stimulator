import { LEAD_CONFIGS } from './leads'
import type { CyclePlan, EcgResult, LeadConfig, LeadName, LeadTrace } from './types'

/** Reference beat amplitudes (mV) before per-lead scaling. */
const BASE = { p: 0.15, q: -0.08, r: 1.4, s: -0.4, t: 0.35 }

/** Wave centres in seconds relative to the R peak. */
const CENTER = { q: -0.025, r: 0, s: 0.034, t: 0.235, u: 0.42 }

/** Baseline wave widths (seconds). */
const WIDTH = { p: 0.022, q: 0.011, r: 0.012, s: 0.014, t: 0.055, u: 0.06 }

function gauss(t: number, center: number, width: number): number {
  const d = t - center
  return Math.exp(-(d * d) / (2 * width * width))
}

/** Small deterministic PRNG so re-renders are stable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ST-segment shaping: a smooth trapezoid between the S wave and the T wave. */
function stShape(dt: number): number {
  if (dt <= 0.02 || dt >= 0.26) return 0
  if (dt < 0.06) return (dt - 0.02) / 0.04
  if (dt < 0.18) return 1
  return 1 - (dt - 0.18) / 0.08
}

interface BeatTimes {
  ventricular: number[]
  atrial: number[]
}

function buildBeatTimes(
  plan: CyclePlan,
  duration: number,
  rng: () => number,
): BeatTimes {
  const ventricular: number[] = []
  const atrial: number[] = []

  if (plan.irregular) {
    const meanRR = 60 / plan.ventricularRate
    let t = 0.25 + rng() * 0.25
    while (t < duration) {
      ventricular.push(t)
      t += meanRR * (0.55 + 0.9 * rng())
    }
  } else {
    const rr = 60 / plan.ventricularRate
    let t = 0.4
    while (t < duration) {
      ventricular.push(t)
      t += rr
    }
  }

  if (plan.dissociated) {
    const arr = 60 / plan.atrialRate
    let t = 0.15
    while (t < duration) {
      atrial.push(t)
      t += arr
    }
  } else if (!plan.fibrillatoryBaseline) {
    for (const v of ventricular) atrial.push(v - plan.prInterval)
  }

  return { ventricular, atrial }
}

function buildLead(
  cfg: LeadConfig,
  plan: CyclePlan,
  beats: BeatTimes,
  fs: number,
  duration: number,
  rng: () => number,
): number[] {
  const n = Math.floor(fs * duration)
  const out = new Array<number>(n)

  const qw = WIDTH.q * plan.qrsWidthFactor
  const rw = WIDTH.r * plan.qrsWidthFactor
  const sw = WIDTH.s * plan.qrsWidthFactor
  const tw = WIDTH.t * plan.tWidthFactor

  const stTerr = plan.stByTerritory[cfg.territory] ?? 0
  const st = plan.stGlobal + stTerr
  const tSign = cfg.t >= 0 ? 1 : -1

  for (let i = 0; i < n; i++) {
    const t = i / fs
    let y = 0

    for (const b of beats.ventricular) {
      const dt = t - b
      if (dt < -0.12 || dt > 0.6) continue
      y += BASE.q * cfg.r * gauss(dt, CENTER.q, qw)
      y += BASE.r * cfg.r * gauss(dt, CENTER.r, rw)
      y += BASE.s * cfg.s * gauss(dt, CENTER.s, sw)
      y += BASE.t * cfg.t * plan.tAmpFactor * gauss(dt, CENTER.t, tw)
      if (plan.uAmp > 0) {
        y += plan.uAmp * tSign * gauss(dt, CENTER.u, WIDTH.u)
      }
      if (st !== 0) {
        y += st * stShape(dt)
      }
    }

    for (const a of beats.atrial) {
      const dt = t - a
      if (dt < -0.06 || dt > 0.06) continue
      y += BASE.p * cfg.p * plan.pAmpFactor * gauss(dt, 0, WIDTH.p)
    }

    if (plan.fibrillatoryBaseline) {
      const amp = 0.05 * Math.abs(cfg.p)
      y +=
        amp *
        0.5 *
        (Math.sin(2 * Math.PI * 6 * t) +
          0.6 * Math.sin(2 * Math.PI * 9.3 * t + 1.1))
    }

    // Subtle baseline noise for a realistic trace.
    y += (rng() - 0.5) * 0.008

    out[i] = y
  }

  return out
}

export interface GenerateOptions {
  fs?: number
  duration?: number
  seed?: number
  /** Restrict output to specific leads (defaults to all 12). */
  leads?: LeadName[]
}

export function generateEcg(
  plan: CyclePlan,
  opts: GenerateOptions = {},
): EcgResult {
  const fs = opts.fs ?? 250
  const duration = opts.duration ?? 2.5
  const rng = mulberry32(opts.seed ?? 1)
  const beats = buildBeatTimes(plan, duration, rng)

  const wanted = opts.leads
    ? LEAD_CONFIGS.filter((c) => opts.leads!.includes(c.name))
    : LEAD_CONFIGS

  const leads: LeadTrace[] = wanted.map((cfg) => ({
    name: cfg.name,
    samples: buildLead(cfg, plan, beats, fs, duration, rng),
  }))

  return {
    leads,
    fs,
    duration,
    ventricularBeats: beats.ventricular,
    atrialBeats: beats.atrial,
  }
}
