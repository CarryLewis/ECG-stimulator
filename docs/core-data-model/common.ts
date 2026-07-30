/**
 * Shared primitive types for the ECG Stimulator core data model.
 *
 * Units (SI-aligned clinical convention):
 * - time: seconds (s) unless named `_ms`
 * - voltage: millivolts (mV)
 * - rate: beats per minute (bpm)
 * - length: body-coordinate scene units (anatomy) or metres when noted
 *
 * Body axes (patient standing, anterior view):
 * - +x = patient's left
 * - +y = superior
 * - +z = anterior
 */

/** Absolute simulation time in seconds. */
export type TimeSeconds = number

/** Duration in seconds. */
export type DurationSeconds = number

/** Duration in milliseconds (clinical PR/QRS reporting). */
export type DurationMs = number

/** Heart rate in beats per minute. */
export type BeatsPerMinute = number

/** Electrical potential in millivolts. */
export type Millivolts = number

/** Unitless intensity in [0, 1] for animation / wavefront strength. */
export type UnitInterval = number

/** Deterministic seed for irregular rhythms (e.g. AF RR). */
export type RandomSeed = number

/** Unique id for a simulated cardiac cycle (one “heartbeat” instance). */
export type HeartbeatId = string

/** Unique id for a discrete physiological event. */
export type EventId = string

/** 3D vector in body coordinates. */
export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Optional spatial pose for visualization adapters (not physics). */
export interface SpatialPose {
  position: Vec3
  /** Euler radians: pitch (x), yaw (y), roll (z). */
  rotation?: Vec3
  scale?: number | Vec3
}

/** ISO-ish locale keys used by clinical copy (content lives outside this model). */
export type LocaleCode = 'en' | 'zh'

/**
 * Soft version tag so pathology packs and anatomy assets can evolve
 * without breaking stored fixtures.
 */
export interface ModelVersion {
  major: number
  minor: number
  patch: number
}
