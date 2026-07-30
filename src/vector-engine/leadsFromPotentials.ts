import type { LeadName } from '../ecg/types'
import type { BodySurfacePotentials } from './bodySurface'
import type { LeadVoltages } from './types'
import { LEAD_ORDER } from './leads'

/**
 * Lead calculation from body-surface electrode potentials.
 *
 * Limb (Einthoven):
 *   I   = LA − RA
 *   II  = LL − RA
 *   III = LL − LA
 *
 * Augmented (Goldberger):
 *   aVR = RA − (LA + LL) / 2
 *   aVL = LA − (RA + LL) / 2
 *   aVF = LL − (RA + LA) / 2
 *
 * Precordial (Wilson):
 *   Vn = Φ(Vn) − Wilson CT ,  CT = (RA + LA + LL) / 3
 *
 * ECG morphology is entirely determined upstream by cardiac activation →
 * electrical vector → these surface potentials.
 */
export function calculateLeadsFromPotentials(
  surface: BodySurfacePotentials,
): LeadVoltages {
  const e = surface.electrodes
  const ct = surface.wilsonCT

  const leads: Record<LeadName, number> = {
    I: e.LA - e.RA,
    II: e.LL - e.RA,
    III: e.LL - e.LA,
    aVR: e.RA - (e.LA + e.LL) / 2,
    aVL: e.LA - (e.RA + e.LL) / 2,
    aVF: e.LL - (e.RA + e.LA) / 2,
    V1: e.V1 - ct,
    V2: e.V2 - ct,
    V3: e.V3 - ct,
    V4: e.V4 - ct,
    V5: e.V5 - ct,
    V6: e.V6 - ct,
  }

  return { t: surface.t, leads }
}

export function leadOrder(): readonly LeadName[] {
  return LEAD_ORDER
}
