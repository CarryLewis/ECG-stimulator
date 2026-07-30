/**
 * ECG Stimulator — core data model (types only).
 *
 * Layer alignment:
 * - anatomy.ts      → Heart Anatomy Model
 * - conduction.ts   → Conduction system (EP topology)
 * - activation.ts   → Cardiac Electrophysiology Engine state
 * - vector.ts       → Electrical Vector Engine
 * - ecg.ts          → ECG Generator
 * - clinical.ts     → Clinical interpretation
 * - heartbeat.ts    → Event-driven cardiac cycle aggregate
 *
 * @see ../software-architecture-design.md
 */

export * from './common'
export * from './anatomy'
export * from './conduction'
export * from './activation'
export * from './vector'
export * from './ecg'
export * from './clinical'
export * from './heartbeat'
