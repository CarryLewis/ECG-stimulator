/**
 * Bridge: PhysiologicalModel → CyclePlan for the ECG / conduction sampler.
 *
 * Disease ids never enter the ECG generator — only these emergent flags.
 */

import type { CyclePlan, Territory } from '../ecg/types'
import type { PhysiologicalModel } from './types'

const INVOLVED: Record<string, Territory[]> = {
  anterior: ['anterior', 'septal'],
  inferior: ['inferior'],
  lateral: ['lateral'],
  posterior: ['posterior'],
  septal: ['septal'],
}

const RECIPROCAL_ST_SCALE = 0.5

/** Max ST elevation (mV) at full occlusion severity. */
const ST_ELEVATION_MAX = 0.45

/**
 * Project a resolved physiological model onto the CyclePlan consumed by
 * conduction sampling and dipole → 12-lead projection.
 */
export function physiologicalModelToCyclePlan(
  model: PhysiologicalModel,
): CyclePlan {
  const stByTerritory: Partial<Record<Territory, number>> = {}

  if (model.injuryCurrentEnabled) {
    for (const [terr, sev] of Object.entries(model.ischemia) as [
      Territory,
      number,
    ][]) {
      if (!sev || terr === 'none') continue
      const elevation = ST_ELEVATION_MAX * sev
      for (const involved of INVOLVED[terr] ?? [terr]) {
        stByTerritory[involved] = Math.max(
          stByTerritory[involved] ?? 0,
          elevation,
        )
      }
    }
    for (const [terr, sev] of Object.entries(model.reciprocalIschemia) as [
      Territory,
      number,
    ][]) {
      if (!sev || terr === 'none') continue
      stByTerritory[terr] = Math.min(
        stByTerritory[terr] ?? 0,
        -ST_ELEVATION_MAX * sev * RECIPROCAL_ST_SCALE,
      )
    }
  }

  const vf = model.ventricularMode === 'fibrillation'
  const vflutter = model.ventricularMode === 'flutter'
  const af = model.atrialMode === 'fibrillation'
  const aflutter = model.atrialMode === 'flutter'
  const dissociated =
    model.avBlock === 'third' ||
    model.ventricularMode === 'escape' ||
    model.ventricularMode === 'tachycardia' ||
    vf ||
    vflutter

  const irregular =
    af ||
    model.ventricularMode === 'irregular' ||
    model.avBlock === 'second_type1' ||
    model.avBlock === 'second_type2'

  // Flutter amplitude was encoded via conductionVelocityScale in the pack.
  const chaosAmplitude = vf
    ? Math.min(1, Math.max(0.2, (model.qrsDurationScale - 2.5) / 1.0 + 0.5))
    : vflutter
      ? Math.min(1, Math.max(0.4, model.conductionVelocityScale))
      : 0

  return {
    ventricularRate: model.ventricularRate_bpm,
    atrialRate: model.atrialRate_bpm,
    prInterval: model.avDelay_s,
    qrsWidthFactor: model.qrsDurationScale,
    pAmpFactor: model.pAmplitudeScale,
    tAmpFactor: model.repolarization.tAmplitudeScale,
    tWidthFactor: model.repolarization.tWidthScale,
    uAmp: model.repolarization.uAmplitude_mV,
    stGlobal: model.repolarization.stGlobal_mV,
    stByTerritory,
    irregular: irregular && !vf && !vflutter,
    dissociated,
    fibrillatoryBaseline: af,
    flutterBaseline: aflutter,
    ventricularFibrillation: vf,
    ventricularFlutter: vflutter,
    chaosAmplitude,
    rhythmSeed: model.rhythmSeed,
  }
}
