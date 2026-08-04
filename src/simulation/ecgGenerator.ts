/**
 * ECG generator — samples M(t) and projects onto the 12-lead system.
 *
 * Pure functions only. Visualization must consume EcgStrip / EcgSample;
 * it must not recompute physiology.
 */

import { buildConductionPlan } from './conductionSystem'
import { projectDipoleToLeadsConsistent } from './leadSystem'
import type {
  EcgSample,
  EcgStrip,
  LeadName,
  SimulationParams,
} from './types'
import { DEFAULT_SIM_PARAMS, LEAD_ORDER } from './types'
import { sampleCardiacVector } from './vectorGenerator'
import { validateEcgStrip } from './validateEcg'

export interface GenerateEcgResult {
  strip: EcgStrip
  /** Instantaneous sample at the last time point (for live HUD). */
  lastSample: EcgSample
}

/** One simultaneous 12-lead sample from the shared cardiac vector. */
export function sampleEcgAt(
  t: number,
  params: SimulationParams = DEFAULT_SIM_PARAMS,
): EcgSample {
  const field = sampleCardiacVector(t, params)
  return {
    t,
    leads: projectDipoleToLeadsConsistent(field.dipole),
  }
}

/**
 * Generate a multi-beat 12-lead strip from a single cardiac dipole source.
 */
export function generateEcgStrip(
  params: Partial<SimulationParams> = {},
  t0 = 0,
): EcgStrip {
  const p: SimulationParams = { ...DEFAULT_SIM_PARAMS, ...params }
  const plan = buildConductionPlan(p)
  const n = Math.max(1, Math.round(p.duration_s * p.sampleRate_Hz))
  const leads = {} as Record<LeadName, Float32Array>
  for (const name of LEAD_ORDER) {
    leads[name] = new Float32Array(n)
  }

  for (let i = 0; i < n; i++) {
    const t = t0 + i / p.sampleRate_Hz
    const sample = sampleEcgAt(t, p)
    for (const name of LEAD_ORDER) {
      leads[name][i] = sample.leads[name]
    }
  }

  const ventricularBeats: number[] = []
  const atrialBeats: number[] = []
  const end = t0 + p.duration_s
  // Enumerate beat fiducials from the conduction plan.
  let seq = Math.floor(t0 / plan.rr_s) - 1
  for (;;) {
    const beatT0 = seq * plan.rr_s
    if (beatT0 > end + plan.rr_s) break
    const pAbs = beatT0 + plan.pOnset_s
    const rAbs = beatT0 + plan.rPeak_s
    if (pAbs >= t0 && pAbs < end) atrialBeats.push(pAbs)
    if (rAbs >= t0 && rAbs < end) ventricularBeats.push(rAbs)
    seq++
  }

  return {
    fs: p.sampleRate_Hz,
    t0,
    duration_s: p.duration_s,
    leads,
    ventricularBeats,
    atrialBeats,
    rr_s: plan.rr_s,
    intervals: {
      pr_s: plan.pr_s,
      qrs_s: plan.qrs_s,
      qt_s: plan.qt_s,
      rate_bpm: plan.rate_bpm,
    },
  }
}

/**
 * Generate + physiologically validate. Throws only if `throwOnError`.
 * Callers (UI) should prefer reading `validation` and still display the strip.
 */
export function generateValidatedEcg(
  params: Partial<SimulationParams> = {},
  t0 = 0,
  throwOnError = false,
): GenerateEcgResult & {
  validation: ReturnType<typeof validateEcgStrip>
} {
  const strip = generateEcgStrip(params, t0)
  const validation = validateEcgStrip(strip)
  if (throwOnError && !validation.ok) {
    const msg = validation.issues
      .filter((i) => i.severity === 'error')
      .map((i) => i.message)
      .join('; ')
    throw new Error(`ECG validation failed: ${msg}`)
  }
  const lastIdx = Math.max(0, Math.round(strip.duration_s * strip.fs) - 1)
  const lastSample: EcgSample = {
    t: strip.t0 + lastIdx / strip.fs,
    leads: Object.fromEntries(
      LEAD_ORDER.map((name) => [name, strip.leads[name][lastIdx] ?? 0]),
    ) as EcgSample['leads'],
  }
  return { strip, lastSample, validation }
}

/** Live ring-buffer helper for cascade monitors. */
export function appendSampleToBuffers(
  buffers: Record<LeadName, Float32Array>,
  writeIndex: number,
  sample: EcgSample,
): number {
  const cap = buffers.I.length
  for (const name of LEAD_ORDER) {
    buffers[name][writeIndex] = sample.leads[name]
  }
  return (writeIndex + 1) % cap
}
