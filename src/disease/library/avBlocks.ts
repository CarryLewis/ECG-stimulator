import type { DiseaseDefinition } from '../types'
import { HR_PARAM, L, num } from './helpers'

export const firstDegreeAvBlock: DiseaseDefinition = {
  id: 'first_degree_av_block',
  version: '1.0.0',
  category: 'Conduction',
  name: L('First-degree AV Block', '一度房室传导阻滞'),
  short: L('Prolonged AV nodal delay; every impulse still conducts.', '房室结延迟延长；每次冲动仍能下传。'),

  affectedAnatomy: {
    regions: ['av_node'],
    territories: [],
    summary: L('AV node (and sometimes His) with slowed conduction.', '房室结（有时希氏束）传导减慢。'),
  },

  pathophysiology: {
    primaryProcess: L('Increased AV nodal conduction time without failure.', '房室结传导时间延长但不发生阻滞。'),
    cascade: [
      L('SA / atrial activation normal', '窦房/心房激动正常'),
      L('AV node delays longer than normal', '房室结延迟超过正常'),
      L('Ventricles still activate 1:1', '心室仍1:1激动'),
    ],
  },

  electrophysiology: {
    automaticity: L('SA pacemaker unchanged.', '窦房结起搏不变。'),
    refractory: L('AV node recovers in time for each impulse.', '房室结能及时恢复以接受每次冲动。'),
  },

  conduction: {
    pathways: ['av_nodal'],
    effect: L('avDelay_s prolonged; avBlock = first.', 'avDelay_s延长；avBlock = first。'),
    expectedPropagation: L(
      'SA → atria → delayed AV → His–Purkinje → ventricles (1:1).',
      '窦房结→心房→延迟的房室结→希氏–浦肯野→心室（1:1）。',
    ),
  },

  electricalVector: {
    atrialContribution: L('Normal P vector.', 'P向量正常。'),
    ventricularContribution: L('Normal QRS vector if no bundle disease.', '若无束支病变则QRS向量正常。'),
  },

  ecgManifestations: {
    rhythm: L('Sinus with 1:1 AV conduction.', '窦性且房室1:1传导。'),
    intervals: L('PR > 200 ms.', 'PR > 200 ms。'),
    morphology: L('P and QRS morphology unchanged.', 'P与QRS形态不变。'),
    leadEmphasis: ['II'],
    keyFindings: [L('Prolonged PR from increased AV delay', 'PR延长来自房室延迟增加')],
  },

  clinical: {
    summary: L('Benign conduction delay if asymptomatic.', '无症状时多为良性传导延迟。'),
    bedside: [L('Often asymptomatic; review drugs (β-blockers, Ca-blockers).', '常无症状；复查药物影响。')],
    urgency: 'mild',
    teachingPoints: [
      L('Only avDelay_s changes — no dropped beats.', '仅改变avDelay_s——无漏搏。'),
    ],
  },

  params: [
    HR_PARAM(70),
    {
      key: 'prMs',
      kind: 'slider',
      label: L('PR interval', 'PR间期'),
      min: 200,
      max: 400,
      step: 10,
      unit: 'ms',
      default: 280,
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 70)
    const prMs = num(params, 'prMs', 280)
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      avDelay_s: prMs / 1000,
      avBlock: 'first',
    }
  },
}

export const mobitzI: DiseaseDefinition = {
  id: 'mobitz_i',
  version: '1.0.0',
  category: 'Conduction',
  name: L('Second-degree AV Block (Mobitz I)', '二度I型房室传导阻滞（文氏）'),
  short: L('Progressive AV delay then a dropped QRS (Wenckebach).', 'PR逐渐延长后脱落一次QRS（文氏）。'),

  affectedAnatomy: {
    regions: ['av_node'],
    territories: [],
    summary: L('AV node with decremental conduction.', '具有递减传导特性的房室结。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Decremental AV nodal conduction: each impulse prolongs PR until one fails.',
      '房室结递减传导：每次冲动使PR延长直至一次失败。',
    ),
    cascade: [
      L('PR lengthens beat-to-beat', 'PR逐搏延长'),
      L('AV node enters refractory before an atrial impulse', '某次房性冲动抵达时房室结仍不应'),
      L('One ventricular activation is skipped', '一次心室激动脱落'),
      L('Cycle resets with shorter PR', '周期重置，PR缩短'),
    ],
  },

  electrophysiology: {
    refractory: L(
      'AV nodal relative refractory period encroached progressively.',
      '房室结相对不应期被逐渐侵占。',
    ),
  },

  conduction: {
    pathways: ['av_nodal'],
    effect: L(
      'avBlock = second_type1 with Wenckebach increment; typical ratio e.g. 4:3.',
      'avBlock = second_type1，伴文氏递增；典型比例如4:3。',
    ),
    expectedPropagation: L(
      'Grouped beating: several conducted cycles with rising AV delay, then a blocked P.',
      '分组搏动：数次传导且AV延迟递增，然后一次P波阻滞。',
    ),
  },

  electricalVector: {
    atrialContribution: L('P waves continue on schedule.', 'P波按原节律继续。'),
    ventricularContribution: L('QRS drops when AV edge fails.', 'AV通路失败时QRS脱落。'),
  },

  ecgManifestations: {
    rhythm: L('Grouped beating / Wenckebach periodicity.', '分组搏动/文氏周期。'),
    intervals: L('Progressive PR prolongation then a pause.', 'PR逐渐延长后出现长间歇。'),
    morphology: L('Narrow QRS if block is nodal.', '若阻滞在结内则QRS不宽。'),
    leadEmphasis: ['II', 'V1'],
    keyFindings: [
      L('Lengthening PR', 'PR延长'),
      L('Dropped QRS after non-conducted P', '未下传P后QRS脱落'),
    ],
  },

  clinical: {
    summary: L('Usually AV-nodal; often better prognosis than Mobitz II.', '多为房室结水平；预后常好于Mobitz II。'),
    bedside: [L('May cause mild bradycardia or fatigue.', '可引起轻度心动过缓或乏力。')],
    urgency: 'moderate',
    teachingPoints: [
      L('EP engine must implement Wenckebach counter — not a static long-PR template.', 'EP引擎需实现文氏计数器——而非静态长PR模板。'),
    ],
  },

  params: [
    HR_PARAM(78),
    {
      key: 'ratio',
      kind: 'select',
      label: L('Wenckebach ratio', '文氏比例'),
      default: '4:3',
      options: [
        { value: '3:2', label: L('3:2', '3:2') },
        { value: '4:3', label: L('4:3', '4:3') },
        { value: '5:4', label: L('5:4', '5:4') },
      ],
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 78)
    const ratio = typeof params.ratio === 'string' ? params.ratio : '4:3'
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      avDelay_s: 0.18,
      avBlock: 'second_type1',
      avWenckebachIncrement_s: 0.04,
      avConductionRatio: ratio,
    }
  },
}

export const mobitzII: DiseaseDefinition = {
  id: 'mobitz_ii',
  version: '1.0.0',
  category: 'Conduction',
  name: L('Second-degree AV Block (Mobitz II)', '二度II型房室传导阻滞'),
  short: L('Sudden dropped QRS without progressive PR lengthening.', 'PR不逐渐延长而突然脱落QRS。'),

  affectedAnatomy: {
    regions: ['his_bundle', 'right_bundle', 'left_bundle'],
    territories: [],
    summary: L('Infra-Hisian conduction system (His / bundle branches).', '希氏束下传导系统（希氏束/束支）。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Intermittent failure of infra-Hisian conduction with stable PR when conducted.',
      '希氏束下间歇性传导失败；下传时PR稳定。',
    ),
    cascade: [
      L('Atrial impulse arrives with constant PR on success', '成功下传时PR恒定'),
      L('Occasional complete failure below the AV node', '偶发房室结下完全失败'),
      L('Risk of progression to complete heart block', '有进展为完全性心脏阻滞的风险'),
    ],
  },

  electrophysiology: {
    refractory: L(
      'Unstable His–Purkinje refractoriness causes abrupt block.',
      '希氏–浦肯野不应期不稳定导致突然阻滞。',
    ),
  },

  conduction: {
    pathways: ['his_bundle', 'right_bundle_branch', 'left_bundle_branch'],
    effect: L(
      'avBlock = second_type2; fixed ratio e.g. 3:2 or 2:1.',
      'avBlock = second_type2；固定比例如3:2或2:1。',
    ),
    expectedPropagation: L(
      'Most beats: SA→…→ventricle with constant AV delay; intermittent blocked P.',
      '多数搏动：窦房结→…→心室且AV延迟恒定；间歇性P波阻滞。',
    ),
  },

  electricalVector: {
    ventricularContribution: L(
      'QRS may be wide if underlying bundle disease.',
      '若存在束支病变，QRS可增宽。',
    ),
  },

  ecgManifestations: {
    rhythm: L('Intermittent non-conducted P waves.', '间歇性P波未下传。'),
    intervals: L('Constant PR on conducted beats.', '下传搏动PR恒定。'),
    morphology: L('Often wide QRS (infra-Hisian).', '常伴宽QRS（希氏束下）。'),
    leadEmphasis: ['II', 'V1'],
    keyFindings: [
      L('Sudden dropped QRS', '突然QRS脱落'),
      L('Stable PR when conducted', '下传时PR稳定'),
    ],
  },

  clinical: {
    summary: L('Higher risk — pacing often indicated.', '风险较高——常需起搏。'),
    bedside: [L('Syncope risk; evaluate for permanent pacemaker.', '有晕厥风险；评估永久起搏器。')],
    urgency: 'severe',
    teachingPoints: [
      L('Block lives in His–Purkinje graph edges, not in ST cosmetics.', '阻滞位于希氏–浦肯野图边，而非ST美容。'),
    ],
  },

  params: [
    HR_PARAM(70),
    {
      key: 'ratio',
      kind: 'select',
      label: L('Conduction ratio', '传导比例'),
      default: '3:2',
      options: [
        { value: '3:2', label: L('3:2', '3:2') },
        { value: '2:1', label: L('2:1', '2:1') },
        { value: '4:3', label: L('4:3', '4:3') },
      ],
    },
  ],

  apply(params) {
    const hr = num(params, 'heartRate', 70)
    const ratio = typeof params.ratio === 'string' ? params.ratio : '3:2'
    return {
      saRate_bpm: hr,
      atrialMode: 'sinus',
      ventricularMode: 'conducted',
      avDelay_s: 0.16,
      avBlock: 'second_type2',
      avConductionRatio: ratio,
      qrsDurationScale: 1.25,
    }
  },
}

export const thirdDegreeAvBlock: DiseaseDefinition = {
  id: 'third_degree_av_block',
  version: '1.0.0',
  category: 'Conduction',
  name: L('Third-degree AV Block', '三度房室传导阻滞'),
  short: L('Complete AV dissociation — independent atrial and ventricular clocks.', '完全房室分离——心房与心室独立时钟。'),

  affectedAnatomy: {
    regions: ['av_node', 'his_bundle', 'ventricular_escape_focus'],
    territories: [],
    summary: L('AV conduction axis interrupted; ventricular escape focus drives QRS.', '房室传导轴中断；心室逸搏灶驱动QRS。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'No atrial impulse reaches the ventricles; escape pacemaker assumes control.',
      '无心房冲动抵达心室；逸搏起搏点接管。',
    ),
    cascade: [
      L('Atria continue under SA (or other atrial) rate', '心房继续按窦房（或其他房性）节律'),
      L('AV edge permanently disabled', '房室传导边永久关闭'),
      L('Junctional or ventricular escape focus fires', '交界区或心室逸搏灶发放'),
      L('P and QRS dissociate', 'P与QRS分离'),
    ],
  },

  electrophysiology: {
    automaticity: L(
      'Escape focus automaticity (typically 30–50 bpm ventricular).',
      '逸搏灶自律性（心室常30–50次/分）。',
    ),
  },

  conduction: {
    pathways: ['av_nodal', 'his_bundle', 'escape_focus'],
    effect: L('avBlock = third; ventricularMode = escape.', 'avBlock = third；ventricularMode = escape。'),
    expectedPropagation: L(
      'Atrial wavefront stops at AV; independent ventricular activation from escape focus.',
      '心房波阵在AV处终止；心室由逸搏灶独立激动。',
    ),
  },

  electricalVector: {
    atrialContribution: L('Regular P vectors unrelated to QRS.', '规则P向量与QRS无关。'),
    ventricularContribution: L(
      'Escape origin may widen QRS and shift axis.',
      '逸搏起源可使QRS增宽并改变电轴。',
    ),
  },

  ecgManifestations: {
    rhythm: L('AV dissociation; slow regular ventricular escape.', '房室分离；缓慢规则心室逸搏。'),
    intervals: L('No consistent PR relationship.', '无固定PR关系。'),
    morphology: L('P marching through; QRS may be wide.', 'P波“穿行”；QRS可宽。'),
    leadEmphasis: ['II', 'V1'],
    keyFindings: [
      L('Dissociated P and QRS', 'P与QRS分离'),
      L('Escape rhythm rate', '逸搏心律频率'),
    ],
  },

  clinical: {
    summary: L('Unstable — pacing indicated.', '不稳定——需要起搏。'),
    bedside: [
      L('Syncope, hypotension, heart-failure symptoms.', '晕厥、低血压、心衰症状。'),
      L('Prepare for temporary / permanent pacing.', '准备临时/永久起搏。'),
    ],
    urgency: 'critical',
    teachingPoints: [
      L('Two clocks in the EP engine — never fake dissociation in the ECG drawer.', 'EP引擎中的双时钟——切勿在ECG绘图中伪造分离。'),
    ],
  },

  params: [
    {
      key: 'atrialRate',
      kind: 'slider',
      label: L('Atrial rate', '心房率'),
      min: 50,
      max: 120,
      step: 1,
      unit: 'bpm',
      default: 80,
    },
    {
      key: 'escapeRate',
      kind: 'slider',
      label: L('Ventricular escape rate', '心室逸搏率'),
      min: 25,
      max: 55,
      step: 1,
      unit: 'bpm',
      default: 36,
    },
  ],

  apply(params) {
    const atrial = num(params, 'atrialRate', 80)
    const escape = num(params, 'escapeRate', 36)
    return {
      saRate_bpm: atrial,
      atrialRate_bpm: atrial,
      atrialMode: 'sinus',
      ventricularMode: 'escape',
      avBlock: 'third',
      ventricularEscapeRate_bpm: escape,
      meanVentricularRate_bpm: escape,
      qrsDurationScale: 1.4,
    }
  },
}
