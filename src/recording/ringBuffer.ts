/**
 * Persistent multi-lead ring buffer for continuous ECG recording.
 * History is never wholesale-redrawn from a static strip template —
 * samples are appended chronologically and scrolled.
 */

import { LEAD_ORDER } from '../ecg/leads'
import type { LeadName } from '../ecg/types'
import { HISTORY_SECONDS, DEFAULT_FS_HZ } from './types'

export interface EcgRingBuffer {
  fs: number
  capacity: number
  /** Next write index. */
  write: number
  /** Total samples ever written. */
  written: number
  /** Absolute time of sample 0 slot when written wraps (approximate). */
  tEnd: number
  leads: Record<LeadName, Float32Array>
  /** Absolute times of detected ventricular peaks. */
  ventricularPeaks_s: number[]
}

export function createRingBuffer(
  fs = DEFAULT_FS_HZ,
  seconds = HISTORY_SECONDS,
): EcgRingBuffer {
  const capacity = Math.max(8, Math.ceil(fs * seconds))
  const leads = {} as Record<LeadName, Float32Array>
  for (const name of LEAD_ORDER) {
    leads[name] = new Float32Array(capacity)
  }
  return {
    fs,
    capacity,
    write: 0,
    written: 0,
    tEnd: 0,
    leads,
    ventricularPeaks_s: [],
  }
}

export function appendSample(
  buf: EcgRingBuffer,
  t: number,
  voltages: Readonly<Record<LeadName, number>>,
  isVentricularPeak = false,
): void {
  const i = buf.write
  for (const name of LEAD_ORDER) {
    buf.leads[name][i] = voltages[name] ?? 0
  }
  buf.write = (i + 1) % buf.capacity
  buf.written += 1
  buf.tEnd = t

  if (isVentricularPeak) {
    buf.ventricularPeaks_s.push(t)
    // Keep peaks that can still fall inside the buffer window.
    const oldest = t - buf.capacity / buf.fs
    while (
      buf.ventricularPeaks_s.length > 0 &&
      (buf.ventricularPeaks_s[0] ?? 0) < oldest
    ) {
      buf.ventricularPeaks_s.shift()
    }
  }
}

/**
 * Copy the most recent `count` samples for one lead into `out` (oldest→newest).
 * Returns how many samples were written.
 */
export function readRecent(
  buf: EcgRingBuffer,
  lead: LeadName,
  count: number,
  out: Float32Array,
): number {
  const n = Math.min(count, buf.written, buf.capacity, out.length)
  if (n <= 0) return 0
  let idx = buf.write - n
  if (idx < 0) idx += buf.capacity
  for (let i = 0; i < n; i++) {
    out[i] = buf.leads[lead][(idx + i) % buf.capacity]!
  }
  return n
}

/** Absolute time of the oldest sample currently in the buffer. */
export function oldestTime(buf: EcgRingBuffer): number {
  const n = Math.min(buf.written, buf.capacity)
  return buf.tEnd - (n - 1) / buf.fs
}

export function lastVentricularPeak(buf: EcgRingBuffer): number | null {
  const peaks = buf.ventricularPeaks_s
  if (peaks.length === 0) return null
  return peaks[peaks.length - 1]!
}

export function previousVentricularPeak(buf: EcgRingBuffer): number | null {
  const peaks = buf.ventricularPeaks_s
  if (peaks.length < 2) return peaks[0] ?? null
  return peaks[peaks.length - 2]!
}

export function clearRingBuffer(buf: EcgRingBuffer): void {
  buf.write = 0
  buf.written = 0
  buf.tEnd = 0
  buf.ventricularPeaks_s = []
  for (const name of LEAD_ORDER) buf.leads[name].fill(0)
}
