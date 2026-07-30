import type { ConductionState } from '../ecg/types'

/** Static resting activation — anatomy viewing without disease simulation. */
export const IDLE_CONDUCTION: ConductionState = {
  sa: 0,
  atria: 0,
  av: 0,
  his: 0,
  bundle: 0,
  ventricle: 0,
  avConducts: true,
  status: 'Anatomy view — conduction idle',
  atrialDepol: 0,
  septalDepol: 0,
  apicalDepol: 0,
  basalDepol: 0,
  repol: 0,
  stWindow: 0,
}
