# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is

An **Interactive Physiology & ECG Learning Simulator** — a single-page web app
that lets medical students see how the 12-lead ECG and cardiac electrical
conduction change across physiological and disease states (normal sinus rhythm,
STEMI, hyper-/hypokalemia, atrial fibrillation, AV block).

- Frontend-only: **React + TypeScript + Vite**. There is no backend, database, or
  external API — all ECG waveforms are synthesised in the browser, so the app
  runs fully offline once dependencies are installed.
- Entry point: `src/main.tsx` → `src/App.tsx`.
- ECG pipeline (`src/ecg/`):
  - `conduction.ts` — shared SA→AV→His→ventricle activation timeline
  - `dipole.ts` — cardiac vector from conduction wavefronts + disease modifiers
  - `leads.ts` — Einthoven / precordial lead projection axes
  - `generator.ts` — samples dipole→lead voltages (batch + live)
  - `diseases.ts` — scenario params, `buildPlan`, educational text
- UI: `src/components/` (live canvas 12-lead + conduction diagram share one clock
  via `src/hooks/useSimulationClock.ts`).

### Running / testing / building

Standard scripts are defined in `package.json` — use them rather than ad-hoc
commands:

- `npm run dev` — Vite dev server on port **5173** (`host: true`, so reachable
  on the VM network). This is the main way to run the app.
- `npm run build` — type-checks (`tsc -b`) and produces a production build.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run preview` — serve the production build.

There is no automated test suite yet; verify changes by running the dev server
and interacting with the UI. Confirm that conduction glow and ECG sweep stay
phase-locked when changing scenarios.

### Non-obvious notes

- TypeScript is strict with `noUnusedLocals` / `noUnusedParameters`; `npm run
  build` will fail on unused symbols even if the dev server runs fine. Run
  `npm run lint` before committing.
- The conduction diagram and live ECG share `elapsed` from `useSimulationClock`
  and the same `conductionAt` / dipole path. AF irregular RR uses a shared
  seeded schedule (`afSeed`) so both views stay phase-locked.
- To add a new disease/scenario, add a `Disease` entry in `src/ecg/diseases.ts`
  (params + `buildPlan` + `explain`); the UI and ECG update automatically.
