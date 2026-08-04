/**
 * Baseline physiological model + disease effect application.
 *
 * Diseases mutate this model. The EP / vector / ECG layers only observe it.
 */

import type {
  PhysiologicalEffects,
  PhysiologicalModel,
  IschemiaModifier,
} from './types'

export const BASELINE_PHYSIOLOGY: PhysiologicalModel = {
  saRate_bpm: 72,
  atrialRate_bpm: 72,
  ventricularRate_bpm: 72,
  atrialMode: 'sinus',
  ventricularMode: 'conducted',
  avDelay_s: 0.16,
  avBlock: 'none',
  avWenckebachIncrement_s: 0,
  avConductionRatio: null,
  ventricularEscapeRate_bpm: 40,
  flutterCycle_s: null,
  qrsDurationScale: 1,
  pAmplitudeScale: 1,
  conductionVelocityScale: 1,
  actionPotentialDurationScale: 1,
  leftBundle: 'normal',
  rightBundle: 'normal',
  qrsAxis_deg: 60,
  ischemia: {},
  reciprocalIschemia: {},
  injuryCurrentEnabled: false,
  repolarization: {
    tAmplitudeScale: 1,
    tWidthScale: 1,
    uAmplitude_mV: 0,
    stGlobal_mV: 0,
    qtScale: 1,
  },
  potassium_mmol_L: null,
  calcium_mmol_L: null,
  rhythmSeed: 1,
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

function mergeIschemia(
  model: PhysiologicalModel,
  mods: IschemiaModifier | IschemiaModifier[] | undefined,
): void {
  if (!mods) return
  const list = Array.isArray(mods) ? mods : [mods]
  for (const m of list) {
    const sev = clamp01(m.severity)
    if (sev <= 0) continue
    model.ischemia[m.territory] = Math.max(model.ischemia[m.territory] ?? 0, sev)
    model.injuryCurrentEnabled = true
    for (const r of m.reciprocal ?? []) {
      model.reciprocalIschemia[r] = Math.max(
        model.reciprocalIschemia[r] ?? 0,
        sev * 0.5,
      )
    }
  }
}

/**
 * Apply a disease's PhysiologicalEffects onto a baseline (or previous) model.
 * Pure: returns a new object; never writes ECG samples.
 */
export function applyPhysiologicalEffects(
  baseline: PhysiologicalModel,
  effects: PhysiologicalEffects,
): PhysiologicalModel {
  const next: PhysiologicalModel = {
    ...baseline,
    ischemia: { ...baseline.ischemia },
    reciprocalIschemia: { ...baseline.reciprocalIschemia },
    repolarization: { ...baseline.repolarization },
  }

  if (effects.saRate_bpm !== undefined) {
    next.saRate_bpm = effects.saRate_bpm
    if (effects.atrialRate_bpm === undefined && effects.atrialMode !== 'fibrillation') {
      next.atrialRate_bpm = effects.saRate_bpm
    }
    if (
      effects.meanVentricularRate_bpm === undefined &&
      effects.ventricularMode === undefined
    ) {
      next.ventricularRate_bpm = effects.saRate_bpm
    }
  }
  if (effects.atrialRate_bpm !== undefined) next.atrialRate_bpm = effects.atrialRate_bpm
  if (effects.meanVentricularRate_bpm !== undefined) {
    next.ventricularRate_bpm = effects.meanVentricularRate_bpm
  }

  if (effects.atrialMode !== undefined) next.atrialMode = effects.atrialMode
  if (effects.ventricularMode !== undefined) {
    next.ventricularMode = effects.ventricularMode
  }

  if (effects.avDelay_s !== undefined) next.avDelay_s = effects.avDelay_s
  if (effects.avBlock !== undefined) next.avBlock = effects.avBlock
  if (effects.avWenckebachIncrement_s !== undefined) {
    next.avWenckebachIncrement_s = effects.avWenckebachIncrement_s
  }
  if (effects.avConductionRatio !== undefined) {
    next.avConductionRatio = effects.avConductionRatio
  }

  if (effects.ventricularEscapeRate_bpm !== undefined) {
    next.ventricularEscapeRate_bpm = effects.ventricularEscapeRate_bpm
  }
  if (effects.flutterCycle_s !== undefined) {
    next.flutterCycle_s = effects.flutterCycle_s
  }

  if (effects.qrsDurationScale !== undefined) {
    next.qrsDurationScale = effects.qrsDurationScale
  }
  if (effects.pAmplitudeScale !== undefined) {
    next.pAmplitudeScale = effects.pAmplitudeScale
  }
  if (effects.conductionVelocityScale !== undefined) {
    next.conductionVelocityScale = effects.conductionVelocityScale
  }
  if (effects.actionPotentialDurationScale !== undefined) {
    next.actionPotentialDurationScale = effects.actionPotentialDurationScale
  }

  if (effects.bundleBranches) {
    next.leftBundle = effects.bundleBranches.left
    next.rightBundle = effects.bundleBranches.right
    if (effects.bundleBranches.qrsDurationScale !== undefined) {
      next.qrsDurationScale = effects.bundleBranches.qrsDurationScale
    }
    if (effects.bundleBranches.axisShift_deg !== undefined) {
      next.qrsAxis_deg = BASELINE_PHYSIOLOGY.qrsAxis_deg + effects.bundleBranches.axisShift_deg
    }
  }

  mergeIschemia(next, effects.ischemia)

  if (effects.repolarization) {
    next.repolarization = {
      ...next.repolarization,
      ...Object.fromEntries(
        Object.entries(effects.repolarization).filter(([, v]) => v !== undefined),
      ),
    } as Required<typeof next.repolarization>
  }

  if (effects.potassium_mmol_L !== undefined) {
    next.potassium_mmol_L = effects.potassium_mmol_L
  }
  if (effects.calcium_mmol_L !== undefined) {
    next.calcium_mmol_L = effects.calcium_mmol_L
  }
  if (effects.rhythmSeed !== undefined) next.rhythmSeed = effects.rhythmSeed

  // Ventricular dissociation / escape: ventricular rate follows escape clock.
  if (next.avBlock === 'third' || next.ventricularMode === 'escape') {
    next.ventricularRate_bpm = next.ventricularEscapeRate_bpm
    next.ventricularMode = 'escape'
  }

  if (next.ventricularMode === 'fibrillation') {
    next.qrsDurationScale = Math.max(next.qrsDurationScale, 2.5)
    next.pAmplitudeScale = 0
  }

  if (next.ventricularMode === 'flutter') {
    next.pAmplitudeScale = 0
    next.qrsDurationScale = Math.max(next.qrsDurationScale, 2.0)
    if (next.flutterCycle_s == null && next.ventricularRate_bpm > 0) {
      next.flutterCycle_s = 60 / next.ventricularRate_bpm
    }
  }

  if (next.atrialMode === 'fibrillation') {
    next.pAmplitudeScale = 0
    next.ventricularMode =
      next.ventricularMode === 'conducted' ? 'irregular' : next.ventricularMode
  }

  if (next.atrialMode === 'flutter' && next.flutterCycle_s == null) {
    next.flutterCycle_s = 60 / Math.max(1, next.atrialRate_bpm)
  }

  return next
}

/** Healthy baseline — used by Normal Sinus Rhythm and as the apply() root. */
export function createBaselineModel(
  overrides: Partial<PhysiologicalModel> = {},
): PhysiologicalModel {
  return applyPhysiologicalEffects(
    { ...BASELINE_PHYSIOLOGY, ischemia: {}, reciprocalIschemia: {}, repolarization: { ...BASELINE_PHYSIOLOGY.repolarization } },
    {
      saRate_bpm: overrides.saRate_bpm,
      atrialRate_bpm: overrides.atrialRate_bpm,
      meanVentricularRate_bpm: overrides.ventricularRate_bpm,
      atrialMode: overrides.atrialMode,
      ventricularMode: overrides.ventricularMode,
      avDelay_s: overrides.avDelay_s,
      avBlock: overrides.avBlock,
      qrsDurationScale: overrides.qrsDurationScale,
      pAmplitudeScale: overrides.pAmplitudeScale,
      conductionVelocityScale: overrides.conductionVelocityScale,
      actionPotentialDurationScale: overrides.actionPotentialDurationScale,
      potassium_mmol_L: overrides.potassium_mmol_L ?? undefined,
      calcium_mmol_L: overrides.calcium_mmol_L ?? undefined,
      rhythmSeed: overrides.rhythmSeed,
    },
  )
}
