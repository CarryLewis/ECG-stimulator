import { TERRITORY_VECTOR } from './leads'
import type {
  InstantaneousElectricalField,
  MyocardialWavefronts,
  TissueModifiers,
  VectorContribution,
} from './types'
import { DEFAULT_TISSUE } from './types'
import {
  WAVEFRONT_DIRECTION,
  addVectors,
  scaleVector,
} from './wavefronts'

export interface EvaluateFieldInput {
  t: number
  wavefronts: MyocardialWavefronts
  tissue?: Partial<TissueModifiers>
}

/**
 * Electrical Vector Engine — convert myocardial activation into an
 * instantaneous equivalent cardiac dipole + named contributions.
 *
 * Consumes EP wavefront intensities (+ optional tissue modifiers).
 * Does not invent disease millivolts; injury current follows TissueState.
 */
export function evaluateElectricalField(
  input: EvaluateFieldInput,
): InstantaneousElectricalField {
  const tissue: TissueModifiers = { ...DEFAULT_TISSUE, ...input.tissue }
  const w = input.wavefronts
  const contributions: VectorContribution[] = []

  pushContribution(
    contributions,
    'atrial_depol',
    w.atriaOrganized ? w.atrialDepol : 0,
    WAVEFRONT_DIRECTION.atrial_depol,
  )

  pushContribution(
    contributions,
    'septal_depol',
    w.septalDepol,
    WAVEFRONT_DIRECTION.septal_depol,
  )
  pushContribution(
    contributions,
    'apical_depol',
    w.apicalDepol,
    WAVEFRONT_DIRECTION.apical_depol,
  )
  pushContribution(
    contributions,
    'basal_depol',
    w.basalDepol,
    WAVEFRONT_DIRECTION.basal_depol,
  )
  pushContribution(
    contributions,
    'ventricular_repol',
    w.repol * tissue.repolarizationAmpScale,
    WAVEFRONT_DIRECTION.ventricular_repol,
  )

  if (tissue.uAmp_mV > 0 && w.repol > 0.02) {
    const u = tissue.uAmp_mV * w.repol
    contributions.push({
      kind: 'u_wave',
      weight: Math.min(1, w.repol),
      vector: scaleVector(WAVEFRONT_DIRECTION.ventricular_repol, u),
    })
  }

  if (tissue.stGlobal_mV !== 0 && w.stWindow > 0) {
    const g = tissue.stGlobal_mV * w.stWindow
    contributions.push({
      kind: 'global_st',
      weight: w.stWindow,
      vector: { x: 0.3 * g, y: 0.5 * g, z: 0.2 * g },
    })
  }

  if (tissue.injuryCurrentEnabled && w.stWindow > 0) {
    for (const [terr, severity] of Object.entries(tissue.ischemia) as [
      keyof typeof TERRITORY_VECTOR,
      number,
    ][]) {
      if (!severity || severity <= 0) continue
      const dir = TERRITORY_VECTOR[terr]
      if (!dir) continue
      const a = severity * w.stWindow
      contributions.push({
        kind: 'injury_current',
        tag: `ischemia.${terr}`,
        weight: Math.min(1, severity * w.stWindow),
        vector: scaleVector(dir, a),
      })
    }
  }

  if (tissue.fibrillatoryBaseline || !w.atriaOrganized) {
    const f = w.atrialDepol
    if (f > 0.01) {
      contributions.push({
        kind: 'fibrillatory',
        weight: Math.min(1, f),
        vector: {
          x: 0.08 * f * Math.sin(input.t * 17),
          y: 0.06 * f * Math.cos(input.t * 13),
          z: 0.05 * f * Math.sin(input.t * 23),
        },
      })
    }
  }

  let dipole = { x: 0, y: 0, z: 0 }
  for (const c of contributions) {
    dipole = addVectors(dipole, c.vector)
  }

  return {
    t: input.t,
    dipole,
    contributions,
  }
}

function pushContribution(
  out: VectorContribution[],
  kind: VectorContribution['kind'],
  weight: number,
  direction: { x: number; y: number; z: number },
) {
  if (weight <= 1e-4) return
  const w = Math.min(1, Math.max(0, weight))
  out.push({
    kind,
    weight: w,
    vector: scaleVector(direction, w),
  })
}

/**
 * Ventricular depolarization vector = septal + apical + basal contributions.
 * Used for mean QRS axis / teaching arrow.
 */
export function ventricularDepolarizationVector(
  field: InstantaneousElectricalField,
): { x: number; y: number; z: number } {
  let v = { x: 0, y: 0, z: 0 }
  for (const c of field.contributions) {
    if (
      c.kind === 'septal_depol' ||
      c.kind === 'apical_depol' ||
      c.kind === 'basal_depol'
    ) {
      v = addVectors(v, c.vector)
    }
  }
  return v
}
