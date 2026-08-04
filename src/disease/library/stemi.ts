import type { DiseaseDefinition, DiseaseTerritory, PhysiologicalEffects } from '../types'
import { clamp, HR_PARAM, L, num, SEVERITY_PARAM } from './helpers'

type StemiOpts = {
  id: string
  name: ReturnType<typeof L>
  short: ReturnType<typeof L>
  territory: DiseaseTerritory
  regions: DiseaseDefinition['affectedAnatomy']['regions']
  coronary: NonNullable<DiseaseDefinition['affectedAnatomy']['coronarySupply']>
  reciprocal: readonly DiseaseTerritory[]
  leads: NonNullable<DiseaseDefinition['ecgManifestations']['leadEmphasis']>
  wallLabel: ReturnType<typeof L>
}

function stemiPack(opts: StemiOpts): DiseaseDefinition {
  return {
    id: opts.id,
    version: '1.0.0',
    category: 'Cardiovascular',
    name: opts.name,
    short: opts.short,

    affectedAnatomy: {
      regions: opts.regions,
      territories: [opts.territory],
      chambers: ['LV'],
      coronarySupply: opts.coronary,
      summary: L(
        `${opts.wallLabel.en} myocardium supplied by ${opts.coronary.join('/')}.`,
        `${opts.wallLabel.zh}心肌，血供 ${opts.coronary.join('/')}。`,
      ),
    },

    pathophysiology: {
      primaryProcess: L(
        'Acute coronary occlusion → transmural ischemia → injury current.',
        '急性冠脉闭塞→透壁缺血→损伤电流。',
      ),
      cascade: [
        L('Coronary flow ceases in the territory', '该供血区血流中断'),
        L('ATP depletion impairs Na⁺/K⁺-ATPase', 'ATP耗竭损害钠钾泵'),
        L('Partial depolarization of injured myocytes', '损伤心肌部分除极'),
        L('Diastolic / systolic injury current forms', '形成舒张期/收缩期损伤电流'),
        L('ST vector points toward the ischemic wall', 'ST向量指向缺血壁'),
      ],
      severityDrivers: [
        L('Occlusion percentage scales ischemia severity.', '闭塞百分比缩放缺血严重度。'),
      ],
    },

    electrophysiology: {
      excitability: L(
        'Ischemic tissue has reduced resting potential and slowed upstroke.',
        '缺血组织静息电位降低、0期上升减慢。',
      ),
      actionPotential: L(
        'Shortened / distorted AP plateau in the ischemic zone.',
        '缺血区动作电位平台缩短或畸变。',
      ),
      refractory: L(
        'Heterogeneous refractoriness increases arrhythmia risk.',
        '不应期不均一增加心律失常风险。',
      ),
    },

    conduction: {
      pathways: ['purkinje_network', 'myocardial_spread'],
      effect: L(
        'Local conduction slowing in the ischemic territory; His–Purkinje usually intact early.',
        '缺血区局部传导减慢；早期希氏–浦肯野通常仍完整。',
      ),
      expectedPropagation: L(
        'Normal activation sequence with regional injury current during the ST window.',
        '激动顺序大致正常，ST窗口出现区域性损伤电流。',
      ),
    },

    electricalVector: {
      injuryCurrent: L(
        `Injury current directed toward the ${opts.wallLabel.en} wall; reciprocal opposite.`,
        `损伤电流指向${opts.wallLabel.zh}，对侧面呈镜像。`,
      ),
      repolarization: L(
        'Hyperacute T-wave augmentation scales with severity.',
        '超急性T波增高随严重度增加。',
      ),
    },

    ecgManifestations: {
      rhythm: L('Usually sinus (rate may rise with pain/catecholamines).', '多为窦性（疼痛/儿茶酚胺可加快）。'),
      intervals: L('QRS usually narrow unless bundle ischemia.', '除非束支受累，QRS通常不宽。'),
      morphology: L(
        `ST elevation in leads facing ${opts.wallLabel.en}; reciprocal depression opposite.`,
        `面向${opts.wallLabel.zh}的导联ST抬高；对侧镜像压低。`,
      ),
      leadEmphasis: opts.leads,
      keyFindings: [
        L('Regional ST elevation from injury current', '损伤电流导致区域性ST抬高'),
        L('Hyperacute T waves when severe', '严重时可有超急性T波'),
        L('Reciprocal ST depression', '镜像ST压低'),
      ],
    },

    clinical: {
      summary: L(
        `Acute ${opts.wallLabel.en} STEMI physiology — reperfusion is time-critical.`,
        `急性${opts.wallLabel.zh} STEMI生理——再灌注争分夺秒。`,
      ),
      bedside: [
        L('Crushing chest pain, diaphoresis, nausea.', '压榨性胸痛、出汗、恶心。'),
        L('Rising troponin; emergent reperfusion.', '肌钙蛋白升高；紧急再灌注。'),
      ],
      urgency: 'critical',
      teachingPoints: [
        L(
          'ST elevation is projected from the injury vector — the ECG generator does not add lead offsets by disease id.',
          'ST抬高由损伤向量投影产生——ECG生成器不会按疾病ID写死导联偏移。',
        ),
      ],
    },

    params: [HR_PARAM(90), SEVERITY_PARAM('occlusion', L('Coronary occlusion', '冠脉闭塞'), 80)],

    apply(params) {
      const hr = num(params, 'heartRate', 90)
      const occ = clamp(num(params, 'occlusion', 80) / 100, 0, 1)
      return {
        saRate_bpm: hr,
        atrialMode: 'sinus',
        ventricularMode: 'conducted',
        ischemia: {
          territory: opts.territory,
          severity: occ,
          reciprocal: opts.reciprocal,
        },
        conductionVelocityScale: 1 - 0.15 * occ,
        repolarization: {
          tAmplitudeScale: 1 + 0.7 * occ,
          tWidthScale: 1 - 0.15 * occ,
        },
      } satisfies PhysiologicalEffects
    },
  }
}

export const anteriorStemi = stemiPack({
  id: 'anterior_stemi',
  name: L('Anterior STEMI', '前壁 STEMI'),
  short: L('LAD occlusion → anterior wall injury current.', 'LAD闭塞→前壁损伤电流。'),
  territory: 'anterior',
  regions: ['lv_anterior', 'septum', 'apex', 'purkinje_lv'],
  coronary: ['LAD'],
  reciprocal: ['inferior'],
  leads: ['V1', 'V2', 'V3', 'V4'],
  wallLabel: L('anterior', '前壁'),
})

export const inferiorStemi = stemiPack({
  id: 'inferior_stemi',
  name: L('Inferior STEMI', '下壁 STEMI'),
  short: L('RCA (often) occlusion → inferior wall injury current.', '多为RCA闭塞→下壁损伤电流。'),
  territory: 'inferior',
  regions: ['lv_inferior', 'lv_myocardium'],
  coronary: ['RCA'],
  reciprocal: ['lateral'],
  leads: ['II', 'III', 'aVF'],
  wallLabel: L('inferior', '下壁'),
})

export const lateralStemi = stemiPack({
  id: 'lateral_stemi',
  name: L('Lateral STEMI', '侧壁 STEMI'),
  short: L('LCx occlusion → lateral wall injury current.', 'LCx闭塞→侧壁损伤电流。'),
  territory: 'lateral',
  regions: ['lv_lateral', 'lv_myocardium'],
  coronary: ['LCx'],
  reciprocal: ['inferior'],
  leads: ['I', 'aVL', 'V5', 'V6'],
  wallLabel: L('lateral', '侧壁'),
})

export const posteriorMi = stemiPack({
  id: 'posterior_mi',
  name: L('Posterior MI', '后壁心肌梗死'),
  short: L(
    'Posterior wall injury — anterior leads show reciprocal changes.',
    '后壁损伤——前壁导联呈镜像改变。',
  ),
  territory: 'posterior',
  regions: ['lv_posterior', 'lv_inferior', 'lv_lateral'],
  coronary: ['RCA', 'LCx'],
  reciprocal: ['anterior'],
  leads: ['V1', 'V2', 'V3'],
  wallLabel: L('posterior', '后壁'),
})
