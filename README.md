# ECG Stimulator — Pathology ECG Models

Interactive 3D cardiac anatomy + physiology-driven disease packs that drive both the **heart activation model** and the **12-lead ECG**.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run check:disease
```

## Pathology scenarios

| Scenario | Physiology change | ECG / heart model |
|----------|-------------------|-------------------|
| 窦性心律 | Baseline SA→AV→His→ventricles | Normal P–QRS–T |
| 传导阻滞 | Prolonged PR or complete AV dissociation | Long PR / dissociated P–QRS |
| 心房颤动 | `atrialMode = fibrillation` | Fibrillatory baseline, irregular RR |
| 心房扑动 | `atrialMode = flutter` | Sawtooth F waves, fixed AV ratio |
| 心室扑动 | `ventricularMode = flutter` | Rapid sine-wave (~300/min) |
| 心室颤动 | `ventricularMode = fibrillation` | Chaotic undulation, no QRS |
| 心肌梗死 | Regional ischemia → injury current | ST↑ in facing leads + reciprocal ↓ |

Diseases **never** hardcode lead millivolts. Packs emit `PhysiologicalEffects` → `PhysiologicalModel` → `CyclePlan` → shared dipole sampling for glow + ECG.

## Layout

| Path | Role |
|------|------|
| `src/disease/` | Disease packs, registry, physiology bridge |
| `src/ecg/` | Dipole → 12-lead sampling (`conduction`, `generator`) |
| `src/sim/` | Shared simulation clock + frame |
| `src/components/ecg/` | Live 12-lead monitor |
| `src/components/pathology/` | Scenario picker |
| `docs/disease-architecture.md` | Architecture contract |

## Design notes

- Body axes: +x patient left, +y superior, +z anterior
- Heart glow and ECG share `conductionAt(plan, t)`
- Add a disease by registering a pack that maps params → physiological effects
