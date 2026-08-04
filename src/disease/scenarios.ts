/**
 * Teaching scenarios highlighted in the pathology UI.
 * Each scenario resolves to one (or a remapped) DiseaseDefinition id.
 */

import type { LocalizedString } from './types'

export interface PathologyScenario {
  id: string
  /** Default disease pack id (may be remapped by params). */
  diseaseId: string
  name: LocalizedString
  short: LocalizedString
  /** Optional param remapping before resolveDiseaseSimulation. */
  remapDiseaseId?: (params: Record<string, number | string | boolean>) => string
}

/**
 * The six pathology families requested for ECG + heart-model teaching,
 * plus normal sinus as the reference baseline.
 */
export const PATHOLOGY_SCENARIOS: readonly PathologyScenario[] = [
  {
    id: 'nsr',
    diseaseId: 'normal_sinus_rhythm',
    name: { en: 'Normal Sinus Rhythm', zh: '窦性心律' },
    short: {
      en: 'Healthy baseline conduction and 12-lead morphology.',
      zh: '健康基线传导与十二导联形态。',
    },
  },
  {
    id: 'av_block',
    diseaseId: 'third_degree_av_block',
    name: { en: 'Conduction Block (AV)', zh: '传导阻滞' },
    short: {
      en: 'Delayed or failed AV conduction — prolonged PR or complete dissociation.',
      zh: '房室传导延迟或中断——PR延长或完全分离。',
    },
    remapDiseaseId: (params) => {
      const degree = typeof params.degree === 'string' ? params.degree : 'third'
      if (degree === 'first') return 'first_degree_av_block'
      if (degree === 'mobitz_i') return 'mobitz_i'
      if (degree === 'mobitz_ii') return 'mobitz_ii'
      return 'third_degree_av_block'
    },
  },
  {
    id: 'afib',
    diseaseId: 'atrial_fibrillation',
    name: { en: 'Atrial Fibrillation', zh: '心房颤动' },
    short: {
      en: 'Chaotic atrial wavelets; irregularly irregular ventricular response.',
      zh: '紊乱房性微波；绝对不齐的心室反应。',
    },
  },
  {
    id: 'aflutter',
    diseaseId: 'atrial_flutter',
    name: { en: 'Atrial Flutter', zh: '心房扑动' },
    short: {
      en: 'Macro-reentrant atrial circuit with sawtooth F waves.',
      zh: '房性大折返环伴锯齿状F波。',
    },
  },
  {
    id: 'vflutter',
    diseaseId: 'ventricular_flutter',
    name: { en: 'Ventricular Flutter', zh: '心室扑动' },
    short: {
      en: 'Rapid regular sine-wave ventricular reentry (~300/min).',
      zh: '极速规则正弦波心室折返（约300次/分）。',
    },
  },
  {
    id: 'vf',
    diseaseId: 'ventricular_fibrillation',
    name: { en: 'Ventricular Fibrillation', zh: '心室颤动' },
    short: {
      en: 'Chaotic ventricular wavelets — no organized QRS; arrest rhythm.',
      zh: '紊乱心室微波——无有序QRS；骤停心律。',
    },
  },
  {
    id: 'mi',
    diseaseId: 'anterior_stemi',
    name: { en: 'Myocardial Infarction (STEMI)', zh: '心肌梗死' },
    short: {
      en: 'Coronary occlusion → injury current → regional ST elevation.',
      zh: '冠脉闭塞→损伤电流→区域性ST抬高。',
    },
    remapDiseaseId: (params) => {
      const territory =
        typeof params.territory === 'string' ? params.territory : 'anterior'
      if (territory === 'inferior') return 'inferior_stemi'
      if (territory === 'lateral') return 'lateral_stemi'
      if (territory === 'posterior') return 'posterior_mi'
      return 'anterior_stemi'
    },
  },
] as const

export const PATHOLOGY_SCENARIO_BY_ID: Record<string, PathologyScenario> =
  Object.fromEntries(PATHOLOGY_SCENARIOS.map((s) => [s.id, s]))

/** Extra UI params layered on top of the underlying disease pack. */
export const SCENARIO_EXTRA_PARAMS: Record<
  string,
  readonly {
    key: string
    kind: 'slider' | 'select'
    label: LocalizedString
    min?: number
    max?: number
    step?: number
    unit?: string
    options?: readonly { value: string; label: LocalizedString }[]
    default: number | string
  }[]
> = {
  av_block: [
    {
      key: 'degree',
      kind: 'select',
      label: { en: 'Block degree', zh: '阻滞程度' },
      default: 'third',
      options: [
        { value: 'first', label: { en: 'First-degree', zh: '一度' } },
        { value: 'mobitz_i', label: { en: 'Mobitz I (Wenckebach)', zh: '莫氏I型' } },
        { value: 'mobitz_ii', label: { en: 'Mobitz II', zh: '莫氏II型' } },
        { value: 'third', label: { en: 'Third-degree (complete)', zh: '三度（完全）' } },
      ],
    },
  ],
  mi: [
    {
      key: 'territory',
      kind: 'select',
      label: { en: 'Infarct territory', zh: '梗死部位' },
      default: 'anterior',
      options: [
        { value: 'anterior', label: { en: 'Anterior (LAD)', zh: '前壁（LAD）' } },
        { value: 'inferior', label: { en: 'Inferior (RCA)', zh: '下壁（RCA）' } },
        { value: 'lateral', label: { en: 'Lateral (LCx)', zh: '侧壁（LCx）' } },
        { value: 'posterior', label: { en: 'Posterior', zh: '后壁' } },
      ],
    },
  ],
}
