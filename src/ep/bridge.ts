import type { ConductionState } from '../ecg/types'
import type { MyocardialWavefronts, TissueModifiers } from '../vector-engine'
import { DEFAULT_TISSUE } from '../vector-engine'

/**
 * Bridge: Cardiac Electrophysiology Engine → Vector Engine.
 *
 * Maps the live conduction / wavefront state into the myocardial activation
 * intensities the vector engine expects. No ECG millivolts here.
 */
export function wavefrontsFromConduction(
  state: ConductionState,
  atriaOrganized = true,
): MyocardialWavefronts {
  return {
    atrialDepol: state.atrialDepol,
    septalDepol: state.septalDepol,
    apicalDepol: state.apicalDepol,
    basalDepol: state.basalDepol,
    repol: state.repol,
    stWindow: state.stWindow,
    atriaOrganized,
  }
}

/** Normal sinus tissue modifiers (no ischemia / electrolyte packs yet). */
export function defaultSinusTissue(): TissueModifiers {
  return { ...DEFAULT_TISSUE }
}

/**
 * Convenience: EP conduction frame → vector-engine evaluate input.
 */
export function vectorInputFromConduction(
  t: number,
  state: ConductionState,
  tissue: Partial<TissueModifiers> = {},
) {
  const atriaOrganized = !(tissue.fibrillatoryBaseline ?? false)
  return {
    t,
    wavefronts: wavefrontsFromConduction(state, atriaOrganized),
    tissue: { ...defaultSinusTissue(), ...tissue },
  }
}
