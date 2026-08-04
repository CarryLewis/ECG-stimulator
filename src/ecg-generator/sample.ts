import {
  analyzeElectricalVectors,
  type EvaluateFieldInput,
  type LeadVoltages,
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
  /** Lead voltages after body-surface → lead calculation (pre-noise). */
  voltages: LeadVoltages
}

/**
 * ECG waveform sample from calculated lead voltages.
 * Does not invent morphology — only copies / optionally adds display noise.
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

/** One tick after vector/BSP/lead stages → waveform sample. */
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
