/**
 * Continuous ECG recorder.
 *
 * Advances sample-by-sample from the last recorded simulation time to `tNow`.
 * Never regenerates the full strip — only appends new samples.
 */

import {
  isNearVentricularPeak,
  sampleEcgAt,
} from '../ecg/signalFromPhysiology'
import { DEFAULT_HEART_RATE_BPM } from '../sim/sinusTiming'
import {
  appendSample,
  createRingBuffer,
  type EcgRingBuffer,
} from './ringBuffer'
import { DEFAULT_FS_HZ } from './types'

export interface RecorderState {
  buffer: EcgRingBuffer
  /** Last absolute time that was sampled (exclusive cursor). */
  lastSampled_t: number
  rateBpm: number
  fs: number
  /** Rising-edge helper so each QRS yields one annotation. */
  wasNearPeak: boolean
}

export function createRecorder(
  fs = DEFAULT_FS_HZ,
  rateBpm = DEFAULT_HEART_RATE_BPM,
): RecorderState {
  return {
    buffer: createRingBuffer(fs),
    lastSampled_t: 0,
    rateBpm,
    fs,
    wasNearPeak: false,
  }
}

/**
 * Catch the ring buffer up to simulation time `tNow`.
 * Call every animation frame while recording is armed.
 */
export function advanceRecorder(rec: RecorderState, tNow: number): number {
  if (tNow < rec.lastSampled_t - 0.05) {
    // Clock reset — clear and restart acquisition.
    rec.buffer = createRingBuffer(rec.fs)
    rec.lastSampled_t = 0
    rec.wasNearPeak = false
  }

  const dt = 1 / rec.fs
  let added = 0
  let t = rec.lastSampled_t

  // Cap catch-up to avoid multi-second freezes if the tab was backgrounded.
  const maxCatchUp = 2.0
  if (tNow - t > maxCatchUp) {
    t = tNow - maxCatchUp
    rec.lastSampled_t = t
  }

  while (t + dt <= tNow + 1e-12) {
    t += dt
    const sample = sampleEcgAt(t, rec.rateBpm)
    const near = isNearVentricularPeak(sample.state)
    const rising = near && !rec.wasNearPeak
    appendSample(rec.buffer, t, sample.leads, rising)
    rec.wasNearPeak = near
    added++
  }
  rec.lastSampled_t = t
  return added
}

export function setRecorderRate(rec: RecorderState, rateBpm: number): void {
  rec.rateBpm = rateBpm
}

export function resetRecorder(rec: RecorderState): void {
  rec.buffer = createRingBuffer(rec.fs)
  rec.lastSampled_t = 0
  rec.wasNearPeak = false
}
