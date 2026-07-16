import type { LeadConfig, LeadName } from './types'

/**
 * Per-lead morphology multipliers relative to a reference beat (roughly lead II).
 * These are hand-tuned to reproduce the characteristic look of each of the
 * standard 12 leads (e.g. dominant R in II/V5/V6, deep S with small r in V1,
 * globally negative complex in aVR, precordial R-wave progression).
 */
export const LEAD_CONFIGS: LeadConfig[] = [
  { name: 'I', p: 0.7, r: 0.7, s: 0.5, t: 0.7, territory: 'lateral' },
  { name: 'II', p: 1.0, r: 1.0, s: 0.6, t: 1.0, territory: 'inferior' },
  { name: 'III', p: 0.4, r: 0.55, s: 0.5, t: 0.35, territory: 'inferior' },
  { name: 'aVR', p: -0.6, r: -0.55, s: -0.2, t: -0.6, territory: 'none' },
  { name: 'aVL', p: 0.4, r: 0.5, s: 0.4, t: 0.45, territory: 'lateral' },
  { name: 'aVF', p: 0.7, r: 0.75, s: 0.5, t: 0.6, territory: 'inferior' },
  { name: 'V1', p: 0.35, r: 0.25, s: 1.7, t: -0.15, territory: 'septal' },
  { name: 'V2', p: 0.4, r: 0.45, s: 2.0, t: 0.6, territory: 'anterior' },
  { name: 'V3', p: 0.5, r: 0.85, s: 1.3, t: 0.8, territory: 'anterior' },
  { name: 'V4', p: 0.55, r: 1.4, s: 0.7, t: 0.95, territory: 'anterior' },
  { name: 'V5', p: 0.6, r: 1.4, s: 0.3, t: 0.8, territory: 'lateral' },
  { name: 'V6', p: 0.6, r: 1.15, s: 0.2, t: 0.6, territory: 'lateral' },
]

export const LEAD_ORDER: LeadName[] = LEAD_CONFIGS.map((l) => l.name)

/** Standard 12-lead print layout: 4 columns x 3 rows. */
export const LEAD_GRID: LeadName[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]
