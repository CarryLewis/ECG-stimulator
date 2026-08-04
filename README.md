# ECG Stimulator — Cardiac Electrophysiology Laboratory

Physiology-first teaching SPA: a laboratory interface with a large interactive 3D heart, live ECG monitor, conduction timeline, clinical interpretation, and pathology scenarios.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

## Interface

| Region | Role |
|--------|------|
| **Main stage** | Large interactive 3D heart (anatomy / conduction / leads / torso / vectors) |
| **ECG monitor** | Continuous recording from activation → vector → body surface → lead calculation |
| **Timeline** | Physiological cascade + playback (time scale, heart rate) |
| **Clinical / Pathology** | Disease packs, mechanism copy, mean axis, activation contributions |

## ECG pipeline

```
Cardiac anatomy → Electrophysiology → Electrical activation → Electrical vector
  → Body surface potential → 12-lead ECG → Clinical interpretation
```

Diseases modify the physiological model — they never paint lead millivolts directly.

P ← atrial activation · QRS ← ventricular depolarization · T ← repolarization

## Documentation

AI Project Control Center lives under [`docs/`](./docs/): vision, requirements, architecture, medical model, disease architecture, roadmap, and per-module memory. See [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) for consolidation history.

## Layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions (ids aligned with `docs/core-data-model`) |
| `src/components/lab/` | EP laboratory shell (header, ECG, timeline, clinical) |
| `src/components/anatomy/` | R3F viewport + heart mesh |
| `src/vector-engine/` | Activation → electrical vector → body-surface Φ → leads |
| `src/ecg-generator/` | Sampled ECG from the vector pipeline |
| `src/disease/` | Physiology-driven disease packs + scenario UI mapping |
| `src/recording/` | Continuous ECG ring-buffer acquisition + transport clock |
| `src/simulation/` | Shared dipole physiological sim core (teaching params) |
| `docs/core-data-model/` | Event-driven type contracts for the full platform |
| `docs/software-architecture-design.md` | Layered architecture |

## Design notes

- Procedural meshes (shared sphere geometry) for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
- No CDN runtime dependency once `node_modules` are installed

## Website embed auto-sync

Pushes to `main` trigger `notify-website.yml`, which asks Carry-website to rebuild
https://carrylewis.com/ecg-simulator/ via `repository_dispatch` (`ecg-updated`).

Requires repo secret `WEBSITE_DISPATCH_TOKEN` (PAT with access to Carry-website).

Manual test:

```bash
gh workflow run "Notify website to rebuild ECG embed"
```
