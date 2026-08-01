# ECG Stimulator — Interactive 3D Cardiac Anatomy

First visualization module: the heart as the **biological source model** for future ECG generation.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview
```

## This module

- Four heart views: **Src** (selectable chambers), **V1** conduction, **V2** lead atlas, **V3** torso electrodes
- Shared **orientation cube** on every version: **A / P / L / R / H / B**
- **Event-driven conduction animation** (no manual keyframes):
  - 0 ms SA → 40 ms atria → 120 ms AV → 200 ms His / ventricular cascade → 350 ms repolarization
  - Glow sampled from physiological events on the shared simulation clock (including Src chambers)
- Playback pace + heart-rate controls
- Anatomical labels toggle; Src supports myocardium opacity + structure pick

Diseases are modeled as **physiology packs** (`src/disease/`) — they modify the physiological model, not ECG templates. See [`docs/disease-architecture.md`](./docs/disease-architecture.md). Live 12-lead ECG sampling from the full EP→vector pipeline is still evolving.

## Layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions (ids aligned with `docs/core-data-model`) |
| `src/components/anatomy/` | R3F viewport + heart mesh + control panel |
| `src/disease/` | Disease Simulation Engine + first disease library |
| `docs/core-data-model/` | Event-driven type contracts for the full platform |
| `docs/software-architecture-design.md` | Layered architecture |
| `docs/disease-architecture.md` | Disease engine architecture |

```bash
npm run check:disease   # headless physiology-driven disease invariants
```


## Design notes

- Procedural meshes (shared sphere geometry) for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
- No CDN runtime dependency once `node_modules` are installed
