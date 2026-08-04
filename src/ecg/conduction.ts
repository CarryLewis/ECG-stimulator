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

type Status = ConductionState['status']

/**
 * Shared conduction timeline used by both the heart diagram and the ECG dipole.
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
      status: {
        en: 'Ventricular fibrillation — chaotic wavelets, no organized QRS',
        zh: '心室颤动 — 紊乱微波，无有序 QRS',
      },
      atrialDepol: 0,
      septalDepol: v * 0.55 * Math.sin(elapsed * 29),
      apicalDepol: v * (0.5 + 0.5 * Math.sin(elapsed * 41 + 0.7)),
      basalDepol: v * (0.5 + 0.5 * Math.cos(elapsed * 47 + 1.3)),
      repol: 0,
      stWindow: 0,
    }
  }

  if (plan.ventricularFlutter) {
    const amp = plan.chaosAmplitude || 0.85
    const phase = ((elapsed % tVent) + tVent) % tVent
    const sine = Math.sin((2 * Math.PI * phase) / tVent)
    const v = amp * (0.55 + 0.45 * Math.abs(sine))
    const rate = Math.round(plan.ventricularRate)
    return {
      sa: 0.05,
      atria: 0.05,
      av: 0,
      his: v * 0.5,
      bundle: v * 0.75,
      ventricle: v,
      avConducts: false,
      status: {
        en: `Ventricular flutter — sine-wave reentry @ ${rate} /min`,
        zh: `心室扑动 — 正弦波折返 @ ${rate} 次/分`,
      },
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
    const flutterCycle = 60 / Math.max(1, plan.atrialRate)
    const fPhase = ((elapsed % flutterCycle) + flutterCycle) % flutterCycle
    const f =
      0.55 + 0.45 * Math.abs(Math.sin((2 * Math.PI * fPhase) / flutterCycle))
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

  const status: Status = plan.fibrillatoryBaseline
    ? {
        en: 'No organised atrial activity — chaotic fibrillatory wavelets',
        zh: '无有序心房活动 — 紊乱颤动微波',
      }
    : plan.flutterBaseline
      ? {
          en: `Atrial flutter — continuous F waves @ ~${Math.round(plan.atrialRate)} /min`,
          zh: `心房扑动 — 连续 F 波 @ 约 ${Math.round(plan.atrialRate)} 次/分`,
        }
      : plan.dissociated
        ? {
            en: 'Complete block — atria and ventricles beat independently',
            zh: '完全阻滞 — 心房与心室独立搏动',
          }
        : {
            en: `AV delay (PR): ${Math.round(pr * 1000)} ms`,
            zh: `房室延迟（PR）：${Math.round(pr * 1000)} ms`,
          }

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
