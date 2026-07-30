/**
 * Selectable macroscopic structures for the anatomy viewport.
 * IDs align with docs/core-data-model RegionId / ChamberId concepts.
 */
export type HeartStructureId =
  | 'right_atrium'
  | 'left_atrium'
  | 'right_ventricle'
  | 'left_ventricle'
  | 'septum'
  | 'apex'

export type HeartStructureKind = 'chamber' | 'wall' | 'landmark'

export interface HeartStructureDef {
  id: HeartStructureId
  kind: HeartStructureKind
  /** Short clinical abbreviation shown on the model. */
  abbr: string
  label: { en: string; zh: string }
  description: { en: string; zh: string }
  /** Base myocardium colour (sRGB hex). */
  color: string
  /** Emissive tint when selected. */
  emissive: string
  /**
   * Local transform in body coordinates:
   * +x patient left, +y superior, +z anterior.
   */
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  /** Sphere radius before scale (shared sphere geometry). */
  radius: number
  /** Label offset from structure centre. */
  labelOffset: [number, number, number]
  /** Render order hint — septum/apex drawn to read through translucent walls. */
  renderOrder: number
  /** Slightly lower opacity than free walls (internal structure). */
  opacityBias?: number
}
