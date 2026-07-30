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

- Macroscopic structures: RA, LA, RV, LV, interventricular septum, apex
- Orbit rotate / zoom
- Transparent myocardium (opacity control)
- Anatomical labels
- Selectable structures (viewport + list)

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
