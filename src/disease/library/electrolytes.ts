import type { DiseaseDefinition } from '../types'
import { clamp, HR_PARAM, L, num } from './helpers'

export const hyperkalemia: DiseaseDefinition = {
  id: 'hyperkalemia',
  version: '1.0.0',
  category: 'Electrolyte',
  name: L('Hyperkalemia', '高钾血症'),
  short: L(
    'Raised extracellular K⁺ reduces excitability and peaks T waves.',
    '细胞外钾升高降低兴奋性并使T波高尖。',
  ),

  affectedAnatomy: {
    regions: [
      'sa_node',
      'right_atrium',
      'left_atrium',
      'av_node',
      'his_bundle',
      'lv_myocardium',
      'rv_myocardium',
    ],
    territories: [],
    chambers: ['RA', 'LA', 'RV', 'LV'],
    summary: L('Global membrane effect — not a regional coronary lesion.', '全局膜效应——非区域性冠脉病变。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Elevated extracellular K⁺ reduces K⁺ gradient → partial depolarization.',
      '细胞外钾升高降低钾梯度→部分除极。',
    ),
    cascade: [
      L('Resting potential less negative', '静息电位负值减小'),
      L('Na⁺ channels inactivate → slower upstroke', '钠通道失活→0期上升减慢'),
      L('Accelerated phase-3 → peaked T', '3期加速→T波高尖'),
      L('Conduction slowing → PR↑, QRS↑; P flattens', '传导减慢→PR↑、QRS↑；P波变平'),
    ],
    severityDrivers: [L('Serum [K⁺] mmol/L', '血清钾 mmol/L')],
  },

  electrophysiology: {
    excitability: L('Reduced excitability; eventual inexcitability if severe.', '兴奋性降低；严重时可不可兴奋。'),
    actionPotential: L('Shorter phase-3; peaked repolarization vector.', '3期缩短；复极向量高尖。'),
    ionChannels: [
      L('Ik conductance ↑ relative effect on phase 3', 'Ik相对影响增强于3期'),
      L('INa availability ↓', 'INa可用性下降'),
    ],
  },

  conduction: {
    pathways: ['intra_atrial', 'av_nodal', 'his_bundle', 'purkinje_network'],
    effect: L(
      'Global conductionVelocityScale ↓; qrsDurationScale ↑; pAmplitudeScale ↓.',
      '全局conductionVelocityScale↓；qrsDurationScale↑；pAmplitudeScale↓。',
    ),
    expectedPropagation: L(
      'Same anatomic sequence but progressively slower; sinus may fail at extremes.',
      '解剖顺序相同但逐渐变慢；极端时窦房结可失败。',
    ),
  },

  electricalVector: {
    repolarization: L('Tall, narrow T vector.', '高尖窄T向量。'),
    atrialContribution: L('P vector amplitude falls as atria become inexcitable.', '心房逐渐不可兴奋时P向量振幅下降。'),
  },

  ecgManifestations: {
    rhythm: L('Sinus → sinoventricular / sine-wave risk when severe.', '窦性→严重时可呈窦室/正弦波风险。'),
    intervals: L('PR prolongs; QRS widens with rising K⁺.', '随K⁺升高PR延长、QRS增宽。'),
    morphology: L('Peaked T waves; flattened P; possible sine-wave QRS-T.', 'T波高尖；P波低平；可呈正弦波QRS-T。'),
    leadEmphasis: ['V2', 'V3', 'II'],
    keyFindings: [
      L('Peaked T from accelerated phase-3', '3期加速致T波高尖'),
      L('Conduction slowing widens QRS', '传导减慢使QRS增宽'),
    ],
  },

  clinical: {
    summary: L('Medical emergency when severe — stabilize membrane, shift, remove K⁺.', '严重时为急症——稳膜、转移、排钾。'),
    bedside: [
      L('Weakness, ascending paralysis; risk of arrest.', '无力、上行性麻痹；有骤停风险。'),
    ],
    urgency: 'critical',
    teachingPoints: [
      L('Map [K⁺] → TissueState / EpModifiers; never hardcode peaked-T lead offsets.', '将[K⁺]映射到TissueState/EpModifiers；勿硬编码高尖T导联偏移。'),
    ],
  },

  params: [
    HR_PARAM(75),
    {
      key: 'potassium',
      kind: 'slider',
      label: L('Serum potassium', '血清钾'),
      min: 4.0,
      max: 9.5,
      step: 0.1,
      unit: 'mmol/L',
      default: 6.5,
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 75)
    const k = num(params, 'potassium', 6.5)
    const tSev = clamp((k - 5.0) / 3.5, 0, 1)
    const wideSev = clamp((k - 6.5) / 2.5, 0, 1)
    const pSev = clamp((k - 6.5) / 1.5, 0, 1)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      potassium_mmol_L: k,
      avDelay_s: 0.16 + 0.08 * wideSev,
      avBlock: wideSev > 0.7 ? 'first' : 'none',
      qrsDurationScale: 1 + 1.5 * wideSev,
      pAmplitudeScale: 1 - pSev,
      conductionVelocityScale: 1 - 0.45 * wideSev,
      actionPotentialDurationScale: 1 - 0.35 * tSev,
      repolarization: {
        tAmplitudeScale: 1 + 2.0 * tSev,
        tWidthScale: 1 - 0.55 * tSev,
        qtScale: 1 - 0.2 * tSev,
      },
    }
  },
}

export const hypokalemia: DiseaseDefinition = {
  id: 'hypokalemia',
  version: '1.0.0',
  category: 'Electrolyte',
  name: L('Hypokalemia', '低钾血症'),
  short: L(
    'Low extracellular K⁺ flattens T waves and promotes U waves / ectopy.',
    '细胞外钾降低使T波低平并促进U波/异位。',
  ),

  affectedAnatomy: {
    regions: ['lv_myocardium', 'rv_myocardium', 'purkinje_lv', 'purkinje_rv'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L('Global membrane / Purkinje effect.', '全局膜/浦肯野效应。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Increased K⁺ gradient hyperpolarizes and prolongs phase-3; U waves appear.',
      '钾梯度增大使超极化并延长3期；出现U波。',
    ),
    cascade: [
      L('Flattened T wave', 'T波低平'),
      L('ST depression tendency', '倾向ST压低'),
      L('Prominent U wave', '明显U波'),
      L('Increased automaticity / ectopy risk', '自律性增高/异位风险'),
    ],
  },

  electrophysiology: {
    actionPotential: L('Prolonged repolarization; U-wave related afterpotentials.', '复极延长；与U波相关的后电位。'),
    automaticity: L('Purkinje automaticity may rise.', '浦肯野自律性可增高。'),
    ionChannels: [L('Increased IK gradient effects; delayed rectifier changes', 'IK梯度效应增强；延迟整流改变')],
  },

  conduction: {
    pathways: ['purkinje_network', 'myocardial_spread'],
    effect: L(
      'actionPotentialDurationScale ↑; U wave amplitude ↑; mild ST depression.',
      'actionPotentialDurationScale↑；U波振幅↑；轻度ST压低。',
    ),
    expectedPropagation: L(
      'Activation sequence intact; recovery phase prolonged and heterogeneous.',
      '激动顺序完整；恢复期延长且不均一。',
    ),
  },

  electricalVector: {
    repolarization: L('Low T vector; U-wave vector after T.', 'T向量低；T后出现U波向量。'),
  },

  ecgManifestations: {
    rhythm: L('Sinus; risk of ventricular ectopy.', '窦性；有室性异位风险。'),
    intervals: L('Apparent QT-U prolongation.', '表观QT-U延长。'),
    morphology: L('Flat T, U waves, possible ST depression.', 'T低平、U波、可有ST压低。'),
    leadEmphasis: ['V2', 'V3', 'II'],
    keyFindings: [
      L('U wave from delayed recovery', '延迟复极产生U波'),
      L('Flat T from reduced phase-3 current contrast', '3期电流对比减弱致T低平'),
    ],
  },

  clinical: {
    summary: L('Replace K⁺; watch for arrhythmia.', '补钾；警惕心律失常。'),
    bedside: [L('Weakness, cramps; digoxin toxicity synergy.', '无力、痉挛；与地高辛毒性协同。')],
    urgency: 'moderate',
    teachingPoints: [
      L('U-wave is a vector contribution driven by TissueState, not a painted bump.', 'U波是TissueState驱动的向量贡献，而非绘制的鼓包。'),
    ],
  },

  params: [
    HR_PARAM(72),
    {
      key: 'potassium',
      kind: 'slider',
      label: L('Serum potassium', '血清钾'),
      min: 1.5,
      max: 4.0,
      step: 0.1,
      unit: 'mmol/L',
      default: 2.6,
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    const k = num(params, 'potassium', 2.6)
    const sev = clamp((4.0 - k) / 2.5, 0, 1)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      potassium_mmol_L: k,
      actionPotentialDurationScale: 1 + 0.45 * sev,
      repolarization: {
        tAmplitudeScale: 1 - 0.7 * sev,
        tWidthScale: 1 + 0.3 * sev,
        uAmplitude_mV: 0.15 * sev,
        stGlobal_mV: -0.05 * sev,
        qtScale: 1 + 0.25 * sev,
      },
    }
  },
}

export const hypercalcemia: DiseaseDefinition = {
  id: 'hypercalcemia',
  version: '1.0.0',
  category: 'Electrolyte',
  name: L('Hypercalcemia', '高钙血症'),
  short: L(
    'High Ca²⁺ shortens the plateau → short QT.',
    '高钙缩短平台期→短QT。',
  ),

  affectedAnatomy: {
    regions: ['lv_myocardium', 'rv_myocardium'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L('Global myocardial membrane calcium effect.', '全局心肌膜钙效应。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Elevated extracellular Ca²⁺ abbreviates phase-2 plateau.',
      '细胞外钙升高缩短2期平台。',
    ),
    cascade: [
      L('Shorter action potential duration', '动作电位时程缩短'),
      L('Shortened QT / ST segment', 'QT/ST段缩短'),
    ],
  },

  electrophysiology: {
    actionPotential: L('Abbreviated plateau (phase 2).', '平台期（2期）缩短。'),
    ionChannels: [L('Ca²⁺-dependent inactivation / plateau currents', '钙依赖性失活/平台电流')],
  },

  conduction: {
    pathways: ['myocardial_spread'],
    effect: L('actionPotentialDurationScale ↓; qtScale ↓.', 'actionPotentialDurationScale↓；qtScale↓。'),
    expectedPropagation: L(
      'Depolarization sequence unchanged; recovery occurs earlier.',
      '除极顺序不变；复极更早发生。',
    ),
  },

  electricalVector: {
    repolarization: L('Early T onset; short ST segment.', 'T波提前；ST段短。'),
  },

  ecgManifestations: {
    rhythm: L('Usually sinus.', '多为窦性。'),
    intervals: L('Shortened QTc.', 'QTc缩短。'),
    morphology: L('Short ST; relatively abrupt T.', '短ST；T波相对陡峭。'),
    leadEmphasis: ['II', 'V5'],
    keyFindings: [L('Short QT from abbreviated plateau', '平台缩短致短QT')],
  },

  clinical: {
    summary: L('Treat underlying cause; watch for polyuria / stones / groans.', '治疗原发病；注意多尿/结石/腹痛等。'),
    bedside: [L('Confusion, constipation, dehydration.', '意识改变、便秘、脱水。')],
    urgency: 'moderate',
    teachingPoints: [
      L('Calcium maps to APD / QT scaling in TissueState.', '钙映射到TissueState中的APD/QT缩放。'),
    ],
  },

  params: [
    HR_PARAM(72),
    {
      key: 'calcium',
      kind: 'slider',
      label: L('Serum calcium', '血清钙'),
      min: 2.5,
      max: 4.5,
      step: 0.1,
      unit: 'mmol/L',
      default: 3.2,
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    const ca = num(params, 'calcium', 3.2)
    const sev = clamp((ca - 2.6) / 1.6, 0, 1)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      calcium_mmol_L: ca,
      actionPotentialDurationScale: 1 - 0.35 * sev,
      repolarization: {
        qtScale: 1 - 0.35 * sev,
        tWidthScale: 1 - 0.15 * sev,
      },
    }
  },
}

export const hypocalcemia: DiseaseDefinition = {
  id: 'hypocalcemia',
  version: '1.0.0',
  category: 'Electrolyte',
  name: L('Hypocalcemia', '低钙血症'),
  short: L(
    'Low Ca²⁺ prolongs the plateau → long QT (ST segment).',
    '低钙延长平台期→长QT（ST段）。',
  ),

  affectedAnatomy: {
    regions: ['lv_myocardium', 'rv_myocardium'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L('Global myocardial membrane calcium effect.', '全局心肌膜钙效应。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Low extracellular Ca²⁺ prolongs phase-2 plateau.',
      '细胞外钙降低延长2期平台。',
    ),
    cascade: [
      L('Longer action potential duration', '动作电位时程延长'),
      L('Prolonged ST segment → long QTc', 'ST段延长→长QTc'),
    ],
  },

  electrophysiology: {
    actionPotential: L('Prolonged plateau (phase 2).', '平台期（2期）延长。'),
    ionChannels: [L('Reduced driving force / plateau current balance', '驱动力/平台电流平衡改变')],
  },

  conduction: {
    pathways: ['myocardial_spread'],
    effect: L('actionPotentialDurationScale ↑; qtScale ↑.', 'actionPotentialDurationScale↑；qtScale↑。'),
    expectedPropagation: L(
      'Depolarization sequence unchanged; recovery delayed.',
      '除极顺序不变；复极延迟。',
    ),
  },

  electricalVector: {
    repolarization: L('Delayed T onset with long ST.', '长ST使T波延迟出现。'),
  },

  ecgManifestations: {
    rhythm: L('Usually sinus.', '多为窦性。'),
    intervals: L('Prolonged QTc (mostly ST).', 'QTc延长（主要为ST）。'),
    morphology: L('Long ST segment; T wave may be delayed but not necessarily broad.', '长ST段；T波可延迟但不一定增宽。'),
    leadEmphasis: ['II', 'V5'],
    keyFindings: [L('Long QT from prolonged plateau', '平台延长致长QT')],
  },

  clinical: {
    summary: L('Replace calcium; watch tetany and seizures.', '补钙；警惕手足搐搦与抽搐。'),
    bedside: [L('Chvostek / Trousseau signs; perioral paresthesias.', 'Chvostek/Trousseau征；口周感觉异常。')],
    urgency: 'moderate',
    teachingPoints: [
      L('Long QT here is APD prolongation — not a painted stretched T template.', '此处长QT是APD延长——而非拉伸的T波模板。'),
    ],
  },

  params: [
    HR_PARAM(72),
    {
      key: 'calcium',
      kind: 'slider',
      label: L('Serum calcium', '血清钙'),
      min: 1.0,
      max: 2.2,
      step: 0.1,
      unit: 'mmol/L',
      default: 1.6,
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    const ca = num(params, 'calcium', 1.6)
    const sev = clamp((2.2 - ca) / 1.2, 0, 1)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      calcium_mmol_L: ca,
      actionPotentialDurationScale: 1 + 0.5 * sev,
      repolarization: {
        qtScale: 1 + 0.45 * sev,
        tWidthScale: 1 + 0.1 * sev,
      },
    }
  },
}
