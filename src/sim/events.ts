/**
 * Runtime physiological event types for the conduction animation engine.
 * Aligned with docs/core-data-model/heartbeat.ts (event-driven design).
 */

export type PhysiologicalEventType =
  | 'cycle_start'
  | 'sa_node_activation'
  | 'atrial_activation'
  | 'av_node_activation'
  | 'his_activation'
  | 'bundle_branch_activation'
  | 'ventricular_activation'
  | 'repolarization'
  | 'cycle_end'

export type ConductionRegion =
  | 'sa_node'
  | 'atria'
  | 'av_node'
  | 'his_bundle'
  | 'bundle_branches'
  | 'purkinje'
  | 'ventricle'

export interface PhysiologicalEvent {
  id: string
  type: PhysiologicalEventType
  /** Absolute simulation time (seconds). */
  t: number
  heartbeatId: string
  region?: ConductionRegion
  /** Optional teaching label. */
  label: string
  /** Offset from SA onset within this cycle (seconds). */
  offset_s: number
}

export interface HeartbeatCycle {
  id: string
  sequence: number
  /** Absolute SA onset (cycle t0). */
  t0: number
  /** Absolute cycle end. */
  tEnd: number
  rateBpm: number
  events: readonly PhysiologicalEvent[]
}
