/**
 * Normal-sinus physiological timings within one cardiac cycle.
 * Offsets are relative to SA-node onset (t_cycle = 0).
 *
 * Spec:
 *   0 ms   SA node activation
 *  40 ms   atrial depolarization
 * 120 ms   AV delay
 * 200 ms   ventricular activation
 * 350 ms   repolarization
 *
 * His → bundles → Purkinje are staggered inside the ventricular window
 * so the conduction tree lights in anatomical order.
 */
export const SINUS_OFFSET_S = {
  sa: 0,
  atrial: 0.04,
  av: 0.12,
  his: 0.2,
  bundle: 0.22,
  purkinje: 0.245,
  ventricular: 0.2,
  repolarization: 0.35,
} as const

/** Envelope half-widths (seconds) for sampling intensity around each event. */
export const SINUS_WIDTH_S = {
  sa: 0.028,
  atrial: 0.045,
  av: 0.055,
  his: 0.028,
  bundle: 0.032,
  purkinje: 0.04,
  ventricle: 0.05,
  repol: 0.055,
} as const

export const DEFAULT_HEART_RATE_BPM = 72

export function cycleLength_s(rateBpm: number): number {
  return 60 / Math.max(30, Math.min(200, rateBpm))
}
