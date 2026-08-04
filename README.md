# ECG Stimulator — Interactive 3D Cardiac Anatomy

**Baseline tip:** `main` @ post-#23 revert (content matches pre-PR#22 `2957d0f`).  
Teaching SPA: heart anatomy + event-driven conduction glow. Live 12-lead ECG / disease packs are **not** on this tip.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview
```

## Shipping features

- Four heart views: **Src** (selectable chambers), **V1** conduction, **V2** lead atlas, **V3** torso electrodes
- Shared **orientation cube** on every version: **A / P / L / R / H / B**
- **Event-driven conduction animation** (no manual keyframes):
  - 0 ms SA → 40 ms atria → 120 ms AV → 200 ms His / ventricular cascade → 350 ms repolarization
  - Glow sampled from physiological events on the shared simulation clock
- Playback pace + heart-rate controls
- Anatomical labels toggle; Src supports myocardium opacity + structure pick

## Layout

| Path | Role |
|------|------|
| `src/App.tsx` | UI state + shared sim clock wiring |
| `src/anatomy/` | Chamber / structure definitions |
| `src/sim/` | Sinus event schedule → conduction glow |
| `src/ecg/` | Lead / electrode teaching maps (`LeadName`, `Territory`) |
| `src/components/anatomy/` | R3F viewport, panel, Src mesh, timeline |
| `src/components/heart/` | V1 / V2 / V3 meshes |
| `src/components/OrientationCube.tsx` | Shared A/P/L/R/H/B snap |
| `docs/core-data-model/` | Design contracts (not compiled into the app) |
| `docs/software-architecture-design.md` | Future layered platform (design only) |
| `docs/product-requirement-document.md` | Product vision / PRD |

## Design notes

- Procedural meshes (shared sphere geometry) for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
- No CDN runtime dependency once `node_modules` are installed
- UI chrome is English on this tip; bilingual strings remain in some data maps for later

## Website embed auto-sync

Pushes to `main` trigger `notify-website.yml`, which asks Carry-website to rebuild
https://carrylewis.com/ecg-simulator/ via `repository_dispatch` (`ecg-updated`).

Requires repo secret `WEBSITE_DISPATCH_TOKEN` (PAT with access to Carry-website).

Manual test:

```bash
gh workflow run "Notify website to rebuild ECG embed"
```
