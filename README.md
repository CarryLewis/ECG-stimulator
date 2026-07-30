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

- Three heart versions: **V1** conduction schematic, **V2** lead atlas, **V3** torso electrodes
- Shared **orientation cube** on every version: **A / P / L / R / H / B**
  (Anterior, Posterior, Left, Right, Head, Bottom) — tracks camera; click a face to snap
- Orbit rotate / zoom
- Anatomical labels toggle (V2 pins / V3 electrodes)
- Structure reference panel (RA, LA, RV, LV, septum, apex)

Diseases and live ECG are **not** included yet.

## Layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions (ids aligned with `docs/core-data-model`) |
| `src/components/anatomy/` | R3F viewport + heart mesh + control panel |
| `docs/core-data-model/` | Event-driven type contracts for the full platform |
| `docs/software-architecture-design.md` | Layered architecture |

## Design notes

- Procedural meshes (shared sphere geometry) for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
- No CDN runtime dependency once `node_modules` are installed
