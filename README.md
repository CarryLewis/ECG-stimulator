# ECG Stimulator — Interactive Physiology & ECG Learning Simulator

3D cardiac anatomy as the biological source model, with a **real-time ECG recording monitor** driven by the shared simulation clock.

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
- **Event-driven conduction animation** (no manual keyframes)
- **Continuous ECG recording monitor** (Canvas, not static SVG charts):
  - Signal acquisition → real-time plotting → scrolling strip
  - Sweep speeds 25 / 50 / 100 mm/s, 10 mm/mV calibration
  - Pause / resume / step / freeze / replay last beat / zoom
  - Lead II, single, six-lead, and twelve-lead layouts
  - Dark bedside monitor + optional ECG paper mode
  - Synced to the same SA → AV → ventricle physiology clock as the 3D heart

## Layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions |
| `src/components/anatomy/` | R3F viewport + heart mesh + control panel |
| `src/components/ecg/` | Continuous ECG monitor / strip / controls |
| `src/ecg/` | Lead geometry + physiology→dipole→lead sampling |
| `src/recording/` | Ring buffer, recorder, transport clock |
| `src/sim/` | Shared simulation clock + heartbeat events |
| `docs/core-data-model/` | Platform type contracts |
| `docs/software-architecture-design.md` | Layered architecture |

## Design notes

- ECG traces are **recorded** sample-by-sample into a ring buffer and scrolled — never jump-redrawn as a complete static waveform
- The monitor subscribes to the simulation engine; it does not invent an independent animation timeline
- Procedural meshes for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
