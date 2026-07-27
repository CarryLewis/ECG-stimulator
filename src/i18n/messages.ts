import type { Locale } from './locale'

export type MessageKey = keyof typeof EN

const EN = {
  appTitle: 'ECG Learning Simulator',
  appSubtitle:
    '12-lead ECG locked to a 3D heart — V1 conduction, V2 lead atlas, or V3 torso electrode placement (click a lead ↔ marker).',
  langZh: '中文',
  langEn: 'EN',
  langSwitchAria: 'Interface language',

  scenario: 'Scenario',
  scenarioHint:
    'Pick a physiological state, then adjust parameters. Conduction and ECG share one clock — slowed so SA → AV → His → ventricle is easy to follow.',
  playbackPace: 'Playback pace',
  playbackHint:
    'Real cardiac timing flashes by in <1 s. Slow the shared clock so the eye can track each conduction step (ECG stays locked).',
  timeScale: 'Time scale',
  realTimePct: '% real-time',
  pacePresetsAria: 'Pace presets',
  paceSlow: 'Slow',
  paceLearn: 'Learn',
  paceClear: 'Clear',
  paceReal: 'Real',
  parameters: 'Parameters',

  bedsideMonitor: 'Bedside ECG Monitor',
  sweepPrefix: 'Sweep',
  cascadeSweep: 'CASCADE SWEEP',
  monitorMeta: '12 leads · 1 / row · pace ×{scale} · 25 mm/s sim',
  ecgRowTitle: '{lead} · {face} — click to link 3D pin',
  footer:
    'Educational simulation only — waveforms are synthesised from a cardiac dipole model and must not be used for clinical diagnosis.',

  heartTitle: '3D Cardiac Model',
  heartVersionAria: 'Heart model version',
  v1Short: 'V1 Conduction',
  v2Short: 'V2 Lead atlas',
  v3Short: 'V3 Torso leads',
  hintV1:
    'Drag to orbit · scroll to zoom · pace ×{scale} — conduction glow locked to ECG',
  hintV2:
    'Drag to orbit · click pin / ECG lead to link · pace ×{scale}',
  hintV3:
    'Drag to orbit · click electrode / lead label / ECG row · pace ×{scale}',
  atlasTitle: 'Heart — anatomical lead atlas',
  torsoTitle: 'Torso — clinical 12-lead placement',
  selectPin: 'Select a pin',
  selectElectrode: 'Select an electrode or lead',
  selectedLead: 'Selected {lead}',
  layerWalls: 'Wall territories',
  layerPins: 'Lead sense points',
  layerTorso: 'Torso shell',
  layerRibs: 'Ribcage / ICS',
  layerHeart: 'Heart',
  layerElectrodes: 'Electrodes',
  layerLeadLabels: '12-lead labels',
  pickPinHint: 'Select a lead pin to see which wall it senses',
  pickElectrodeHint:
    'Select an electrode or 12-lead label to see clinical placement',
  leadSenseLine: '{lead} · {face} — {senses}',
  electrodeSenseLine: '{lead} · electrodes {electrodes} — {note}',
  wallAnterior: 'Anterior',
  wallSeptal: 'Septal',
  wallLateral: 'Lateral',
  wallInferior: 'Inferior',
  legendLimb: 'Limb electrodes',
  legendPrecordial: 'Precordial V1–V6',
  resting: 'Resting',
  depolarising: 'Depolarising',
  dragHint: 'Free drag rotate',
  ariaV1: 'Interactive 3D cardiac conduction model',
  ariaV2: 'Interactive 3D anatomical heart with 12-lead map',
  ariaV3:
    'Interactive 3D translucent torso with heart and labelled 12-lead electrode sites',

  statusAf: 'No organised atrial activity — chaotic fibrillatory wavelets',
  statusDissoc: 'Complete block — atria and ventricles beat independently',
  statusPr: 'AV delay (PR): {ms} ms',

  explainMechanism: 'Why it changes (mechanism)',
  explainEcg: 'What you see on the ECG',
  explainClinical: 'Clinical picture',

  catBaseline: 'Baseline',
  catCardiovascular: 'Cardiovascular',
  catElectrolyte: 'Electrolyte',
  catConduction: 'Conduction',
} as const

const ZH: Record<MessageKey, string> = {
  appTitle: '心电图学习模拟器',
  appSubtitle:
    '12 导联心电图与 3D 心脏联动 — V1 传导 / V2 解剖导联图谱 / V3 躯干电极安放（点击导联 ↔ 标记）。',
  langZh: '中文',
  langEn: 'EN',
  langSwitchAria: '界面语言',

  scenario: '情景选择',
  scenarioHint:
    '选择生理或病理状态，再调节参数。传导与心电图共用同一时钟，并已放慢，便于观察窦房结 → 房室结 → 希氏束 → 心室。',
  playbackPace: '播放节奏',
  playbackHint:
    '真实心动周期不到 1 秒。放慢共用时钟，才能看清每一步传导（心电图保持同步）。',
  timeScale: '时间倍率',
  realTimePct: '% 实时',
  pacePresetsAria: '节奏预设',
  paceSlow: '慢速',
  paceLearn: '学习',
  paceClear: '清晰',
  paceReal: '实时',
  parameters: '参数',

  bedsideMonitor: '床旁心电监护',
  sweepPrefix: '扫描',
  cascadeSweep: '级联扫描',
  monitorMeta: '12 导联 · 每导一行 · 节奏 ×{scale} · 25 mm/s（模拟）',
  ecgRowTitle: '{lead} · {face} — 点击关联 3D 大头针',
  footer:
    '仅供教学模拟 — 波形由心脏偶极子模型合成，不得用于临床诊断。',

  heartTitle: '3D 心脏模型',
  heartVersionAria: '心脏模型版本',
  v1Short: 'V1 传导',
  v2Short: 'V2 解剖导联',
  v3Short: 'V3 躯干导联',
  hintV1: '拖动旋转 · 滚轮缩放 · 节奏 ×{scale} — 传导发光与心电图同步',
  hintV2: '拖动旋转 · 点击大头针 / 心电图导联互相关联 · 节奏 ×{scale}',
  hintV3: '拖动旋转 · 点击电极 / 导联标注 / 心电图行 · 节奏 ×{scale}',
  atlasTitle: '心脏 — 解剖导联图谱',
  torsoTitle: '躯干 — 临床 12 导联安放',
  selectPin: '选择一个大头针',
  selectElectrode: '选择电极或导联',
  selectedLead: '已选 {lead}',
  layerWalls: '壁面分区',
  layerPins: '导联探测点',
  layerTorso: '躯干外壳',
  layerRibs: '肋骨 / 肋间',
  layerHeart: '心脏',
  layerElectrodes: '电极',
  layerLeadLabels: '12 导联标注',
  pickPinHint: '选择一个导联大头针，查看其探测的心壁方位',
  pickElectrodeHint: '选择电极或 12 导联标注，查看临床安放位置',
  leadSenseLine: '{lead} · {face} — {senses}',
  electrodeSenseLine: '{lead} · 电极 {electrodes} — {note}',
  wallAnterior: '前壁',
  wallSeptal: '间隔',
  wallLateral: '侧壁',
  wallInferior: '下壁',
  legendLimb: '肢体电极',
  legendPrecordial: '胸导联 V1–V6',
  resting: '静息',
  depolarising: '除极中',
  dragHint: '自由拖动旋转',
  ariaV1: '可交互的 3D 心脏传导模型',
  ariaV2: '带 12 导联图谱的可交互 3D 解剖心脏',
  ariaV3: '半透明躯干内心脏与标注 12 导联电极位置的可交互 3D 示意图',

  statusAf: '无组织性心房活动 — 混乱的颤动小波',
  statusDissoc: '完全阻滞 — 心房与心室各自独立搏动',
  statusPr: '房室延迟（PR）：{ms} ms',

  explainMechanism: '为何改变（机制）',
  explainEcg: '心电图所见',
  explainClinical: '临床表现',

  catBaseline: '基线',
  catCardiovascular: '心血管',
  catElectrolyte: '电解质',
  catConduction: '传导',
}

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: EN,
  zh: ZH,
}

export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  )
}
