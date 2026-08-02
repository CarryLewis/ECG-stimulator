/**
 * ECG recording calibration & display modes.
 *
 * Paper convention:
 *   sweep 25 mm/s · gain 10 mm/mV · small square 1 mm · large square 5 mm
 */

import type { LeadName } from '../ecg/types'
import { LEAD_ORDER, LEAD_PRINT_GRID, SIX_LEAD_SET } from '../ecg/leads'

/** Standard diagnostic paper / monitor sweep speeds. */
export type SweepSpeedMmPerS = 25 | 50 | 100

export type DisplayMode = 'monitor' | 'paper'

export type LeadLayoutMode = 'lead_ii' | 'single' | 'six' | 'twelve'

/** 500 Hz keeps narrow QRS peaks from becoming single-pixel needles at 25 mm/s. */
export const DEFAULT_FS_HZ = 500
export const DEFAULT_GAIN_MM_PER_MV = 10
export const DEFAULT_SWEEP: SweepSpeedMmPerS = 25
/** Visible history length on a bedside cascade strip (seconds). */
export const DEFAULT_STRIP_SECONDS = 8
/** Longer persistent history for freeze / replay (seconds). */
export const HISTORY_SECONDS = 30

export interface RecordingCalibration {
  sweep_mm_s: SweepSpeedMmPerS
  gain_mm_mV: number
  /** CSS pixels per millimetre (screen scale). */
  px_per_mm: number
  fs_Hz: number
}

export const DEFAULT_CALIBRATION: RecordingCalibration = {
  sweep_mm_s: DEFAULT_SWEEP,
  gain_mm_mV: DEFAULT_GAIN_MM_PER_MV,
  px_per_mm: 4.2,
  fs_Hz: DEFAULT_FS_HZ,
}

export function pxPerSecond(cal: RecordingCalibration): number {
  return cal.sweep_mm_s * cal.px_per_mm
}

export function pxPerMv(cal: RecordingCalibration): number {
  return cal.gain_mm_mV * cal.px_per_mm
}

export function leadsForLayout(
  mode: LeadLayoutMode,
  selected: LeadName = 'II',
): readonly LeadName[] {
  switch (mode) {
    case 'lead_ii':
      return ['II']
    case 'single':
      return [selected]
    case 'six':
      return SIX_LEAD_SET
    case 'twelve':
      return LEAD_ORDER
  }
}

export function gridForLayout(
  mode: LeadLayoutMode,
  selected: LeadName = 'II',
): readonly (readonly LeadName[])[] {
  switch (mode) {
    case 'lead_ii':
      return [['II']]
    case 'single':
      return [[selected]]
    case 'six':
      return [
        ['I', 'II', 'III'],
        ['aVR', 'aVL', 'aVF'],
      ]
    case 'twelve':
      return LEAD_PRINT_GRID
  }
}

export const SWEEP_OPTIONS: readonly SweepSpeedMmPerS[] = [25, 50, 100]
