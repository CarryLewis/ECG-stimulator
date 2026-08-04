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
 *
 * Lead II target morphology (normal sinus, First Aid reference):
 *   P ≈ 0.10–0.15 mV · PR ≈ 160 ms · QRS < 100 ms · R ≈ 1.0 mV
 *   ST isoelectric · T ≈ 0.25–0.35 mV
 */
export function dipoleFromConduction(
  plan: CyclePlan,
  state: ConductionState,
): CardiacVector {
  let x = 0
  let y = 0
  let z = 0

  // Atrial depolarisation — inferior / slightly leftward (small upright P in II).
  // Kept low so P is ~1 small square (0.1 mV), not a tall hump.
  const p = state.atrialDepol
  x += 0.05 * p
  y += 0.12 * p
  z += 0.02 * p

  // Septal L→R — early QRS vector toward the right / anterior (r in V1, q in I/V6).
  const sep = state.septalDepol
  x += -0.28 * sep
  y += 0.04 * sep
  z += 0.45 * sep

  // Apical / free-wall depolarisation — main QRS (left, inferior). R ≈ 1 mV in II.
  const ap = state.apicalDepol
  x += 0.78 * ap
  y += 0.88 * ap
  z += 0.32 * ap

  // Late basal activation — modest terminal S (avoid deep S / ST drag).
  const bas = state.basalDepol
  x += -0.35 * bas
  y += -0.1 * bas
  z += -0.3 * bas

  // Repolarisation — concordant T, shorter than R (~0.3 mV in II).
  const t = state.repol
  x += 0.2 * t
  y += 0.25 * t
  z += 0.1 * t

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
