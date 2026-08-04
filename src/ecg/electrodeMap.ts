import type { LeadName, Territory } from './types'
import { LEAD_LANDMARK_BY_NAME, TERRITORY_COLOR } from './leadMap'

/**
 * Clinical surface electrodes for a standard 12-lead ECG.
 *
 * Body axes for the V3 torso scene (standing, anterior view):
 *   x = patient's left (+), y = superior (+), z = anterior (+)
 *
 * Ten physical electrodes → twelve derived leads (Einthoven / Goldberger +
 * precordial). RL is the right-leg / drive-ground reference.
 *
 * Coordinates are body-local (before BODY_SCALE). Precordial sites sit on the
 * flattened lathe chest: V1/V2 at 4th ICS parasternal, V4 at 5th ICS
 * mid-clavicular (over the apex), V5/V6 on the left axillary wall at V4 level.
 */
export type ElectrodeId = 'RA' | 'LA' | 'RL' | 'LL' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'

export interface ElectrodeSite {
  id: ElectrodeId
  /** Surface position on the translucent torso. */
  position: [number, number, number]
  /** Label / callout offset from the electrode. */
  labelOffset: [number, number, number]
  /** Anatomical placement cue (Chinese / English). */
  placeZh: string
  placeEn: string
  /** Leads that use this electrode as an exploring or contributing pole. */
  leads: LeadName[]
  color: string
  /** Limb vs precordial grouping for UI layers. */
  group: 'limb' | 'precordial'
}

export const ELECTRODE_SITES: ElectrodeSite[] = [
  {
    id: 'RA',
    position: [-1.05, 1.05, 0.38],
    labelOffset: [-0.35, 0.22, 0.12],
    placeZh: '右臂 / 右肩近端',
    placeEn: 'Right arm / proximal shoulder',
    leads: ['I', 'II', 'aVR'],
    color: '#f87171',
    group: 'limb',
  },
  {
    id: 'LA',
    position: [1.05, 1.05, 0.38],
    labelOffset: [0.35, 0.22, 0.12],
    placeZh: '左臂 / 左肩近端',
    placeEn: 'Left arm / proximal shoulder',
    leads: ['I', 'III', 'aVL'],
    color: '#fbbf24',
    group: 'limb',
  },
  {
    id: 'RL',
    position: [-0.72, -1.45, 0.42],
    labelOffset: [-0.32, -0.22, 0.1],
    placeZh: '右下肢 / 右下腹（地线）',
    placeEn: 'Right leg / lower abdomen (ground)',
    leads: [],
    color: '#94a3b8',
    group: 'limb',
  },
  {
    id: 'LL',
    position: [0.72, -1.45, 0.42],
    labelOffset: [0.32, -0.22, 0.1],
    placeZh: '左下肢 / 左下腹',
    placeEn: 'Left leg / lower abdomen',
    leads: ['II', 'III', 'aVF'],
    color: '#34d399',
    group: 'limb',
  },
  {
    id: 'V1',
    position: [-0.12, 0.18, 0.52],
    labelOffset: [-0.3, 0.2, 0.14],
    placeZh: '胸骨右缘第 4 肋间',
    placeEn: '4th ICS, right sternal border',
    leads: ['V1'],
    color: TERRITORY_COLOR.septal,
    group: 'precordial',
  },
  {
    id: 'V2',
    position: [0.12, 0.16, 0.54],
    labelOffset: [0.08, 0.28, 0.16],
    placeZh: '胸骨左缘第 4 肋间',
    placeEn: '4th ICS, left sternal border',
    leads: ['V2'],
    color: TERRITORY_COLOR.anterior,
    group: 'precordial',
  },
  {
    id: 'V3',
    position: [0.34, 0.02, 0.52],
    labelOffset: [0.12, 0.24, 0.18],
    placeZh: 'V2 与 V4 中点',
    placeEn: 'Midway between V2 and V4',
    leads: ['V3'],
    color: TERRITORY_COLOR.anterior,
    group: 'precordial',
  },
  {
    id: 'V4',
    position: [0.55, -0.12, 0.4],
    labelOffset: [0.16, -0.08, 0.22],
    placeZh: '左锁骨中线第 5 肋间',
    placeEn: '5th ICS, mid-clavicular line',
    leads: ['V4'],
    color: TERRITORY_COLOR.anterior,
    group: 'precordial',
  },
  {
    id: 'V5',
    // On elliptical chest wall (A–P scale 0.62); anterior axillary lateral to V4.
    position: [0.72, -0.12, 0.24],
    labelOffset: [0.28, 0.06, 0.12],
    placeZh: '左腋前线，与 V4 同水平',
    placeEn: 'Anterior axillary line, level with V4',
    leads: ['V5'],
    color: TERRITORY_COLOR.lateral,
    group: 'precordial',
  },
  {
    id: 'V6',
    // Mid-axillary on left lateral wall — elliptical radius stays ≤ torso profile.
    position: [0.82, -0.12, 0.06],
    labelOffset: [0.32, 0.1, 0.02],
    placeZh: '左腋中线，与 V4 同水平',
    placeEn: 'Mid-axillary line, level with V4',
    leads: ['V6'],
    color: TERRITORY_COLOR.lateral,
    group: 'precordial',
  },
]

export const ELECTRODE_BY_ID: Record<ElectrodeId, ElectrodeSite> =
  Object.fromEntries(ELECTRODE_SITES.map((e) => [e.id, e])) as Record<
    ElectrodeId,
    ElectrodeSite
  >

/** Which surface electrodes light up when a 12-lead channel is selected. */
export const LEAD_ELECTRODES: Record<LeadName, ElectrodeId[]> = {
  I: ['LA', 'RA'],
  II: ['LL', 'RA'],
  III: ['LL', 'LA'],
  aVR: ['RA'],
  aVL: ['LA'],
  aVF: ['LL'],
  V1: ['V1'],
  V2: ['V2'],
  V3: ['V3'],
  V4: ['V4'],
  V5: ['V5'],
  V6: ['V6'],
}

export interface LeadPlacementLabel {
  lead: LeadName
  /** Floating label position in the torso scene. */
  position: [number, number, number]
  territory: Territory
  color: string
  /** Short placement / derivation note. */
  noteZh: string
  noteEn: string
}

/**
 * Explicit 12-lead callouts for the V3 schematic.
 * Precordial labels sit on the chest electrodes; limb/augmented labels sit
 * along the Einthoven triangle so students see how I–III / aVR–aVF are derived.
 */
export const LEAD_PLACEMENT_LABELS: LeadPlacementLabel[] = [
  {
    lead: 'I',
    position: [0.0, 1.28, 0.55],
    territory: 'lateral',
    color: TERRITORY_COLOR.lateral,
    noteZh: 'I = LA − RA（水平）',
    noteEn: 'I = LA − RA (horizontal)',
  },
  {
    lead: 'II',
    position: [-0.55, -0.15, 0.7],
    territory: 'inferior',
    color: TERRITORY_COLOR.inferior,
    noteZh: 'II = LL − RA（左下）',
    noteEn: 'II = LL − RA (left-inferior)',
  },
  {
    lead: 'III',
    position: [0.55, -0.15, 0.7],
    territory: 'inferior',
    color: TERRITORY_COLOR.inferior,
    noteZh: 'III = LL − LA（右下）',
    noteEn: 'III = LL − LA (right-inferior)',
  },
  {
    lead: 'aVR',
    position: [-1.15, 0.55, 0.55],
    territory: 'none',
    color: TERRITORY_COLOR.cavity,
    noteZh: 'aVR · 右肩俯视',
    noteEn: 'aVR · right-shoulder view',
  },
  {
    lead: 'aVL',
    position: [1.15, 0.55, 0.55],
    territory: 'lateral',
    color: TERRITORY_COLOR.lateral,
    noteZh: 'aVL · 左肩俯视',
    noteEn: 'aVL · left-shoulder view',
  },
  {
    lead: 'aVF',
    position: [0.0, -1.72, 0.55],
    territory: 'inferior',
    color: TERRITORY_COLOR.inferior,
    noteZh: 'aVF · 足端仰视',
    noteEn: 'aVF · foot-end view',
  },
  {
    lead: 'V1',
    position: [-0.12, 0.36, 0.72],
    territory: 'septal',
    color: TERRITORY_COLOR.septal,
    noteZh: LEAD_LANDMARK_BY_NAME.V1.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V1.faceEn,
  },
  {
    lead: 'V2',
    position: [0.12, 0.36, 0.74],
    territory: 'anterior',
    color: TERRITORY_COLOR.anterior,
    noteZh: LEAD_LANDMARK_BY_NAME.V2.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V2.faceEn,
  },
  {
    lead: 'V3',
    position: [0.34, 0.2, 0.74],
    territory: 'anterior',
    color: TERRITORY_COLOR.anterior,
    noteZh: LEAD_LANDMARK_BY_NAME.V3.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V3.faceEn,
  },
  {
    lead: 'V4',
    position: [0.55, 0.08, 0.66],
    territory: 'anterior',
    color: TERRITORY_COLOR.anterior,
    noteZh: LEAD_LANDMARK_BY_NAME.V4.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V4.faceEn,
  },
  {
    lead: 'V5',
    position: [0.88, 0.08, 0.38],
    territory: 'lateral',
    color: TERRITORY_COLOR.lateral,
    noteZh: LEAD_LANDMARK_BY_NAME.V5.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V5.faceEn,
  },
  {
    lead: 'V6',
    position: [1.0, 0.1, 0.14],
    territory: 'lateral',
    color: TERRITORY_COLOR.lateral,
    noteZh: LEAD_LANDMARK_BY_NAME.V6.faceZh,
    noteEn: LEAD_LANDMARK_BY_NAME.V6.faceEn,
  },
]

export const LEAD_PLACEMENT_BY_NAME: Record<LeadName, LeadPlacementLabel> =
  Object.fromEntries(LEAD_PLACEMENT_LABELS.map((l) => [l.lead, l])) as Record<
    LeadName,
    LeadPlacementLabel
  >
