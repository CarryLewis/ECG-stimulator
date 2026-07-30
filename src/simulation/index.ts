/**
 * Physiological ECG simulation engine (presentation-agnostic).
 *
 * Pipeline:
 *   conduction sequence → cardiac dipole M(t) → lead projection → 12-lead ECG
 */

export * from './types'
export * from './cardiacModel'
export * from './conductionSystem'
export * from './vectorGenerator'
export * from './leadSystem'
export * from './ecgGenerator'
export * from './validateEcg'
export { usePhysiologicalEcg } from './usePhysiologicalEcg'
