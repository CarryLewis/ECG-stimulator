import type { DiseaseDefinition } from '../types'
import { HR_PARAM, L, num } from './helpers'

export const normalSinusRhythm: DiseaseDefinition = {
  id: 'normal_sinus_rhythm',
  version: '1.0.0',
  category: 'Baseline',
  name: L('Normal Sinus Rhythm', '窦性心律'),
  short: L(
    'Healthy SA-driven conduction and emergent normal 12-lead morphology.',
    '窦房结驱动的正常传导，自然产生正常十二导联形态。',
  ),

  affectedAnatomy: {
    regions: [
      'sa_node',
      'right_atrium',
      'left_atrium',
      'av_node',
      'his_bundle',
      'right_bundle',
      'left_bundle',
      'purkinje_rv',
      'purkinje_lv',
      'lv_myocardium',
      'rv_myocardium',
    ],
    territories: [],
    chambers: ['RA', 'LA', 'RV', 'LV'],
    summary: L(
      'Entire conduction system operating without lesion.',
      '整个传导系统无病变。',
    ),
  },

  pathophysiology: {
    primaryProcess: L(
      'Spontaneous Phase-4 depolarization in the SA node sets rate.',
      '窦房结4期自动除极设定心率。',
    ),
    cascade: [
      L('SA node fires', '窦房结发放'),
      L('Atrial depolarization', '心房除极'),
      L('AV nodal delay', '房室结延迟'),
      L('His–Purkinje ventricular activation', '希氏–浦肯野心室激动'),
      L('Ventricular recovery', '心室复极'),
    ],
  },

  electrophysiology: {
    automaticity: L('SA node is the dominant pacemaker.', '窦房结为主导起搏点。'),
    excitability: L('Normal resting potentials and thresholds.', '静息电位与阈值正常。'),
    actionPotential: L('Normal atrial and ventricular AP morphology.', '心房与心室动作电位形态正常。'),
    refractory: L('Physiologic refractory periods prevent reentry.', '生理性不应期防止折返。'),
  },

  conduction: {
    pathways: [
      'sa_to_atria',
      'intra_atrial',
      'av_nodal',
      'his_bundle',
      'right_bundle_branch',
      'left_bundle_branch',
      'purkinje_network',
    ],
    effect: L('All pathways enabled at nominal delay.', '各通路按正常延迟传导。'),
    expectedPropagation: L(
      'SA → atria → AV → His → both bundles → Purkinje → myocardium.',
      '窦房结→心房→房室结→希氏束→左右束支→浦肯野→心肌。',
    ),
  },

  electricalVector: {
    meanQrsAxisHint: L('Mean QRS axis ≈ +60° (toward Lead II).', 'QRS电轴约+60°（朝向II导联）。'),
    atrialContribution: L('Left-inferior atrial P vector.', '左下方向心房P向量。'),
    ventricularContribution: L(
      'Septal right-anterior then LV free-wall left-inferior.',
      '室间隔右前，随后左室游离壁左下。',
    ),
    repolarization: L('T vector concordant with QRS.', 'T向量与QRS同向。'),
  },

  ecgManifestations: {
    rhythm: L('Regular sinus rhythm.', '规则窦性心律。'),
    intervals: L('PR 120–200 ms, QRS <120 ms.', 'PR 120–200 ms，QRS <120 ms。'),
    morphology: L(
      'Upright P in II, negative in aVR; normal R-wave progression.',
      'II导联P直立、aVR倒置；R波递增正常。',
    ),
    leadEmphasis: ['II', 'V1', 'V6'],
    keyFindings: [
      L('P before every QRS', '每个QRS前均有P波'),
      L('Narrow QRS', 'QRS狭窄'),
      L('Isoelectric ST', 'ST段等电位'),
    ],
  },

  clinical: {
    summary: L(
      'Reference physiological state for comparison against pathology.',
      '用于对照病理状态的参考生理基线。',
    ),
    bedside: [L('Asymptomatic reference rhythm.', '无症状的参考心律。')],
    urgency: 'normal',
    teachingPoints: [
      L('ECG findings emerge from intact anatomy and EP — not from a template.', 'ECG表现由完整解剖与电生理自然产生，而非模板。'),
    ],
  },

  params: [HR_PARAM(72)],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    return {
      saRate_bpm: hr,
      atrialRate_bpm: hr,
      meanVentricularRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      avDelay_s: 0.16,
      avBlock: 'none',
      qrsDurationScale: 1,
      pAmplitudeScale: 1,
      conductionVelocityScale: 1,
      bundleBranches: { left: 'normal', right: 'normal' },
    }
  },
}
