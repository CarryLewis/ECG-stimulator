/**
 * Disease Simulation Engine
 *
 * Diseases modify the physiological model. ECG morphology emerges from:
 *
 *   Cardiac anatomy
 *         ↓
 *   Electrophysiology
 *         ↓
 *   Electrical activation
 *         ↓
 *   Electrical vector
 *         ↓
 *   Body surface potential
 *         ↓
 *   12-lead ECG
 *         ↓
 *   Clinical interpretation
 *
 * @see ../../docs/disease-architecture.md
 */

import { DISEASE_LIBRARY } from './library'
import { clearDiseaseRegistry, registerDiseases } from './registry'

export * from './types'
export * from './physiology'
export * from './registry'
export * from './engine'
export * from './library'

let initialized = false

/** Idempotent registration of the first disease library. */
export function initializeDiseaseEngine(): void {
  if (initialized) return
  registerDiseases(DISEASE_LIBRARY)
  initialized = true
}

/** Test helper — clears and re-registers the stock library. */
export function resetDiseaseEngine(): void {
  clearDiseaseRegistry()
  initialized = false
  initializeDiseaseEngine()
}

// Auto-register on module load for app convenience.
initializeDiseaseEngine()
