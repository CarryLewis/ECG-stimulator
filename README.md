# ECG Stimulator — Interactive 3D Cardiac Anatomy

Physiology-first teaching SPA: anatomy and conduction feed an **electrical vector engine**; the **ECG generator** only samples projected lead voltages (no hardcoded waveforms).

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

- Five heart views: **Src** chambers, **V1** conduction, **V2** lead atlas, **V3** torso electrodes, **Vec** electrical vectors
- Shared **orientation cube** on every version: **A / P / L / R / H / B**
- **Event-driven conduction** (SA → atria → AV → His → ventricle → repolarization)
- **Electrical Vector Engine** (`src/vector-engine/`): myocardial wavefronts → cardiac dipole + contributions → lead projections + mean electrical axis
- **ECG Generator** (`src/ecg-generator/`): samples vector lead voltages into live strips / ring buffers
- **Vec view**: 3D arrows for activation contributions, ventricular depolarization, net field, and frontal mean electrical axis; HUD + mini ECG from the generator

Diseases / pathology packs are **not** included yet — tissue modifiers are ready for injury current when packs arrive.

## ECG pipeline

```
Cardiac activation (physiological events)
        ↓
Electrical vector (dipole + contributions)
        ↓
Body surface potential (electrode Φ)
        ↓
Lead calculation (Einthoven / Goldberger / Wilson)
        ↓
ECG waveform (sampled ring buffer)
```

Synchronization: **P** ← atrial activation · **QRS** ← ventricular depolarization · **T** ← repolarization.

## Layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions (ids aligned with `docs/core-data-model`) |
| `src/sim/` | Shared clock + sinus event scheduler + EP glow |
| `src/ep/` | Bridge: conduction state → vector-engine wavefronts |
| `src/vector-engine/` | Dipole / contributions / lead axes / mean axis |
| `src/ecg-generator/` | Sampling + ring buffers (no morphology forks) |
| `src/components/vector/` | 3D arrows + vector HUD + mini ECG |
| `docs/core-data-model/` | Typed contracts for the full platform |
| `docs/software-architecture-design.md` | Layered architecture |

## Design notes

- Data flow: **EP → Vector → ECG** (one-way for signals)
- Body axes: +x patient left, +y superior (scene), +z anterior; lead math uses Einthoven +y inferior
- Procedural meshes (shared sphere geometry) for performance and offline use
- No CDN runtime dependency once `node_modules` are installed

## Website embed auto-sync

Pushes to `main` or `cursor/pathology-ecg-models-fab9` trigger
`notify-website.yml`, which asks Carry-website to rebuild
https://carrylewis.com/ecg-simulator/ via `repository_dispatch` (`ecg-updated`).

Requires repo secret `WEBSITE_DISPATCH_TOKEN` (PAT with access to Carry-website).

Manual test:

```bash
gh workflow run "Notify website to rebuild ECG embed"
```
