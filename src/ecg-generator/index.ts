import {
  analyzeElectricalVectors,
  type EvaluateFieldInput,
  type LeadVoltages,
  type MyocardialWavefronts,
  type TissueModifiers,
  LEAD_ORDER,
} from '../vector-engine'
import type { LeadName } from '../ecg/types'

export interface EcgSample {
  t: number
  leads: Readonly<Record<LeadName, number>>
}

export interface EcgSamplingConfig {
  fs: number
  noiseAmplitude_mV?: number
  seed?: number
}

export interface EcgGeneratorFrame {
  sample: EcgSample
  /** Lead voltages as received from the vector engine (pre-noise). */
  voltages: LeadVoltages
}

/**
 * ECG Generator — sample lead voltages produced by the Vector Engine.
 *
 * Never synthesises disease-specific waveforms. All morphology comes from
 * projecting the cardiac dipole onto lead axes upstream.
 */
export function sampleFromVoltages(
  voltages: LeadVoltages,
  noise = 0,
): EcgSample {
  if (noise === 0) {
    return { t: voltages.t, leads: voltages.leads }
  }
  const leads = {} as Record<LeadName, number>
  for (const name of LEAD_ORDER) {
    leads[name] = voltages.leads[name] + noise
  }
  return { t: voltages.t, leads }
}

/** One simulation tick: vector analysis → ECG sample. */
export function sampleEcgFromVectorInput(
  input: EvaluateFieldInput,
  noise = 0,
): EcgGeneratorFrame {
  const analysis = analyzeElectricalVectors(input)
  return {
    voltages: analysis.leads,
    sample: sampleFromVoltages(analysis.leads, noise),
  }
}

export interface EcgLeadRingBuffer {
  lead: LeadName
  samples: Float32Array
  writeIndex: number
  written: number
  capacity: number
}

export interface EcgStream {
  fs: number
  tEnd: number
  leads: Readonly<Record<LeadName, EcgLeadRingBuffer>>
}

export function createEcgStream(fs: number, capacity: number): EcgStream {
  const leads = {} as Record<LeadName, EcgLeadRingBuffer>
  for (const name of LEAD_ORDER) {
    leads[name] = {
      lead: name,
      samples: new Float32Array(capacity),
      writeIndex: 0,
      written: 0,
      capacity,
    }
  }
  return { fs, tEnd: 0, leads }
}

/** Push one simultaneous 12-lead sample into ring buffers. */
export function pushEcgSample(stream: EcgStream, sample: EcgSample): void {
  for (const name of LEAD_ORDER) {
    const buf = stream.leads[name]
    buf.samples[buf.writeIndex] = sample.leads[name]
    buf.writeIndex = (buf.writeIndex + 1) % buf.capacity
    buf.written += 1
  }
  stream.tEnd = sample.t
}

/**
 * Batch-generate a strip by evaluating the vector engine at each sample time.
 * `wavefrontAt(t)` must come from the EP engine (not hardcoded morphology).
 */
export function generateEcgStrip(
  wavefrontAt: (t: number) => MyocardialWavefronts,
  opts: {
    fs?: number
    duration?: number
    t0?: number
    tissue?: Partial<TissueModifiers>
    noiseAmplitude_mV?: number
    seed?: number
  } = {},
): {
  fs: number
  t0: number
  duration_s: number
  leads: Readonly<Record<LeadName, Float32Array>>
} {
  const fs = opts.fs ?? 250
  const duration = opts.duration ?? 2.5
  const t0 = opts.t0 ?? 0
  const n = Math.floor(fs * duration)
  const leads = {} as Record<LeadName, Float32Array>
  for (const name of LEAD_ORDER) leads[name] = new Float32Array(n)

  let seed = (opts.seed ?? 1) >>> 0
  const nextNoise = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const u = seed / 4294967296
    return ((u - 0.5) * 2 * (opts.noiseAmplitude_mV ?? 0))
  }

  for (let i = 0; i < n; i++) {
    const t = t0 + i / fs
    const frame = sampleEcgFromVectorInput(
      { t, wavefronts: wavefrontAt(t), tissue: opts.tissue },
      nextNoise(),
    )
    for (const name of LEAD_ORDER) {
      leads[name][i] = frame.sample.leads[name]
    }
  }

  return { fs, t0, duration_s: duration, leads }
}

export { LEAD_ORDER }
