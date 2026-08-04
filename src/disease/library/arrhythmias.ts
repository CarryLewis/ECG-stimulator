import type { DiseaseDefinition } from '../types'
import { clamp, HR_PARAM, L, num } from './helpers'

export const atrialFibrillation: DiseaseDefinition = {
  id: 'atrial_fibrillation',
  version: '1.0.0',
  category: 'Arrhythmia',
  name: L('Atrial Fibrillation', '心房颤动'),
  short: L(
    'Disorganized atrial wavelets; irregular AV bombardment; no P waves.',
    '紊乱房性微折返；不规则房室冲击；无P波。',
  ),

  affectedAnatomy: {
    regions: ['right_atrium', 'left_atrium', 'av_node'],
    territories: [],
    chambers: ['RA', 'LA'],
    summary: L('Both atria with multiple reentrant wavelets.', '双房多发折返微波。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Loss of organized atrial activation; chaotic wavelets bombard the AV node.',
      '失去有序心房激动；紊乱微波冲击房室结。',
    ),
    cascade: [
      L('Multiple atrial wavelets', '多发房性微折返'),
      L('No effective atrial contraction', '无有效心房收缩'),
      L('Irregular AV conduction', '不规则房室传导'),
      L('Irregular ventricular response', '不规则心室反应'),
    ],
  },

  electrophysiology: {
    automaticity: L('No single SA-dominated atrial clock.', '无单一窦房主导的心房时钟。'),
    refractory: L('AV node filters irregular input → irregular RR.', '房室结过滤不规则输入→不规则RR。'),
  },

  conduction: {
    pathways: ['intra_atrial', 'av_nodal'],
    effect: L(
      'atrialMode = fibrillation; ventricularMode = irregular; pAmplitudeScale = 0.',
      'atrialMode = fibrillation；ventricularMode = irregular；pAmplitudeScale = 0。',
    ),
    expectedPropagation: L(
      'No organized SA→atrial wavefront; ventricles fire irregularly via AV filtering.',
      '无有序窦房→心房波阵；心室经房室结过滤不规则发放。',
    ),
  },

  electricalVector: {
    atrialContribution: L(
      'Low-amplitude chaotic fibrillatory vectors replace P.',
      '低幅紊乱颤动向量取代P波。',
    ),
    ventricularContribution: L('QRS usually narrow unless aberrancy.', '除非差传，QRS通常不宽。'),
  },

  ecgManifestations: {
    rhythm: L('Irregularly irregular.', '绝对不齐。'),
    intervals: L('No PR; variable RR.', '无PR；RR不等。'),
    morphology: L('Fibrillatory baseline; absent P waves.', '颤动基线；无P波。'),
    leadEmphasis: ['V1', 'II'],
    keyFindings: [
      L('Absent organized P', '无有序P波'),
      L('Irregular RR from EP schedule', 'EP调度产生不规则RR'),
    ],
  },

  clinical: {
    summary: L('Stroke risk + rate/rhythm management.', '卒中风险 + 室率/节律管理。'),
    bedside: [
      L('Palpitations, dyspnea, heart-failure exacerbation.', '心悸、气促、心衰加重。'),
      L('Anticoagulation assessment (CHA₂DS₂-VASc).', '抗凝评估（CHA₂DS₂-VASc）。'),
    ],
    urgency: 'moderate',
    teachingPoints: [
      L('Irregular RR is scheduled in EP — not drawn as random noise on the strip alone.', '不规则RR由EP调度——而非仅在描记上画随机噪声。'),
    ],
  },

  params: [
    {
      key: 'ventricularRate',
      kind: 'slider',
      label: L('Mean ventricular rate', '平均心室率'),
      min: 50,
      max: 180,
      step: 1,
      unit: 'bpm',
      default: 110,
    },
    {
      key: 'seed',
      kind: 'slider',
      label: L('Rhythm seed', '节律种子'),
      min: 1,
      max: 100,
      step: 1,
      default: 7,
    },
  ],

  apply(params) {
    const vr = num(params, 'ventricularRate', 110)
    const seed = num(params, 'seed', 7)
    return {
      atrialMode: 'fibrillation',
      atrialRate_bpm: 400,
      meanVentricularRate_bpm: vr,
      ventricularMode: 'irregular',
      pAmplitudeScale: 0,
      avBlock: 'none',
      rhythmSeed: seed,
    }
  },
}

export const atrialFlutter: DiseaseDefinition = {
  id: 'atrial_flutter',
  version: '1.0.0',
  category: 'Arrhythmia',
  name: L('Atrial Flutter', '心房扑动'),
  short: L(
    'Macro-reentrant atrial circuit (~300/min) with typically 2:1 AV conduction.',
    '房性大折返环（约300次/分），典型2:1房室传导。',
  ),

  affectedAnatomy: {
    regions: ['right_atrium', 'av_node'],
    territories: [],
    chambers: ['RA'],
    summary: L('Cavotricuspid isthmus–dependent (typical) right atrial circuit.', '典型下腔-三尖瓣峡部依赖性右房折返环。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Stable atrial macro-reentry produces flutter waves at a fixed cycle length.',
      '稳定房性大折返产生固定周长的扑动波。',
    ),
    cascade: [
      L('Macro-reentry around tricuspid annulus', '三尖瓣环大折返'),
      L('Atrial rate ≈ 300 bpm', '心房率约300次/分'),
      L('AV node conducts with integer ratio (often 2:1)', '房室结按整数比例下传（常2:1）'),
    ],
  },

  electrophysiology: {
    automaticity: L('Reentry, not enhanced SA automaticity.', '折返而非窦房自律增高。'),
  },

  conduction: {
    pathways: ['intra_atrial', 'av_nodal', 'reentry_circuit'],
    effect: L(
      'atrialMode = flutter; flutterCycle_s ≈ 0.2; AV ratio often 2:1.',
      'atrialMode = flutter；flutterCycle_s ≈ 0.2；房室比例常2:1。',
    ),
    expectedPropagation: L(
      'Continuous atrial circuit; every Nth wavefront conducts through AV.',
      '持续房性折返环；每N次波阵经AV下传一次。',
    ),
  },

  electricalVector: {
    atrialContribution: L(
      'Sawtooth flutter vector (inferior leads classic for typical flutter).',
      '锯齿状扑动向量（典型扑动在下壁导联经典）。',
    ),
  },

  ecgManifestations: {
    rhythm: L('Atrial flutter with fixed or variable AV conduction.', '房扑伴固定或可变房室传导。'),
    intervals: L('Atrial cycle ~200 ms; ventricular rate depends on ratio.', '心房周长约200 ms；心室率取决于比例。'),
    morphology: L('Continuous flutter waves; no isoelectric baseline between F waves.', '连续扑动波；F波间无等电位基线。'),
    leadEmphasis: ['II', 'III', 'aVF', 'V1'],
    keyFindings: [
      L('Flutter waves from atrial reentry', '房性折返产生扑动波'),
      L('Integer AV conduction ratio', '整数房室传导比'),
    ],
  },

  clinical: {
    summary: L('Rate control, anticoagulation, consider ablation.', '控制心室率、抗凝，考虑消融。'),
    bedside: [L('Palpitations; may present with 2:1 conduction ~150 bpm.', '心悸；可以2:1传导约150次/分就诊。')],
    urgency: 'moderate',
    teachingPoints: [
      L('Flutter cycle is an atrial EP parameter — F waves emerge from atrial vectors.', '扑动周长是心房EP参数——F波由心房向量产生。'),
    ],
  },

  params: [
    {
      key: 'atrialRate',
      kind: 'slider',
      label: L('Atrial flutter rate', '房扑心房率'),
      min: 240,
      max: 340,
      step: 5,
      unit: 'bpm',
      default: 300,
    },
    {
      key: 'ratio',
      kind: 'select',
      label: L('AV conduction ratio', '房室传导比'),
      default: '2:1',
      options: [
        { value: '2:1', label: L('2:1', '2:1') },
        { value: '4:1', label: L('4:1', '4:1') },
        { value: '3:1', label: L('3:1', '3:1') },
      ],
    },
  ],

  apply(params) {
    const atrial = num(params, 'atrialRate', 300)
    const ratio = typeof params.ratio === 'string' ? params.ratio : '2:1'
    const denom = Number(ratio.split(':')[1] ?? 2)
    const vr = Math.round(atrial / Math.max(1, denom))
    return {
      atrialMode: 'flutter',
      atrialRate_bpm: atrial,
      flutterCycle_s: 60 / atrial,
      meanVentricularRate_bpm: vr,
      ventricularMode: 'conducted',
      avConductionRatio: ratio,
      pAmplitudeScale: 0.85,
    }
  },
}

export const ventricularTachycardia: DiseaseDefinition = {
  id: 'ventricular_tachycardia',
  version: '1.0.0',
  category: 'Arrhythmia',
  name: L('Ventricular Tachycardia', '室性心动过速'),
  short: L(
    'Ventricular focus / reentry drives wide-complex tachycardia independent of atria.',
    '心室灶/折返驱动宽QRS心动过速，可与心房无关。',
  ),

  affectedAnatomy: {
    regions: ['ventricular_tachycardia_focus', 'lv_myocardium', 'rv_myocardium'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L('Ventricular myocardium / scar-related circuit.', '心室心肌/瘢痕相关折返环。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Abnormal ventricular automaticity or reentry usurps the ventricular rhythm.',
      '异常心室自律或折返夺取心室节律。',
    ),
    cascade: [
      L('Ventricular focus / circuit activates', '心室灶/折返环激动'),
      L('Wide QRS from myocardial (not His–Purkinje-first) spread', '经心肌扩布致宽QRS（非希氏–浦肯野优先）'),
      L('AV dissociation or retrograde atrial activation possible', '可有房室分离或逆传心房'),
    ],
  },

  electrophysiology: {
    automaticity: L('Ventricular focus rate typically 120–200 bpm.', '心室灶频率通常120–200次/分。'),
  },

  conduction: {
    pathways: ['myocardial_spread', 'reentry_circuit', 'escape_focus'],
    effect: L(
      'ventricularMode = tachycardia; atria may remain sinus and dissociated.',
      'ventricularMode = tachycardia；心房可仍为窦性并分离。',
    ),
    expectedPropagation: L(
      'Activation originates in ventricle and spreads myocardial → wide QRS vector.',
      '激动起源于心室并经心肌扩布→宽QRS向量。',
    ),
  },

  electricalVector: {
    ventricularContribution: L(
      'Large monomorphic ventricular vector; axis depends on exit site.',
      '大幅单形室性向量；电轴取决于出口部位。',
    ),
    atrialContribution: L('P may be dissociated or retrograde.', 'P波可分离或逆传。'),
  },

  ecgManifestations: {
    rhythm: L('Regular wide-complex tachycardia.', '规则宽QRS心动过速。'),
    intervals: L('No normal PR linkage if dissociated.', '若分离则无正常PR联系。'),
    morphology: L('Wide QRS; possible AV dissociation / fusion / capture.', '宽QRS；可有房室分离/融合/夺获。'),
    leadEmphasis: ['V1', 'II'],
    keyFindings: [
      L('Wide QRS from ventricular origin', '心室起源致宽QRS'),
      L('Rate set by ventricular focus', '频率由心室灶设定'),
    ],
  },

  clinical: {
    summary: L('Unstable VT is an emergency — treat per ACLS.', '不稳定VT为急症——按ACLS处理。'),
    bedside: [
      L('Palpitations, syncope, hemodynamic collapse.', '心悸、晕厥、血流动力学崩溃。'),
    ],
    urgency: 'critical',
    teachingPoints: [
      L('Widen QRS by changing activation origin — not by stretching a sinus template.', '通过改变激动起源增宽QRS——而非拉伸窦性模板。'),
    ],
  },

  params: [
    {
      key: 'vtRate',
      kind: 'slider',
      label: L('VT rate', '室速频率'),
      min: 120,
      max: 220,
      step: 1,
      unit: 'bpm',
      default: 170,
    },
    HR_PARAM(80, L('Underlying atrial rate', '基础心房率')),
  ],

  apply(params) {
    const vt = num(params, 'vtRate', 170)
    const atrial = num(params, 'heartRate', 80)
    return {
      saRate_bpm: atrial,
      atrialRate_bpm: atrial,
      atrialMode: 'sinus',
      ventricularMode: 'tachycardia',
      meanVentricularRate_bpm: vt,
      avBlock: 'third',
      qrsDurationScale: 1.9,
      pAmplitudeScale: 0.7,
      bundleBranches: {
        left: 'normal',
        right: 'normal',
        axisShift_deg: -60,
      },
    }
  },
}

export const ventricularFibrillation: DiseaseDefinition = {
  id: 'ventricular_fibrillation',
  version: '1.0.0',
  category: 'Arrhythmia',
  name: L('Ventricular Fibrillation', '心室颤动'),
  short: L(
    'Chaotic ventricular wavelets — no organized QRS; cardiac arrest rhythm.',
    '紊乱心室微折返——无有序QRS；心脏骤停心律。',
  ),

  affectedAnatomy: {
    regions: ['lv_myocardium', 'rv_myocardium', 'purkinje_lv', 'purkinje_rv'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L('Entire ventricular myocardium in chaotic reentry.', '整个心室心肌陷入紊乱折返。'),
  },

  pathophysiology: {
    primaryProcess: L(
      'Multiple wandering ventricular wavelets abolish coordinated contraction.',
      '多发游走心室微折返消除协调收缩。',
    ),
    cascade: [
      L('Wavebreak and reentry across ventricles', '心室内碎裂与折返'),
      L('No effective stroke volume', '无有效每搏量'),
      L('Immediate cardiac arrest', '即刻心脏骤停'),
    ],
  },

  electrophysiology: {
    automaticity: L('No organized pacemaker governs ventricles.', '无有序起搏点主导心室。'),
    refractory: L('Heterogeneous refractoriness sustains fibrillation.', '不应期不均一维持颤动。'),
  },

  conduction: {
    pathways: ['myocardial_spread', 'reentry_circuit'],
    effect: L(
      'ventricularMode = fibrillation; pAmplitudeScale = 0; extreme QRS disorganization.',
      'ventricularMode = fibrillation；pAmplitudeScale = 0；QRS极度紊乱。',
    ),
    expectedPropagation: L(
      'No coherent activation sequence — fragmented wavelets only.',
      '无连贯激动顺序——仅有碎裂微波。',
    ),
  },

  electricalVector: {
    ventricularContribution: L(
      'Rapidly changing low-to-moderate amplitude chaotic dipole.',
      '快速变化的低至中等振幅紊乱偶极子。',
    ),
  },

  ecgManifestations: {
    rhythm: L('Chaotic fibrillatory ventricular activity.', '紊乱心室颤动活动。'),
    intervals: L('No measurable PR/QRS/QT.', '无法测量PR/QRS/QT。'),
    morphology: L('Undulating irregular waves without QRS complexes.', '无QRS的不规则波动。'),
    leadEmphasis: ['II', 'V1'],
    keyFindings: [
      L('No organized QRS', '无有序QRS'),
      L('Chaotic ventricular vectors', '紊乱心室向量'),
    ],
  },

  clinical: {
    summary: L('Pulseless arrest — immediate defibrillation.', '无脉搏骤停——立即除颤。'),
    bedside: [L('Unresponsive, apneic, no pulse.', '无反应、无呼吸、无脉搏。')],
    urgency: 'critical',
    teachingPoints: [
      L('VF is a ventricularMode of the EP model — not a canned scribble overlay.', 'VF是EP模型的ventricularMode——而非预制涂鸦叠层。'),
    ],
  },

  params: [
    {
      key: 'amplitude',
      kind: 'slider',
      label: L('Fibrillation amplitude', '颤动振幅'),
      min: 20,
      max: 100,
      step: 5,
      unit: '%',
      default: 70,
    },
    {
      key: 'seed',
      kind: 'slider',
      label: L('Chaos seed', '混沌种子'),
      min: 1,
      max: 100,
      step: 1,
      default: 13,
    },
  ],

  apply(params) {
    const amp = clamp(num(params, 'amplitude', 70) / 100, 0.2, 1)
    const seed = num(params, 'seed', 13)
    return {
      atrialMode: 'standstill',
      ventricularMode: 'fibrillation',
      meanVentricularRate_bpm: 300,
      pAmplitudeScale: 0,
      qrsDurationScale: 2.5 + amp,
      rhythmSeed: seed,
      repolarization: { tAmplitudeScale: 0, stGlobal_mV: 0 },
    }
  },
}

export const ventricularFlutter: DiseaseDefinition = {
  id: 'ventricular_flutter',
  version: '1.0.0',
  category: 'Arrhythmia',
  name: L('Ventricular Flutter', '心室扑动'),
  short: L(
    'Extremely rapid regular ventricular reentry (~300/min) producing a sine-wave ECG.',
    '极速规则心室折返（约300次/分），心电图呈正弦波。',
  ),

  affectedAnatomy: {
    regions: ['lv_myocardium', 'rv_myocardium', 'purkinje_lv', 'purkinje_rv'],
    territories: [],
    chambers: ['LV', 'RV'],
    summary: L(
      'Large ventricular macro-reentrant circuit without isoelectric baseline.',
      '心室大折返环，无等电位基线。',
    ),
  },

  pathophysiology: {
    primaryProcess: L(
      'Stable ventricular macro-reentry at a fixed, very short cycle length.',
      '固定极短周长的稳定心室大折返。',
    ),
    cascade: [
      L('Macro-reentry across ventricular myocardium', '心室心肌大折返'),
      L('Rate ≈ 250–320 bpm', '频率约250–320次/分'),
      L('No effective diastole → minimal stroke volume', '无有效舒张期→每搏量极低'),
      L('Often degenerates into ventricular fibrillation', '常蜕变为心室颤动'),
    ],
  },

  electrophysiology: {
    automaticity: L('Reentry, not a discrete automatic focus.', '折返而非离散自律灶。'),
    refractory: L(
      'Nearly continuous activation leaves almost no diastolic interval.',
      '几乎连续激动，几乎无舒张间期。',
    ),
  },

  conduction: {
    pathways: ['myocardial_spread', 'reentry_circuit'],
    effect: L(
      'ventricularMode = flutter; organized QRS/T merge into a sine wave.',
      'ventricularMode = flutter；有序QRS/T融合成正弦波。',
    ),
    expectedPropagation: L(
      'Rapid regular ventricular circuit; atria usually dissociated or silent.',
      '快速规则心室折返环；心房通常分离或静止。',
    ),
  },

  electricalVector: {
    ventricularContribution: L(
      'Large oscillating dipole at flutter cycle — sine-wave morphology.',
      '扑动周长下的大幅振荡偶极子——正弦波形态。',
    ),
  },

  ecgManifestations: {
    rhythm: L('Regular sine-wave ventricular flutter.', '规则正弦波室扑。'),
    intervals: L('No measurable PR; QRS/T continuous; rate ~300/min.', '无法测PR；QRS/T连续；约300次/分。'),
    morphology: L(
      'Sinusoidal undulation without isoelectric baseline between complexes.',
      '正弦样波动，复合波间无等电位基线。',
    ),
    leadEmphasis: ['II', 'V1'],
    keyFindings: [
      L('Sine-wave ECG from ventricular flutter mode', '室扑模式产生正弦波心电图'),
      L('Unstable arrest rhythm — prepare for defibrillation', '不稳定骤停心律——准备除颤'),
    ],
  },

  clinical: {
    summary: L(
      'Pulseless or near-pulseless — treat like VF with immediate defibrillation.',
      '无脉搏或接近无脉搏——按室颤立即除颤处理。',
    ),
    bedside: [
      L('Syncope, collapse, absent or thready pulse.', '晕厥、倒地、无脉搏或细弱脉搏。'),
      L('Often a brief transitional rhythm into VF.', '常为进入室颤前的短暂过渡心律。'),
    ],
    urgency: 'critical',
    teachingPoints: [
      L(
        'Ventricular flutter is an EP ventricularMode — the sine wave emerges from a rapid regular dipole, not a canned overlay.',
        '室扑是EP的ventricularMode——正弦波由快速规则偶极子产生，而非预制叠层。',
      ),
    ],
  },

  params: [
    {
      key: 'flutterRate',
      kind: 'slider',
      label: L('Ventricular flutter rate', '室扑频率'),
      min: 240,
      max: 340,
      step: 5,
      unit: 'bpm',
      default: 300,
    },
    {
      key: 'amplitude',
      kind: 'slider',
      label: L('Wave amplitude', '波幅'),
      min: 40,
      max: 100,
      step: 5,
      unit: '%',
      default: 85,
    },
  ],

  apply(params) {
    const rate = num(params, 'flutterRate', 300)
    const amp = clamp(num(params, 'amplitude', 85) / 100, 0.4, 1)
    return {
      atrialMode: 'standstill',
      ventricularMode: 'flutter',
      meanVentricularRate_bpm: rate,
      flutterCycle_s: 60 / rate,
      pAmplitudeScale: 0,
      qrsDurationScale: 2.2,
      rhythmSeed: 17,
      repolarization: {
        tAmplitudeScale: 0,
        tWidthScale: 1,
        stGlobal_mV: 0,
      },
      // Encode amplitude via qrs scale proxy for the CyclePlan bridge.
      conductionVelocityScale: amp,
    }
  },
}
