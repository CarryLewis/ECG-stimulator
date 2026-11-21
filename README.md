# ECG Stimulator 2.0

Interactive 3D cardiac anatomy + physiology-driven disease packs that drive both the **heart activation model** and the **12-lead ECG**.

## Source models / 源模型版本

The simulator remains **2.0**. Its two source-heart models are versioned separately:

- **源 2.0 / Source 2.0**: continuous ventricular geometry, fixed-size leader labels, an IVS cutaway and separate selection/electrical feedback. [Open Source 2.0](https://carrylewis.com/ecg-simulator/?view=source-2).
- **源 1.0 / Source 1.0**: preserved original chamber geometry, colors, labels and interaction. [Open Source 1.0](https://carrylewis.com/ecg-simulator/?view=source-1).

Both remain available in the original heart-view controls, alongside V1 (conduction schematic), V2 (lead atlas) and V3 (torso). See [the model and verification notes](docs/source-heart-design.md). The simulator 1.0 archive is separate from the Source 1.0 model.

## Versions / 版本

- **1.0** · [Archived source / 归档源码](https://github.com/CarryLewis/ECG-stimulator/tree/release/1.0). Exact source of the original website demo at commit `00dd7e3`.
- **2.0** · Built directly from 1.0 with the original sidebar settings, controls, defaults and twelve-lead layout, with the new Source 2.0 model and the preserved Source 1.0 model. Interaction updates link ECG lead selection to the heart, locate selected chambers, and let the existing live badge pause and resume both views. All leads share one 250 Hz time grid. Pathological rhythm feedback follows the active model.

点击 ECG 上方原有的实时状态标记可同步暂停或继续。点击导联波形可定位到心脏中的对应导联，点击心腔结构或调整透明度会打开源模型；已经选择源 1.0 时会保留在旧模型中。

The simulator illustrates electrical activity for education. Use the on-screen time and amplitude scale to read the simulated waveform.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run check:disease
```

## Language

Top-left panel: **中文 / English** toggle. Choice is stored in `localStorage`.
Controls, pathology explanations, and anatomy labels switch together.

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

## Website embed auto-sync

The website pins a tested commit from `release/2.0` in `Carry-website/ecg-embed.ref`. Updating that pin publishes the corresponding app and both source models through the existing GitHub Pages workflow.

Pushes to `main` or `cursor/pathology-ecg-models-fab9` trigger
`notify-website.yml`, which asks Carry-website to rebuild
https://carrylewis.com/ecg-simulator/ via `repository_dispatch` (`ecg-updated`).

Requires repo secret `WEBSITE_DISPATCH_TOKEN` (PAT with access to Carry-website).

Manual test:

```bash
gh workflow run "Notify website to rebuild ECG embed"
```
