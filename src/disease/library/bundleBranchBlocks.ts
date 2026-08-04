import type { DiseaseDefinition } from '../types'
import { HR_PARAM, L, num } from './helpers'

export const leftBundleBranchBlock: DiseaseDefinition = {
  id: 'lbbb',
  version: '1.0.0',
  category: 'Conduction',
  name: L('Left Bundle Branch Block', '左束支传导阻滞'),
  short: L(
    'Left bundle fails → RV-first activation and wide QRS with leftward forces.',
    '左束支阻滞→右室先激动，QRS增宽并偏左向力。',
  ),

  affectedAnatomy: {
    regions: ['left_bundle', 'purkinje_lv', 'lv_myocardium', 'septum'],
    territories: ['septal', 'lateral'],
    chambers: ['LV'],
    summary: L('Left bundle branch and LV Purkinje network.', '左束支及左室浦肯野网。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Structural or ischemic interruption of the left bundle.',
      '左束支结构性或缺血性中断。',
    ),
    cascade: [
      L('Left bundle cannot conduct', '左束支不能传导'),
      L('Activation via right bundle only', '仅经右束支下传'),
      L('Slow myocardial spread to LV', '经心肌缓慢扩布至左室'),
      L('Delayed LV vector dominates late QRS', '延迟的左室向量主导QRS终末'),
    ],
  },

  electrophysiology: {
    automaticity: L('SA node usually still drives atria.', '心房通常仍由窦房结驱动。'),
    actionPotential: L(
      'LV myocytes activate late via cell-to-cell conduction.',
      '左室心肌经细胞间传导延迟激动。',
    ),
  },

  conduction: {
    pathways: ['left_bundle_branch', 'right_bundle_branch', 'myocardial_spread'],
    effect: L('Left bundle blocked; right bundle intact.', '左束支阻滞；右束支完好。'),
    expectedPropagation: L(
      'His → right bundle → RV → septum right-to-left → LV myocardium.',
      '希氏束→右束支→右室→室间隔右向左→左室心肌。',
    ),
  },

  electricalVector: {
    meanQrsAxisHint: L('Broad leftward / posterior terminal forces.', '终末向量宽大左后。'),
    ventricularContribution: L(
      'Loss of normal left-septal early forces; wide LV-directed mid-late QRS.',
      '失去正常左间隔早期向量；中晚期宽大左室方向QRS。',
    ),
    repolarization: L('Secondary ST–T discordance opposite the wide QRS.', '继发性ST–T与宽QRS方向相反。'),
  },

  ecgManifestations: {
    rhythm: L('Sinus or whatever atrial rhythm is present.', '窦性或其他房性节律。'),
    intervals: L('QRS ≥120 ms; PR usually normal.', 'QRS≥120 ms；PR通常正常。'),
    morphology: L(
      'Broad R in I/V6, QS or rS in V1; appropriate discordance.',
      'I/V6宽R，V1呈QS或rS；继发性不一致。',
    ),
    leadEmphasis: ['I', 'V1', 'V6'],
    keyFindings: [
      L('Wide QRS from delayed LV activation', '左室延迟激动致宽QRS'),
      L('LBBB morphology pattern', 'LBBB形态'),
    ],
  },

  clinical: {
    summary: L(
      'Conduction disease of the left bundle — ECG widening emerges from activation sequence change.',
      '左束支传导病变——QRS增宽由激动顺序改变产生。',
    ),
    bedside: [
      L('May be rate-related or fixed; assess for structural heart disease.', '可为频率相关或固定；评估结构性心脏病。'),
    ],
    urgency: 'moderate',
    teachingPoints: [
      L('Do not paste an LBBB template — block the left bundle in the model.', '不要粘贴LBBB模板——应在模型中阻断左束支。'),
    ],
  },

  params: [HR_PARAM(72)],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      bundleBranches: {
        left: 'blocked',
        right: 'normal',
        qrsDurationScale: 1.7,
        axisShift_deg: -30,
      },
      conductionVelocityScale: 0.75,
      repolarization: { tAmplitudeScale: 0.85 },
    }
  },
}

export const rightBundleBranchBlock: DiseaseDefinition = {
  id: 'rbbb',
  version: '1.0.0',
  category: 'Conduction',
  name: L('Right Bundle Branch Block', '右束支传导阻滞'),
  short: L(
    'Right bundle fails → LV-first activation with late rightward forces.',
    '右束支阻滞→左室先激动，终末出现右向力。',
  ),

  affectedAnatomy: {
    regions: ['right_bundle', 'purkinje_rv', 'rv_myocardium', 'septum'],
    territories: ['septal'],
    chambers: ['RV'],
    summary: L('Right bundle branch and RV Purkinje network.', '右束支及右室浦肯野网。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Interruption of the right bundle branch.',
      '右束支中断。',
    ),
    cascade: [
      L('Right bundle cannot conduct', '右束支不能传导'),
      L('Activation via left bundle', '经左束支下传'),
      L('Late RV activation via myocardium', '右室经心肌延迟激动'),
      L('Terminal rightward / anterior vector', '终末右前向量'),
    ],
  },

  electrophysiology: {
    actionPotential: L(
      'RV free wall activates late after LV.',
      '右室游离壁在左室之后延迟激动。',
    ),
  },

  conduction: {
    pathways: ['right_bundle_branch', 'left_bundle_branch', 'myocardial_spread'],
    effect: L('Right bundle blocked; left bundle intact.', '右束支阻滞；左束支完好。'),
    expectedPropagation: L(
      'His → left bundle → LV → septum left-to-right → RV myocardium.',
      '希氏束→左束支→左室→室间隔左向右→右室心肌。',
    ),
  },

  electricalVector: {
    meanQrsAxisHint: L('Late rightward / anterior terminal vector (rsR′ in V1).', '终末右前向量（V1呈rsR′）。'),
    ventricularContribution: L(
      'Normal early LV forces, then delayed RV contribution.',
      '早期左室向量正常，随后延迟右室贡献。',
    ),
  },

  ecgManifestations: {
    rhythm: L('Usually sinus.', '多为窦性。'),
    intervals: L('QRS ≥120 ms.', 'QRS≥120 ms。'),
    morphology: L(
      'rsR′ in V1–V2; wide S in I/V6.',
      'V1–V2呈rsR′；I/V6宽S。',
    ),
    leadEmphasis: ['V1', 'V2', 'I', 'V6'],
    keyFindings: [
      L('Wide QRS from delayed RV activation', '右室延迟激动致宽QRS'),
      L('RBBB morphology pattern', 'RBBB形态'),
    ],
  },

  clinical: {
    summary: L(
      'Right bundle conduction failure changes activation order; morphology follows.',
      '右束支传导失败改变激动顺序，形态随之出现。',
    ),
    bedside: [L('Often asymptomatic; evaluate context (PE, CHD, etc.).', '常无症状；结合临床评估。')],
    urgency: 'mild',
    teachingPoints: [
      L('Terminal rightward vector emerges from late RV depolarization.', '终末右向向量来自延迟的右室除极。'),
    ],
  },

  params: [HR_PARAM(72)],

  apply(params) {
    const hr = num(params, 'heartRate', 72)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      bundleBranches: {
        left: 'normal',
        right: 'blocked',
        qrsDurationScale: 1.55,
        axisShift_deg: 20,
      },
      conductionVelocityScale: 0.8,
    }
  },
}
