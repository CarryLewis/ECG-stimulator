/**
 * First disease library — physiology-driven packs.
 *
 * Each export is a DiseaseDefinition: anatomy → mechanism → EP/conduction
 * modifiers → emergent ECG expectations + clinical teaching.
 */

import {
  atrialFibrillation,
  atrialFlutter,
  ventricularFibrillation,
  ventricularFlutter,
  ventricularTachycardia,
} from './arrhythmias'
import { firstDegreeAvBlock, mobitzI, mobitzII, thirdDegreeAvBlock } from './avBlocks'
import { leftBundleBranchBlock, rightBundleBranchBlock } from './bundleBranchBlocks'
import {
  hypercalcemia,
  hyperkalemia,
  hypocalcemia,
  hypokalemia,
} from './electrolytes'
import { normalSinusRhythm } from './normalSinusRhythm'
import {
  anteriorStemi,
  inferiorStemi,
  lateralStemi,
  posteriorMi,
} from './stemi'
import type { DiseaseDefinition } from '../types'

export const DISEASE_LIBRARY: readonly DiseaseDefinition[] = [
  normalSinusRhythm,
  anteriorStemi,
  inferiorStemi,
  lateralStemi,
  posteriorMi,
  leftBundleBranchBlock,
  rightBundleBranchBlock,
  firstDegreeAvBlock,
  mobitzI,
  mobitzII,
  thirdDegreeAvBlock,
  atrialFibrillation,
  atrialFlutter,
  ventricularTachycardia,
  ventricularFlutter,
  ventricularFibrillation,
  hyperkalemia,
  hypokalemia,
  hypercalcemia,
  hypocalcemia,
] as const

export const DISEASE_LIBRARY_IDS = DISEASE_LIBRARY.map((d) => d.id)

export {
  normalSinusRhythm,
  anteriorStemi,
  inferiorStemi,
  lateralStemi,
  posteriorMi,
  leftBundleBranchBlock,
  rightBundleBranchBlock,
  firstDegreeAvBlock,
  mobitzI,
  mobitzII,
  thirdDegreeAvBlock,
  atrialFibrillation,
  atrialFlutter,
  ventricularTachycardia,
  ventricularFlutter,
  ventricularFibrillation,
  hyperkalemia,
  hypokalemia,
  hypercalcemia,
  hypocalcemia,
}
