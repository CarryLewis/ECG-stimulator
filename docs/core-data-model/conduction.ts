/**
 * Conduction system — topology and delay rules.
 *
 * Describes *how* activation can propagate. Instantaneous firing lives in
 * `activation.ts`; scheduled cycle timings live in `heartbeat.ts`.
 */

import type { BeatsPerMinute, DurationSeconds, UnitInterval } from './common'
import type { RegionId } from './anatomy'

/** Logical nodes on the conduction network (subset / alias of regions). */
export type ConductionNodeId = RegionId

export type ConductionEdgeKind =
  | 'intra_atrial'
  | 'av_nodal'
  | 'his_purkinje'
  | 'myocardial'
  | 'accessory' // future WPW etc.

/**
 * Directed conduction pathway between regions.
 * Nominal delay is healthy baseline; pathology scales or blocks edges.
 */
export interface ConductionEdge {
  id: string
  from: ConductionNodeId
  to: ConductionNodeId
  kind: ConductionEdgeKind
  /** Healthy conduction delay along this edge (seconds). */
  nominalDelay_s: DurationSeconds
  /** Relative conduction velocity scale (1 = normal). */
  velocityScale: number
  /** False when the edge cannot conduct (complete block on this path). */
  enabled: boolean
}

export type PacemakerKind =
  | 'sa_node'
  | 'atrial_ectopic'
  | 'av_junctional'
  | 'ventricular_escape'
  | 'fibrillatory_wavelets'

export interface PacemakerSite {
  id: string
  region: RegionId
  kind: PacemakerKind
  /** Intrinsic rate when this focus is driving. */
  intrinsicRate_bpm: BeatsPerMinute
  /** Higher wins when multiple pacemakers compete (overdrive suppression model). */
  hierarchyPriority: number
  active: boolean
}

export type AvBlockDegree =
  | 'none'
  | 'first'
  | 'second_type1' // Wenckebach — future
  | 'second_type2'
  | 'third'

/**
 * Static + slowly varying conduction configuration for the EP engine.
 * Changed by disease packs / user parameters; not per-sample.
 */
export interface ConductionSystemConfig {
  nodes: readonly ConductionNodeId[]
  edges: readonly ConductionEdge[]
  pacemakers: readonly PacemakerSite[]
  /** PR-related AV nodal delay override (seconds), when conducted. */
  avDelay_s: DurationSeconds
  avBlock: AvBlockDegree
  /** Global His–Purkinje / QRS duration scale (>1 widens). */
  qrsDurationScale: number
  /** Atrial organisation mode. */
  atrialMode: 'sinus' | 'fibrillation' | 'standstill' | 'flutter' // flutter reserved
}

/**
 * Transient conduction status at time t (for animation: glow, BLOCK label).
 */
export interface ConductionEdgeState {
  edgeId: string
  /** 0 = idle, 1 = wavefront at peak on this edge. */
  wavefront: UnitInterval
  blocked: boolean
}

export interface ConductionSystemState {
  t: number
  edges: readonly ConductionEdgeState[]
  /** True when AV coupling is intact for the current attempt. */
  avConducts: boolean
  drivingPacemakerId: string | null
}
