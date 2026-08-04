import { conductionAt } from './conduction'
import { LEAD_BY_NAME, TERRITORY_VECTOR } from './leads'
import type {
  CardiacVector,
  ConductionState,
  CyclePlan,
  LeadName,
  Territory,
} from './types'

/**
 * Instantaneous cardiac dipole from the shared conduction state.
 *
 * Sequential wavefronts (atrial → septal → apical → basal → repolarisation)
 * each contribute a characteristic vector. Disease modifiers from `CyclePlan`
 * scale these contributions and inject territory-specific injury current
 * during the ST window.
 */
export function dipoleFromConduction(
  plan: CyclePlan,
  state: ConductionState,
): CardiacVector {
  let x = 0
  let y = 0
  let z = 0

  // Atrial depolarisation — inferior / slightly leftward (P wave in II).
  const p = state.atrialDepol
  x += 0.18 * p
  y += 0.42 * p
  z += 0.05 * p

  // Septal L→R — early QRS vector toward the right / anterior (r in V1, q in I/V6).
  const sep = state.septalDepol
  x += -0.45 * sep
  y += 0.05 * sep
  z += 0.7 * sep

  // Apical / free-wall depolarisation — main QRS (left, inferior, anterior).
  const ap = state.apicalDepol
  x += 1.25 * ap
  y += 0.95 * ap
  z += 0.55 * ap

  // Late basal activation — residual toward right / superior / posterior (S in V1–V2).
  const bas = state.basalDepol
  x += -0.85 * bas
  y += -0.2 * bas
  z += -0.75 * bas

  // Repolarisation — same polarity as the main QRS (upright T in left leads).
  const t = state.repol
  x += 0.55 * t
  y += 0.4 * t
  z += 0.35 * t

  // U wave — late after-potential along the T axis.
  if (plan.uAmp > 0 && state.repol > 0.02) {
    const u = plan.uAmp * state.repol
    x += 0.4 * u
    y += 0.3 * u
    z += 0.2 * u
  }

  // Global ST offset (e.g. hypokalemia depression).
  if (plan.stGlobal !== 0 && state.stWindow > 0) {
    const g = plan.stGlobal * state.stWindow
    x += 0.3 * g
    y += 0.5 * g
    z += 0.2 * g
  }

  // Regional injury current (STEMI elevation / reciprocal depression).
  for (const [terr, mv] of Object.entries(plan.stByTerritory) as [
    Territory,
    number,
  ][]) {
    if (!mv || terr === 'none') continue
    const dir = TERRITORY_VECTOR[terr as Exclude<Territory, 'none'>]
    if (!dir) continue
    const a = mv * state.stWindow
    x += dir.x * a
    y += dir.y * a
    z += dir.z * a
  }

  // Fibrillatory atrial wavelets — small chaotic dipole, no organised P.
  if (plan.fibrillatoryBaseline) {
    const f = state.atrialDepol
    x += 0.08 * f * Math.sin(state.atria * 17)
    y += 0.06 * f * Math.cos(state.atria * 13)
    z += 0.05 * f * Math.sin(state.atria * 23)
  }

  // Atrial flutter — continuous inferiorly directed F-wave vector.
  if (plan.flutterBaseline) {
    const f = state.atrialDepol
    x += 0.05 * f
    y += 0.22 * f
    z += 0.04 * f
  }

  return { x, y, z }
}

/** Project the cardiac dipole onto a lead axis → millivolts. */
export function projectLead(dipole: CardiacVector, lead: LeadName): number {
  const axis = LEAD_BY_NAME[lead]
  return dipole.x * axis.x + dipole.y * axis.y + dipole.z * axis.z
}

/** Convenience: conduction → dipole → lead voltage at absolute time `t`. */
export function voltageAt(
  plan: CyclePlan,
  t: number,
  lead: LeadName,
): number {
  const state = conductionAt(plan, t)
  return projectLead(dipoleFromConduction(plan, state), lead)
}
