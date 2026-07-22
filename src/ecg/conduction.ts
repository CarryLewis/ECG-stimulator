import { irregularBeatOnset } from './beats'
import type { ConductionState, CyclePlan } from './types'

function gauss(x: number, c: number, w: number): number {
  const d = x - c
  return Math.exp(-(d * d) / (2 * w * w))
}

/** Smooth trapezoid covering the ST segment after QRS onset. */
function stShape(dt: number): number {
  if (dt <= 0.02 || dt >= 0.26) return 0
  if (dt < 0.06) return (dt - 0.02) / 0.04
  if (dt < 0.18) return 1
  return 1 - (dt - 0.18) / 0.08
}

export interface ConductionOptions {
  /** Seed for the shared AF irregular-RR schedule (must match ECG). */
  afSeed?: number
}

/**
 * Shared conduction timeline used by both the heart diagram and the ECG dipole.
 *
 * Timing convention for a conducted sinus beat: cycle phase 0 = SA / atrial
 * onset, QRS begins at `plan.prInterval`. Dissociation runs independent atrial
 * and ventricular clocks. AF uses an irregular ventricular schedule with no
 * organised atrial phase.
 */
export function conductionAt(
  plan: CyclePlan,
  elapsed: number,
  opts: ConductionOptions = {},
): ConductionState {
  const tVent = 60 / plan.ventricularRate
  const tAtrial = 60 / plan.atrialRate
  const pr = plan.prInterval
  const qrs = plan.qrsWidthFactor
  const afSeed = opts.afSeed ?? 23

  let ventPhase: number
  let atrialPhase: number

  if (plan.irregular) {
    const onset = irregularBeatOnset(plan, elapsed, afSeed)
    // Irregular beat onset = QRS time (no PR coupling).
    ventPhase = elapsed - onset
    atrialPhase = ventPhase
  } else if (plan.dissociated) {
    ventPhase = ((elapsed % tVent) + tVent) % tVent
    atrialPhase = ((elapsed % tAtrial) + tAtrial) % tAtrial
  } else {
    ventPhase = ((elapsed % tVent) + tVent) % tVent
    atrialPhase = ventPhase
  }

  let sa: number
  let atria: number
  let atrialDepol: number

  if (plan.fibrillatoryBaseline) {
    const flicker = 0.35 + 0.4 * Math.abs(Math.sin(elapsed * 41.0))
    sa = 0.15
    atria = flicker
    atrialDepol = flicker * 0.55
  } else {
    sa = Math.max(
      gauss(atrialPhase, 0, 0.03),
      gauss(atrialPhase, tAtrial, 0.03),
    )
    atria = gauss(atrialPhase, 0.05, 0.05)
    atrialDepol =
      plan.pAmpFactor *
      Math.max(
        gauss(atrialPhase, 0.04, 0.022),
        gauss(atrialPhase, tAtrial + 0.04, 0.022),
      )
  }

  const avConducts = !plan.dissociated && !plan.fibrillatoryBaseline
  const av = avConducts ? gauss(ventPhase, pr * 0.55, 0.06) : 0

  // Ventricular activation relative to QRS onset.
  // Conducted sinus: QRS at PR. Escape / AF: QRS at phase 0 (beat onset).
  const qrsOnset = plan.dissociated || plan.irregular ? 0 : pr
  const his = gauss(ventPhase, qrsOnset, 0.03 * qrs)
  const bundle = gauss(ventPhase, qrsOnset + 0.03 * qrs, 0.035 * qrs)
  const ventricle = gauss(ventPhase, qrsOnset + 0.07 * qrs, 0.055 * qrs)

  const septalDepol = gauss(ventPhase, qrsOnset + 0.01 * qrs, 0.012 * qrs)
  const apicalDepol = gauss(ventPhase, qrsOnset + 0.035 * qrs, 0.014 * qrs)
  const basalDepol = gauss(ventPhase, qrsOnset + 0.06 * qrs, 0.016 * qrs)

  const tCenter = qrsOnset + 0.22 * plan.tWidthFactor
  const tWidth = 0.055 * plan.tWidthFactor
  const repol = plan.tAmpFactor * gauss(ventPhase, tCenter, tWidth)

  const stWindow = stShape(ventPhase - qrsOnset)

  const status = plan.fibrillatoryBaseline
    ? 'No organised atrial activity — chaotic fibrillatory wavelets'
    : plan.dissociated
      ? 'Complete block — atria and ventricles beat independently'
      : `AV delay (PR): ${Math.round(pr * 1000)} ms`

  return {
    sa,
    atria,
    av,
    his,
    bundle,
    ventricle,
    avConducts,
    status,
    atrialDepol,
    septalDepol,
    apicalDepol,
    basalDepol,
    repol,
    stWindow,
  }
}
