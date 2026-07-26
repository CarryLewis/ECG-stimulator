# AGENTS.md

## Local-first / offline instructions

### What this repo is

An **Interactive Physiology & ECG Learning Simulator** — a single-page web app
that lets medical students see how the 12-lead ECG and cardiac electrical
conduction change across physiological and disease states (normal sinus rhythm,
STEMI, hyper-/hypokalemia, atrial fibrillation, AV block).

**Storage & runtime model:** keep the working tree on a local disk (or private
remote). Do not treat a public cloud host as the primary place this codebase
lives or runs.

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
- UI: `src/components/` (live canvas 12-lead + **draggable 3D** heart share one
  clock via `src/hooks/useSimulationClock.ts`). ECG uses **cascade sweep**.
  Heart models: **V1** conduction schematic (`HeartConductionV1`) and **V2**
  anatomical lead atlas (`HeartAnatomyV2` + `src/ecg/leadMap.ts`) with wall
  colour patches and 12-lead pins; clicking an ECG row ↔ 3D pin stays in sync.
  Procedural Three.js / R3F only — no CDN assets.

### Running / testing / building

Standard scripts are defined in `package.json` — use them rather than ad-hoc
commands:

- `npm run dev` — Vite on **127.0.0.1:5173** (localhost only). Main way to run.
- `npm run build` — type-checks (`tsc -b`) and writes `dist/` with relative asset
  paths (`base: './'`) for portable offline use.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run preview` — serve the production build on **127.0.0.1:4173**.
- `npm run pack:offline` — build a self-contained `.tar.gz` under `offline-bundle/`
  (source + vendored `node_modules` + `dist/`) for USB / air-gapped machines.
  See `docs/offline-local-setup.md`.

There is no automated test suite yet; verify changes by running the dev server
and interacting with the UI. Confirm that conduction glow and ECG sweep stay
phase-locked when changing scenarios.

### Non-obvious notes

- TypeScript is strict with `noUnusedLocals` / `noUnusedParameters`; `npm run
  build` will fail on unused symbols even if the dev server runs fine. Run
  `npm run lint` before committing.
- The conduction diagram and live ECG share `elapsed` from `useSimulationClock`
  (default **0.35×** real-time so SA→AV→His→ventricle is visually trackable)
  and the same `conductionAt` / dipole path. AF irregular RR uses a shared
  seeded schedule (`afSeed`) so both views stay phase-locked. Change pace via
  the Playback controls; speed changes do not reset the timeline.
- To add a new disease/scenario, add a `Disease` entry in `src/ecg/diseases.ts`
  (params + `buildPlan` + `explain`); the UI and ECG update automatically.
- Do not add CDN font/script links or cloud-only deploy configs unless the user
  explicitly asks; keep the offline-local contract intact.
