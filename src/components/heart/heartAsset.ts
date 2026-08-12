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
 *
 * Scene units: biacromial ≈ 2.16, thoracic height (shoulders→costal margin) ≈ 1.6.
 * Adult heart ≈ 12 cm wide × 9 cm tall → ~35–40% of thoracic width.
 * Procedural heart local bbox ≈ 2.2 × 3.1 → scale ≈ 0.38 keeps it inside the shell.
 */
export const HEART_MEDIASTINUM_POSE = {
  /** Slightly patient-left (+x) of midline, centered in the V-lead band. */
  position: [0.1, -0.06, 0.06] as [number, number, number],
  rotation: [0.2, -0.36, 0.08] as [number, number, number],
  /** Uniform scale — chambers read clearly but no longer fill the thorax. */
  scale: 0.38,
  /** Extra A–P compression so the heart sits behind the chest plate (torso z ≈ 0.58×). */
  depthScale: 0.72,
}
