/**
 * Optional drop-in for the commercial "Heart Animated Realistic 1.0" asset.
 * Export the Unity `.unitypackage` → GLB (see `docs/heart-asset-integration.md`),
 * place at `public/models/heart-animated-realistic.glb`, then set
 * `USE_REALISTIC_HEART_GLB` to true and load via `@react-three/drei` `useGLTF`.
 */
export const REALISTIC_HEART_GLB = '/models/heart-animated-realistic.glb'

/** Flip to true after the exported GLB is present under `public/models/`. */
export const USE_REALISTIC_HEART_GLB = false

/** Shared scale/pose so a future GLB and the procedural heart sit alike. */
export const HEART_MEDIASTINUM_POSE = {
  position: [-0.18, 0.05, 0.08] as [number, number, number],
  rotation: [0.35, -0.55, 0.18] as [number, number, number],
  scale: 0.55,
}
