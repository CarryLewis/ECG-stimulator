import type { LocalizedString } from './types'

/** All chrome / panel / HUD copy — disease packs keep their own LocalizedString fields. */
export const UI = {
  appEyebrow: {
    en: 'Interactive physiology learning',
    zh: '交互式生理学习',
  },
  appTitle: {
    en: 'ECG stimulator',
    zh: '心电图模拟器',
  },
  appLede: {
    en: 'Choose a scenario and compare electrical activation in the heart with the ECG.',
    zh: '选择情景，对照观察心脏电激动与心电图的变化。',
  },

  language: { en: 'Language', zh: '语言' },
  langEn: { en: 'English', zh: 'English' },
  langZh: { en: '中文', zh: '中文' },

  pathology: { en: 'Pathology', zh: '病理情景' },
  pathologyHint: {
    en: 'Choose a scenario to reshape conduction physiology — then watch the 3D heart and 12-lead ECG update together from one shared model.',
    zh: '选择病理情景以改变传导生理，三维心脏激动与十二导联心电图由同一模型同步更新。',
  },
  pathway: { en: 'Pathway', zh: '传导路径' },
  pathologyScenarios: {
    en: 'Pathology scenarios',
    zh: '病理情景列表',
  },

  scenarioParameters: { en: 'Scenario parameters', zh: '情景参数' },
  anatomySettings: { en: 'Anatomy and display', zh: '解剖与显示' },
  pause: { en: 'Pause', zh: '暂停' },
  resume: { en: 'Resume', zh: '继续' },
  playing: { en: 'Playing', zh: '播放中' },
  paused: { en: 'Paused', zh: '已暂停' },
  observe: { en: 'Look for', zh: '观察重点' },
  focusLead: { en: 'Focus lead', zh: '观察导联' },
  rhythmStrip: { en: 'Lead II rhythm strip · up to 10 s', zh: 'II 导联节律条 · 最长 10 秒' },
  rateNotMeasurable: { en: 'Ventricular rate not measurable', zh: '室率不可测' },
  atria: { en: 'Atrial activation', zh: '心房激动' },
  ventricles: { en: 'Ventricular escape activation', zh: '心室逸搏激动' },
  simulatedActivity: { en: 'Simulated activation intensity', zh: '模拟电激动强度' },
  activationKey: { en: 'Glow indicates simulated electrical activation', zh: '发光表示模拟电激动' },
  prInterval: { en: 'Simulated PR interval', zh: '模拟 PR 间期' },
  interruptedPathway: { en: 'Intermittent AV conduction', zh: '房室传导间歇中断' },
  playback: { en: 'Playback', zh: '播放控制' },
  timeScale: { en: 'Time scale', zh: '时间倍率' },
  pacePresets: { en: 'Pace presets', zh: '播放速度预设' },
  speedSlow: { en: 'Slow', zh: '慢速' },
  speedLearn: { en: 'Learn', zh: '学习' },
  speedClear: { en: 'Clear', zh: '清晰' },
  speedReal: { en: 'Real', zh: '实时' },
  ventricularRate: { en: 'Ventricular rate', zh: '心室率' },
  rateHint: {
    en: 'Rate follows the active disease plan (edit scenario parameters).',
    zh: '频率由当前疾病方案决定（请在情景参数中调整）。',
  },

  heartVersion: { en: 'Heart version', zh: '心脏视图' },
  heartVersionGroup: { en: 'Heart model version', zh: '心脏模型版本' },
  versionAnatomyShort: { en: 'Chambers', zh: '心腔' },
  versionAnatomyTitle: { en: 'Source chambers', zh: '源心腔模型' },
  versionAnatomyHint: {
    en: 'Selectable RA/LA/RV/LV/septum/apex — biological source model',
    zh: '可选右房/左房/右室/左室/室间隔/心尖 — 生物学源模型',
  },
  versionV1Short: { en: 'Conduction', zh: '传导' },
  versionV1Title: { en: 'Conduction schematic', zh: '传导示意图' },
  versionV1Hint: {
    en: 'Chambers + SA/AV + His–Purkinje tree',
    zh: '心腔 + 窦房结/房室结 + 希氏–浦肯野系统',
  },
  versionV2Short: { en: 'Leads', zh: '导联' },
  versionV2Title: { en: 'Lead atlas', zh: '导联图谱' },
  versionV2Hint: {
    en: 'Wall territories and 12-lead pins',
    zh: '室壁分区与十二导联定位针',
  },
  versionV3Short: { en: 'Electrodes', zh: '电极' },
  versionV3Title: { en: 'Torso electrodes', zh: '躯干电极' },
  versionV3Hint: {
    en: 'Body contour and clinical electrode placement',
    zh: '体表轮廓与临床电极放置',
  },

  display: { en: 'Display', zh: '显示' },
  myocardiumOpacity: { en: 'Myocardium opacity', zh: '心肌透明度' },
  anatomicalLabels: { en: 'Anatomical labels', zh: '解剖标注' },

  structures: { en: 'Structures', zh: '解剖结构' },
  structuresList: { en: 'Heart structures', zh: '心脏结构列表' },
  selection: { en: 'Selection', zh: '当前选择' },
  selectionHint: {
    en: 'Select a pathology above, then watch conduction glow and the 12-lead ECG update from the same physiological model.',
    zh: '先在上方选择病理情景，再观察传导发光与十二导联如何随同一生理模型同步变化。',
  },

  ecgTitle: { en: '12-lead ECG', zh: '十二导联心电图' },
  ecgStage: { en: '12-lead ECG', zh: '十二导联心电图' },
  ecgLiveBadge: {
    en: 'Live dipole projection · synced to conduction clock',
    zh: '实时偶极子投影 · 与传导时钟同步',
  },
  injuryCurrent: { en: 'Injury current', zh: '损伤电流' },
  calibration: { en: '2.5 s window', zh: '2.5 秒时间窗' },

  conductionCascade: { en: 'Conduction cascade', zh: '传导级联' },
  phase: { en: 'phase', zh: '时相' },
  stepSa: { en: 'SA node', zh: '窦房结' },
  stepAtrial: { en: 'Atrial conduction', zh: '心房传导' },
  stepAv: { en: 'AV node (delay)', zh: '房室结（延迟）' },
  stepHis: { en: 'Bundle of His', zh: '希氏束' },
  stepBundle: { en: 'RBB / LBB', zh: '右/左束支' },
  stepPurkinje: { en: 'Purkinje fibers', zh: '浦肯野纤维' },
  stepRepol: { en: 'Repolarization', zh: '复极' },

  hintSource: {
    en: 'Cube = model aspect you face · top H · bottom B · left L · right R · click to snap',
    zh: '立方体=当前面对的模型方位 · 上H · 下B · 左L · 右R · 点击对齐',
  },
  hintGlow: {
    en: 'Cube = model aspect you face · top H · bottom B · left L · right R · click to snap',
    zh: '立方体=当前面对的模型方位 · 上H · 下B · 左L · 右R · 点击对齐',
  },

  orientationCube: {
    en: 'Orientation cube A/P/L/R/H/B',
    zh: '方向立方体 A/P/L/R/H/B',
  },
  orientationCubeBanner: {
    en: 'View from · H↑ B↓ L← R→',
    zh: '面对方位 · 上H 下B 左L 右R',
  },
  orientationCubeIdle: {
    en: 'Drag or click a face',
    zh: '拖动或点击面对齐',
  },
  orientationCubeHint: {
    en: 'Cube shows the model aspect you face: top→H, bottom→B, left→L, right→R, front→A, back→P. Click a face to snap.',
    zh: '立方体表示当前面对的模型方位：上视为H，下视为B，左视为L，右视为R，前视为A，后视为P。点击面对齐视角。',
  },
  snapOrientation: { en: 'Snap orientation', zh: '对齐方位' },
  faceAnterior: { en: 'Ant', zh: '前' },
  facePosterior: { en: 'Post', zh: '后' },
  faceLeft: { en: 'Left', zh: '左' },
  faceRight: { en: 'Right', zh: '右' },
  faceHead: { en: 'Head', zh: '头' },
  faceBottom: { en: 'Base', zh: '底' },

  statusVf: {
    en: 'Ventricular fibrillation — chaotic wavelets, no organized QRS',
    zh: '心室颤动 — 紊乱微波，无有序 QRS',
  },
  statusVflutter: {
    en: 'Ventricular flutter — sine-wave reentry',
    zh: '心室扑动 — 正弦波折返',
  },
  statusAf: {
    en: 'No organised atrial activity — chaotic fibrillatory wavelets',
    zh: '无有序心房活动 — 紊乱颤动微波',
  },
  statusAflutter: {
    en: 'Atrial flutter — continuous F waves',
    zh: '心房扑动 — 连续 F 波',
  },
  statusDissociated: {
    en: 'Complete block — atria and ventricles beat independently',
    zh: '完全阻滞 — 心房与心室独立搏动',
  },
  statusPr: {
    en: 'AV delay (PR)',
    zh: '房室延迟（PR）',
  },
} as const satisfies Record<string, LocalizedString>

export type UiMessageKey = keyof typeof UI
