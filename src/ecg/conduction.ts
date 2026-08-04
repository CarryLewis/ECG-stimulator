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
 * organised atrial phase. VF / ventricular flutter replace organized QRS with
 * chaotic or sine-wave ventricular activation.
 */
export function conductionAt(
  plan: CyclePlan,
  elapsed: number,
  opts: ConductionOptions = {},
): ConductionState {
  const tVent = 60 / Math.max(1, plan.ventricularRate)
  const tAtrial = 60 / Math.max(1, plan.atrialRate)
  const pr = plan.prInterval
  const qrs = plan.qrsWidthFactor
  const afSeed = opts.afSeed ?? plan.rhythmSeed ?? 23

  // --- Ventricular fibrillation: chaotic myocardial wavelets ---
  if (plan.ventricularFibrillation) {
    const amp = plan.chaosAmplitude || 0.7
    const flicker =
      0.45 +
      0.55 *
        Math.abs(
          Math.sin(elapsed * 37.0) * 0.6 +
            Math.sin(elapsed * 53.0 + 1.1) * 0.4,
        )
    const v = amp * flicker
    return {
      sa: 0.05,
      atria: 0.08,
      av: 0,
      his: v * 0.4,
      bundle: v * 0.7,
      ventricle: v,
      avConducts: false,
      status: 'Ventricular fibrillation — chaotic wavelets, no organized QRS',
      atrialDepol: 0,
      septalDepol: v * 0.55 * Math.sin(elapsed * 29),
      apicalDepol: v * (0.5 + 0.5 * Math.sin(elapsed * 41 + 0.7)),
      basalDepol: v * (0.5 + 0.5 * Math.cos(elapsed * 47 + 1.3)),
      repol: 0,
      stWindow: 0,
    }
  }

  // --- Ventricular flutter: rapid regular sine-wave activation ---
  if (plan.ventricularFlutter) {
    const amp = plan.chaosAmplitude || 0.85
    const phase = ((elapsed % tVent) + tVent) % tVent
    const sine = Math.sin((2 * Math.PI * phase) / tVent)
    const v = amp * (0.55 + 0.45 * Math.abs(sine))
    return {
      sa: 0.05,
      atria: 0.05,
      av: 0,
      his: v * 0.5,
      bundle: v * 0.75,
      ventricle: v,
      avConducts: false,
      status: `Ventricular flutter — sine-wave reentry @ ${Math.round(plan.ventricularRate)} /min`,
      atrialDepol: 0,
      septalDepol: amp * 0.4 * sine,
      apicalDepol: amp * sine,
      basalDepol: amp * 0.7 * sine,
      repol: amp * 0.3 * Math.sin((2 * Math.PI * phase) / tVent + Math.PI),
      stWindow: 0,
    }
  }

  let ventPhase: number
  let atrialPhase: number

  if (plan.irregular) {
    const onset = irregularBeatOnset(plan, elapsed, afSeed)
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
  } else if (plan.flutterBaseline) {
    // Continuous atrial flutter — rapid regular F-wave activation.
    const flutterCycle = 60 / Math.max(1, plan.atrialRate)
    const fPhase = ((elapsed % flutterCycle) + flutterCycle) % flutterCycle
    const f = 0.55 + 0.45 * Math.abs(Math.sin((2 * Math.PI * fPhase) / flutterCycle))
    sa = 0.2
    atria = f
    atrialDepol = plan.pAmpFactor * f * 0.85
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
    : plan.flutterBaseline
      ? `Atrial flutter — continuous F waves @ ~${Math.round(plan.atrialRate)} /min`
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
