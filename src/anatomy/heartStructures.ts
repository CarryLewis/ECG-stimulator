import type { HeartStructureDef, HeartStructureId } from './types'

/**
 * Procedural macroscopic heart layout.
 *
 * Proportions follow adult teaching anatomy (not a CT segmentation):
 * - LV is the dominant chamber (thicker / larger cavity cue)
 * - RV is more anterior
 * - Atria sit superior; LA slightly more posterior
 * - Interventricular septum between RV and LV
 * - Apex formed mainly by LV, directed inferior-left-anterior
 *
 * Body axes: +x patient left, +y superior, +z anterior.
 */
export const HEART_STRUCTURES: readonly HeartStructureDef[] = [
  {
    id: 'right_atrium',
    kind: 'chamber',
    abbr: 'RA',
    label: { en: 'Right atrium', zh: '右心房' },
    description: {
      en: 'Receives systemic venous return via the venae cavae. Contains the sinoatrial node near the SVC–RA junction — the usual pacemaker for sinus rhythm.',
      zh: '接纳体循环静脉回流。窦房结位于上腔静脉与右心房交界附近，是窦性心律的起搏点。',
    },
    color: '#c45c68',
    emissive: '#ff6b7a',
    position: [-0.52, 0.58, 0.18],
    scale: [1, 0.92, 0.95],
    rotation: [0.05, 0.15, 0],
    radius: 0.42,
    labelOffset: [-0.55, 0.35, 0.25],
    renderOrder: 2,
  },
  {
    id: 'left_atrium',
    kind: 'chamber',
    abbr: 'LA',
    label: { en: 'Left atrium', zh: '左心房' },
    description: {
      en: 'Receives oxygenated blood from the pulmonary veins. Lies more posterior than the right atrium; the mitral valve opens into the left ventricle.',
      zh: '接纳肺静脉回流的氧合血，位置较右心房偏后；经二尖瓣进入左心室。',
    },
    color: '#d46874',
    emissive: '#ff7a88',
    position: [0.48, 0.62, -0.08],
    scale: [0.95, 0.88, 0.9],
    rotation: [-0.05, -0.1, 0],
    radius: 0.4,
    labelOffset: [0.55, 0.38, 0.15],
    renderOrder: 2,
  },
  {
    id: 'right_ventricle',
    kind: 'chamber',
    abbr: 'RV',
    label: { en: 'Right ventricle', zh: '右心室' },
    description: {
      en: 'Anterior crescentic chamber that ejects into the pulmonary trunk. Thinner wall than the LV; wraps partially around the left ventricle.',
      zh: '偏前的新月形心腔，射血入肺动脉干。室壁较左心室薄，部分环绕左心室。',
    },
    color: '#b8505c',
    emissive: '#ff5c6c',
    position: [-0.28, -0.12, 0.32],
    scale: [0.85, 1.15, 0.75],
    rotation: [0.15, 0.25, 0.08],
    radius: 0.58,
    labelOffset: [-0.7, -0.15, 0.45],
    renderOrder: 1,
  },
  {
    id: 'left_ventricle',
    kind: 'chamber',
    abbr: 'LV',
    label: { en: 'Left ventricle', zh: '左心室' },
    description: {
      en: 'Dominant pumping chamber for systemic circulation. Thick myocardium; forms most of the cardiac apex and the left heart border.',
      zh: '体循环的主要泵血腔，心肌最厚；构成心尖大部及左心缘。',
    },
    color: '#e0707c',
    emissive: '#ff8894',
    position: [0.22, -0.18, 0.02],
    scale: [1.05, 1.35, 1.0],
    rotation: [0.1, -0.12, -0.05],
    radius: 0.62,
    labelOffset: [0.75, -0.2, 0.2],
    renderOrder: 1,
  },
  {
    id: 'septum',
    kind: 'wall',
    abbr: 'IVS',
    label: { en: 'Interventricular septum', zh: '室间隔' },
    description: {
      en: 'Muscular wall separating right and left ventricles. Early septal activation contributes to the initial QRS vector (septal q / r patterns).',
      zh: '分隔左、右心室的肌性结构。室间隔早期除极参与 QRS 起始向量（间隔 q/r 波）。',
    },
    color: '#8b4a6a',
    emissive: '#c45a8a',
    position: [-0.02, -0.15, 0.12],
    scale: [0.28, 1.2, 0.85],
    rotation: [0.08, 0.35, 0.05],
    radius: 0.55,
    labelOffset: [0.05, 0.55, 0.55],
    renderOrder: 3,
    opacityBias: -0.08,
  },
  {
    id: 'apex',
    kind: 'landmark',
    abbr: 'Apex',
    label: { en: 'Cardiac apex', zh: '心尖' },
    description: {
      en: 'Inferior tip of the heart, formed primarily by the left ventricle. Directed left, anterior, and inferior — an important surface landmark for V4–V5.',
      zh: '心脏下端，主要由左心室构成，指向左前下方；是 V4–V5 等胸导联的重要体表标志。',
    },
    color: '#d05868',
    emissive: '#ff7080',
    position: [0.18, -1.05, 0.18],
    scale: [0.72, 0.55, 0.68],
    rotation: [0.2, 0, 0.1],
    radius: 0.48,
    labelOffset: [0.15, -0.45, 0.35],
    renderOrder: 2,
  },
] as const

export const HEART_STRUCTURE_BY_ID: Record<
  HeartStructureId,
  HeartStructureDef
> = Object.fromEntries(HEART_STRUCTURES.map((s) => [s.id, s])) as Record<
  HeartStructureId,
  HeartStructureDef
>

export const HEART_STRUCTURE_IDS: HeartStructureId[] = HEART_STRUCTURES.map(
  (s) => s.id,
)
