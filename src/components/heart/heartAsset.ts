/**
 * Drop-in anatomical heart for V3 — no Unity required.
 *
 * Default is `off` (procedural mesh) so a missing
 * `public/models/heart-animated-realistic.glb` cannot break the scene
 * (Vite may return HTML for 404s, which crashes useGLTF).
 *
 * To use a real GLB: place the file, then set HEART_GLB_MODE to `'force'`.
 * See `docs/heart-asset-integration.md`.
 */
export type HeartGlbMode = 'auto' | 'force' | 'off'

/** Prefer procedural until a real GLB is intentionally enabled. */
export const HEART_GLB_MODE: HeartGlbMode = 'off'

/** Public URL (respects Vite `base: './'` for offline bundles). */
export const REALISTIC_HEART_GLB = `${import.meta.env.BASE_URL}models/heart-animated-realistic.glb`

/**
 * Mediastinal pose inside the V3 body contour.
 * Scale kept large enough to read clearly through the translucent shell.
 */
export const HEART_MEDIASTINUM_POSE = {
  position: [-0.12, 0.02, 0.18] as [number, number, number],
  rotation: [0.28, -0.45, 0.12] as [number, number, number],
  scale: 0.82,
}
