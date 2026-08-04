import type { LeadName, Territory } from './types'

/** Wall territory colours — anatomy-software style segmentation. */
export const TERRITORY_COLOR: Record<Exclude<Territory, 'none'> | 'cavity', string> =
  {
    anterior: '#f59e0b',
    septal: '#8b5cf6',
    lateral: '#3b82f6',
    inferior: '#ef4444',
    posterior: '#14b8a6',
    cavity: '#94a3b8',
  }

export interface LeadLandmark {
  lead: LeadName
  /** Surface anchor on the anatomical heart (x left, y inferior, z anterior). */
  position: [number, number, number]
  /** Offset for the floating pin / label. */
  pinOffset: [number, number, number]
  territory: Territory
  /** Short Chinese + English face description. */
  faceZh: string
  faceEn: string
  /** What electrical vector this lead primarily “sees”. */
  sensesZh: string
  sensesEn: string
  color: string
}

/**
 * Educational map: each 12-lead ECG channel → cardiac wall / viewing direction.
 * Positions are in the same body axes as `LEAD_AXES` / the dipole engine.
 */
export const LEAD_LANDMARKS: LeadLandmark[] = [
  {
    lead: 'I',
    position: [0.98, -0.25, 0.22],
    pinOffset: [0.35, 0.15, 0.15],
    territory: 'lateral',
    faceZh: '高侧壁',
    faceEn: 'High lateral wall',
    sensesZh: '检测左向（水平）电向量',
    sensesEn: 'Senses leftward (horizontal) vectors',
    color: TERRITORY_COLOR.lateral,
  },
  {
    lead: 'II',
    position: [0.25, -1.38, 0.18],
    pinOffset: [0.15, -0.35, 0.2],
    territory: 'inferior',
    faceZh: '下壁（膈面）',
    faceEn: 'Inferior / diaphragmatic',
    sensesZh: '检测左下向电向量（II 最常用节律导联）',
    sensesEn: 'Senses left-inferior vectors (common rhythm lead)',
    color: TERRITORY_COLOR.inferior,
  },
  {
    lead: 'III',
    position: [-0.28, -1.25, 0.12],
    pinOffset: [-0.3, -0.3, 0.15],
    territory: 'inferior',
    faceZh: '下壁偏右',
    faceEn: 'Inferior (rightward)',
    sensesZh: '检测右下向电向量',
    sensesEn: 'Senses right-inferior vectors',
    color: TERRITORY_COLOR.inferior,
  },
  {
    lead: 'aVR',
    position: [-0.72, 0.95, 0.25],
    pinOffset: [-0.35, 0.25, 0.1],
    territory: 'none',
    faceZh: '右上腔 / 心内膜视角',
    faceEn: 'Right-superior / endocardial view',
    sensesZh: '从右肩俯视心腔，常呈镜像负向',
    sensesEn: 'Looks from right shoulder into cavity (often reciprocal)',
    color: TERRITORY_COLOR.cavity,
  },
  {
    lead: 'aVL',
    position: [0.88, 0.25, 0.2],
    pinOffset: [0.35, 0.25, 0.1],
    territory: 'lateral',
    faceZh: '高侧壁',
    faceEn: 'High lateral wall',
    sensesZh: '检测左上向电向量',
    sensesEn: 'Senses left-superior vectors',
    color: TERRITORY_COLOR.lateral,
  },
  {
    lead: 'aVF',
    position: [0.08, -1.42, -0.05],
    pinOffset: [0.05, -0.4, -0.1],
    territory: 'inferior',
    faceZh: '下壁正中',
    faceEn: 'Inferior midline',
    sensesZh: '检测正下向电向量',
    sensesEn: 'Senses straight inferior vectors',
    color: TERRITORY_COLOR.inferior,
  },
  {
    lead: 'V1',
    position: [-0.38, -0.15, 0.92],
    pinOffset: [-0.25, 0.1, 0.35],
    territory: 'septal',
    faceZh: '右室间隔面',
    faceEn: 'RV / septal face',
    sensesZh: '检测前间隔（偏右）电活动',
    sensesEn: 'Senses right-septal / anterior activity',
    color: TERRITORY_COLOR.septal,
  },
  {
    lead: 'V2',
    position: [-0.08, -0.3, 0.98],
    pinOffset: [-0.05, 0.05, 0.4],
    territory: 'anterior',
    faceZh: '前间隔',
    faceEn: 'Anteroseptal',
    sensesZh: '检测前壁近间隔电活动',
    sensesEn: 'Senses anteroseptal activity',
    color: TERRITORY_COLOR.anterior,
  },
  {
    lead: 'V3',
    position: [0.28, -0.55, 0.95],
    pinOffset: [0.1, 0.0, 0.4],
    territory: 'anterior',
    faceZh: '前壁',
    faceEn: 'Anterior wall',
    sensesZh: '检测前壁移行区电活动',
    sensesEn: 'Senses anterior transition-zone activity',
    color: TERRITORY_COLOR.anterior,
  },
  {
    lead: 'V4',
    position: [0.52, -1.05, 0.72],
    pinOffset: [0.2, -0.15, 0.35],
    territory: 'anterior',
    faceZh: '心尖前壁',
    faceEn: 'Apical anterior',
    sensesZh: '检测心尖前壁电活动',
    sensesEn: 'Senses apical-anterior activity',
    color: TERRITORY_COLOR.anterior,
  },
  {
    lead: 'V5',
    position: [0.9, -0.75, 0.42],
    pinOffset: [0.35, -0.05, 0.2],
    territory: 'lateral',
    faceZh: '前侧壁',
    faceEn: 'Anterolateral wall',
    sensesZh: '检测左前侧壁电活动',
    sensesEn: 'Senses anterolateral activity',
    color: TERRITORY_COLOR.lateral,
  },
  {
    lead: 'V6',
    position: [1.02, -0.55, 0.08],
    pinOffset: [0.4, 0.0, 0.05],
    territory: 'lateral',
    faceZh: '侧壁中部',
    faceEn: 'Mid-lateral wall',
    sensesZh: '检测左中侧壁电活动',
    sensesEn: 'Senses mid-lateral activity',
    color: TERRITORY_COLOR.lateral,
  },
]

export const LEAD_LANDMARK_BY_NAME: Record<LeadName, LeadLandmark> =
  Object.fromEntries(LEAD_LANDMARKS.map((l) => [l.lead, l])) as Record<
    LeadName,
    LeadLandmark
  >

/** Soft wall patches used to colour-code the V2 heart surface. */
export interface WallPatch {
  id: string
  territory: Exclude<Territory, 'none'>
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  labelZh: string
}

export const WALL_PATCHES: WallPatch[] = [
  {
    id: 'ant',
    territory: 'anterior',
    position: [0.2, -0.55, 0.85],
    scale: [0.85, 0.95, 0.35],
    rotation: [0.2, 0, 0],
    labelZh: '前壁',
  },
  {
    id: 'sep',
    territory: 'septal',
    position: [-0.25, -0.35, 0.7],
    scale: [0.55, 0.8, 0.4],
    rotation: [0.1, 0.4, 0],
    labelZh: '间隔',
  },
  {
    id: 'lat',
    territory: 'lateral',
    position: [0.95, -0.45, 0.15],
    scale: [0.35, 1.0, 0.75],
    rotation: [0, 0.2, 0.15],
    labelZh: '侧壁',
  },
  {
    id: 'inf',
    territory: 'inferior',
    position: [0.1, -1.35, 0.05],
    scale: [0.9, 0.35, 0.7],
    rotation: [0.9, 0, 0],
    labelZh: '下壁',
  },
  {
    id: 'post',
    territory: 'posterior',
    position: [0.15, -0.55, -0.75],
    scale: [0.85, 0.9, 0.35],
    rotation: [-0.15, 0, 0],
    labelZh: '后壁',
  },
]
