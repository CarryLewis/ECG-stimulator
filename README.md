# ECG Stimulator — Physiological Vector Core

Interactive teaching simulator: **one cardiac electrical vector** projected onto the standard 12-lead measurement system.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview
npx tsx scripts/validate-ecg.ts   # morphology + Einthoven checks
```

## Physiology pipeline

```
Conduction sequence
  → Cardiac dipole M(t) = [Mx, My, Mz]
  → Lead-vector projection  V_lead = M · a_lead
  → 12-lead ECG + validation
  → Visualization (monitor / paper / 3D)
```

Leads are **never** independent PQRST curves. Changing axis, conduction velocity, injury, or hypertrophy alters `M(t)` once; all leads update together.

## Layout

| Path | Role |
|------|------|
| `src/simulation/` | Cardiac model, conduction, vector, lead axes, ECG generator, validation |
| `src/visualization/` | `ECGMonitor`, `TwelveLeadDisplay`, `Heart3D` (consume signals only) |
| `src/sim/` | Shared clock + conduction glow for 3D animation |
| `src/anatomy/` / `src/components/` | Existing anatomy / torso teaching views |
| `docs/core-data-model/` | Typed contracts for the full platform |

## Coordinates (ECG engine)

- **+x** patient left · **+y** inferior · **+z** anterior
- Limb leads: Einthoven / Goldberger angles (I=0°, II=+60°, III=+120°, …)
- Precordial: `normalize(electrode − heart_center)`

## Controls

- Heart rate, conduction velocity, cardiac axis, PR / QRS scales
- Myocardial injury territory + severity (ST shift via injury current)
- LVH / RVH magnitude bias on the free-wall vector
- Playback time scale for conduction animation

## Design notes

- Visualization never recomputes physiology
- Validation asserts Lead II (+), aVR (−), V1 (−), V6 (+), R progression, PR/QRS/QT ranges
- 3D Src view overlays the instantaneous dipole **M(t)**
