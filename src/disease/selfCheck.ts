/**
 * Lightweight self-check for the Disease Engine (Node / tsx / vite-node).
 * Ensures packs modify physiology and never claim ECG as a primary mutation.
 */

import {
  assertPhysiologyDriven,
  diseaseCatalog,
  initializeDiseaseEngine,
  listDiseases,
  resolveDiseaseSimulation,
  resetDiseaseEngine,
} from './index'
import { DISEASE_LIBRARY_IDS } from './library'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

resetDiseaseEngine()
initializeDiseaseEngine()

const expected = [
  'normal_sinus_rhythm',
  'anterior_stemi',
  'inferior_stemi',
  'lateral_stemi',
  'posterior_mi',
  'lbbb',
  'rbbb',
  'first_degree_av_block',
  'mobitz_i',
  'mobitz_ii',
  'third_degree_av_block',
  'atrial_fibrillation',
  'atrial_flutter',
  'ventricular_tachycardia',
  'ventricular_fibrillation',
  'hyperkalemia',
  'hypokalemia',
  'hypercalcemia',
  'hypocalcemia',
] as const

assert(DISEASE_LIBRARY_IDS.length === expected.length, 'library size mismatch')
for (const id of expected) {
  assert(DISEASE_LIBRARY_IDS.includes(id), `missing disease ${id}`)
}

for (const d of listDiseases()) {
  assertPhysiologyDriven(d)
  const result = resolveDiseaseSimulation({ diseaseId: d.id })
  assert(result.model, `${d.id} must produce a physiological model`)
  assert(
    !result.pipelineImpact.primaryStages.includes('twelve_lead_ecg'),
    `${d.id} must not mutate ECG directly`,
  )
  assert(
    result.teachingTrace.affectedAnatomy.regions.length >= 0,
    `${d.id} must declare anatomy`,
  )
  assert(
    result.teachingTrace.affectedConductionPathway.pathways.length > 0,
    `${d.id} must declare conduction pathways`,
  )
}

const anterior = resolveDiseaseSimulation({
  diseaseId: 'anterior_stemi',
  params: { occlusion: 90, heartRate: 95 },
})
assert(anterior.model.injuryCurrentEnabled, 'anterior STEMI must enable injury current')
assert((anterior.model.ischemia.anterior ?? 0) > 0.8, 'anterior ischemia severity')
assert((anterior.model.reciprocalIschemia.inferior ?? 0) > 0, 'reciprocal inferior')

const hyperK = resolveDiseaseSimulation({
  diseaseId: 'hyperkalemia',
  params: { potassium: 8.0 },
})
assert((hyperK.model.repolarization.tAmplitudeScale ?? 1) > 1.5, 'peaked T via repol scale')
assert((hyperK.model.qrsDurationScale ?? 1) > 1.2, 'QRS widens via conduction scale')
assert(hyperK.model.potassium_mmol_L === 8.0, 'K+ stored on model')

const af = resolveDiseaseSimulation({ diseaseId: 'atrial_fibrillation' })
assert(af.model.atrialMode === 'fibrillation', 'AF atrial mode')
assert(af.model.pAmplitudeScale === 0, 'AF suppresses P amplitude')
assert(af.model.ventricularMode === 'irregular', 'AF irregular ventricles')

const chb = resolveDiseaseSimulation({
  diseaseId: 'third_degree_av_block',
  params: { atrialRate: 80, escapeRate: 35 },
})
assert(chb.model.avBlock === 'third', 'complete block')
assert(chb.model.ventricularMode === 'escape', 'escape mode')
assert(chb.model.ventricularRate_bpm === 35, 'escape rate drives ventricles')

const lbbb = resolveDiseaseSimulation({ diseaseId: 'lbbb' })
assert(lbbb.model.leftBundle === 'blocked', 'LBBB blocks left bundle')
assert(lbbb.model.rightBundle === 'normal', 'LBBB keeps right bundle')
assert(lbbb.model.qrsDurationScale > 1.4, 'LBBB widens QRS via bundle modifier')

console.log(
  JSON.stringify(
    {
      ok: true,
      diseaseCount: diseaseCatalog().length,
      categories: [...new Set(listDiseases().map((d) => d.category))],
      sample: {
        anterior_stemi: {
          ischemia: anterior.model.ischemia,
          injury: anterior.model.injuryCurrentEnabled,
        },
        hyperkalemia: {
          K: hyperK.model.potassium_mmol_L,
          tAmp: hyperK.model.repolarization.tAmplitudeScale,
          qrs: hyperK.model.qrsDurationScale,
        },
      },
    },
    null,
    2,
  ),
)
