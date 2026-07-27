/**
 * Drop-in anatomical heart for V3 — no Unity required.
 *
 * Place any anatomical heart GLB at:
 *   public/models/heart-animated-realistic.glb
 *
 * Loading mode (default `auto`):
 *   - `auto` / `force` — try the GLB; on miss/error use procedural mesh
 *   - `off`            — always procedural
 *
 * See `docs/heart-asset-integration.md`.
 */
export type HeartGlbMode = 'auto' | 'force' | 'off'

export const HEART_GLB_MODE: HeartGlbMode = 'auto'

/** Public URL (respects Vite `base: './'` for offline bundles). */
export const REALISTIC_HEART_GLB = `${import.meta.env.BASE_URL}models/heart-animated-realistic.glb`

/**
 * Shared scale/pose so a dropped-in GLB and the procedural heart sit in the
 * mediastinum the same way. Tweak here if a particular asset’s pivot differs.
 */
export const HEART_MEDIASTINUM_POSE = {
  position: [-0.18, 0.05, 0.08] as [number, number, number],
  rotation: [0.35, -0.55, 0.18] as [number, number, number],
  scale: 0.55,
}
