# ECG Learning Simulator

Interactive Physiology & ECG Learning Simulator — a **local-first**, offline-capable
single-page app for medical students. All waveforms are synthesised in the browser;
there is no backend and no cloud runtime dependency.

> Product requirements live in [`docs/product-requirement-document.md`](docs/product-requirement-document.md).  
> Offline / local setup details: [`docs/offline-local-setup.md`](docs/offline-local-setup.md).

## Run locally (recommended)

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

Production build on your machine:

```bash
npm run build
npm run preview  # http://127.0.0.1:4173
```

Air-gapped USB bundle (includes `node_modules` + pre-built `dist/`):

```bash
npm run pack:offline
# → offline-bundle/ecg-learning-simulator-offline-*.tar.gz
```

## What this app does

- Live 12-lead ECG from a shared SA → AV → His → ventricle conduction timeline
- Cardiac dipole projected onto Einthoven / precordial axes
- Scenarios: normal sinus, STEMI, hyper-/hypokalemia, atrial fibrillation, AV block
- Animated conduction diagram phase-locked to the ECG sweep

## Project layout

| Path | Role |
|------|------|
| `src/App.tsx` | App shell & shared simulation clock |
| `src/ecg/` | Conduction, dipole, lead projection, disease models |
| `src/components/` | Control panel, live ECG grid, conduction diagram, explanations |
| `docs/` | PRD + offline setup notes |
| `scripts/pack-offline.sh` | Build a self-contained offline tarball |

## Design principles

1. **Offline by default** — no CDN, no remote APIs, no required cloud host
2. **Local bind only** — Vite listens on `127.0.0.1`
3. **Portable build** — `base: './'` so `dist/` works from any folder or USB stick
