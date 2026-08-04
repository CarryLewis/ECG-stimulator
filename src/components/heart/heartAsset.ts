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
 * Mediastinal pose inside the V3 body contour (world units).
 *
 * Heart is sized independently of BODY_SCALE so enlarging the torso does not
 * enlarge the heart. Target adult ratio: heart ≈ ¼–⅓ of chest width
 * (fist-sized organ in an adult male thorax).
 *
 * Position / rotation approximate clinical mediastinal orientation:
 *   - slightly left of midline (≈⅔ of the organ mass left of mid-sternum)
 *   - mid-thorax height (base near 2nd–3rd ICS, apex toward 5th ICS / V4)
 *   - behind the sternum, mildly anterior in the chest cavity
 *   - long axis toward left–inferior–anterior (apex points at mid-clavicular)
 *
 * Axes: +x patient left, +y superior, +z anterior.
 */
export const HEART_MEDIASTINUM_POSE = {
  position: [-0.16, 0.12, 0.28] as [number, number, number],
  rotation: [0.38, -0.55, 0.18] as [number, number, number],
  scale: 0.36,
}
