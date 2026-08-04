# Changelog

**Document role:** AI-readable project history  
**Rule:** Every completed task updates this file ([`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) Rule 6)  
**Format:** Newest entries first

---

## 2026-08-04 — Consolidate all open PRs into one tip

**Completed:**

- Merged **every open PR** into `cursor/consolidate-all-prs-fed3` on top of current `main`
- Kept EP laboratory shell + vector → body-surface → lead pipeline from **#14** (which already absorbed **#9/#11/#12/#13**)
- Wired physiology-driven **disease packs** + pathology scenarios from **#16/#18** into the lab Clinical rail
- Added continuous **ECG recording monitor** from **#17** (toggle: 12-lead pathology grid ↔ Record)
- Brought physiological sim core modules from **#15** (`src/simulation`, `src/visualization`, `scripts/validate-ecg.ts`)
- Applied adult V3 heart-to-torso proportions from **#21**
- Shared transport clock: 3D glow + ECG acquisition share one timeline; diseases never paint lead mV directly

### Open PR disposition

| PR | Title | Disposition |
|----|-------|-------------|
| **#21** | V3 heart-to-torso proportions | **Included** |
| **#18** | Pathology ECG models | **Included** (scenarios + CyclePlan bridge) |
| **#17** | Continuous ECG recording monitor | **Included** (Record mode) |
| **#16** | Disease Simulation Engine | **Included** (via #18 library + `check:disease`) |
| **#15** | Physiological ECG sim core | **Included** (modules + `validate:ecg`) |
| **#14** | Prior consolidate (EP lab + vector + docs) | **Included** (base product shell) |
| **#13–#11, #9** | Morphology / lab UI / vectors / docs | **Included** via #14 |
| **#7** | Core data model types | **Already on main** |
| **#5–#1** | Early V3 / offline / live ECG drafts | **Superseded** |
| **#6/#8/#10** | Architecture / anatomy / conduction | **Already on main** |

### Physiological spine on this tip

```
Disease pack → PhysiologicalModel → CyclePlan → conductionAt
  → Electrical vector → Body surface Φ → 12-lead ECG / recording strip
```

**Scripts:** `npm run build` · `npm run check:disease` · `npm run check:ecg` · `npm run validate:ecg`

**Next task:** After merge to `main`, close superseded open PRs; deepen recording sampler so Record mode uses the same CyclePlan voltages as the 12-lead grid.

---

## 2026-07-30 — Full cross-chat / PR consolidation

**Completed:**

- Re-consolidated **all chat-window agents and open PRs** into `cursor/consolidate-latest-cb9c` as the single latest application tip
- Merged realistic ECG morphology fixes from **#13** (staircase resampling, sequential P/QRS/T wavefronts, clinical lead axes → V1 rS / II upright / aVR negative)
- Retained EP laboratory UI (**#12**), electrical vector → body-surface → lead → ECG pipeline (**#11**), AI Project Control Center docs (**#9**), and V3 adult thorax proportion tuning
- Documented the chat → PR → disposition map below so future agents do not re-merge superseded branches

### Chat windows → PR disposition

| Chat / agent | Branch / PR | Disposition in this tip |
|--------------|-------------|-------------------------|
| Cardiac electrical vectors | #11 vector pipeline · #12 EP lab UI · **#13 morphology** | **Included** (latest tip = #13 + docs + V3 tune) |
| AI project control center | #9 `/docs` Control Center | **Included** |
| Ecg stimulator technical audit | #6 architecture · #7 core types · #8 anatomy · #10 conduction+cube | **#6/#8/#10 on main**; #7 types already on main / this tip |
| 心电图心脏3D模型 | #5 V3 torso / GLB / contour | **Superseded** by #8/#10 + V3 tune here |
| 线下代码库存储 | #4 offline + early 3D + bilingual | **Superseded** (offline pack / old UI not carried) |
| Canvas 设计 UI | #3 Desktop live ECG preview | **Superseded** by #11–#13 pipeline |
| Live / setup ECG drafts | #1 · #2 | **Superseded** |
| Cardiac model visibility audit | (no PR; read-only) | Findings fixed in **#10** (orientation cube render priority) |
| Wide 代码库概览 | (no PR) | Advisory only — consolidate-via-pick applied here |
| Cardiac electrophysiology platform | (no PR) | Vision only; delivered via #11–#13 spine |

### Physiological spine now on this tip

```
Cardiac activation → Electrical vector → Body surface Φ → Lead calculation → ECG waveform
```

P ← atrial · QRS ← septal→apical→basal · T ← repolarization (separated wavefronts, clinical axes)

**Modified:**

- Application: `src/vector-engine/*`, `src/ecg-generator/*`, `src/components/lab/*`, `src/components/vector/*`, `src/sim/conductionFromEvents.ts`, V3 torso proportions, lab styles
- Docs: Control Center root + `docs/modules/*` + this consolidation map

**Current limitations:**

- Disease packs / clinical scenario switching not yet wired into the lab UI
- Bilingual (zh/en) chrome from #4/#5 not carried into the lab shell
- Explore / Study / Simulation modes specified in docs but not separate app modes
- GLB heart asset remains opt-in (`HEART_GLB_MODE = 'off'`)
- Older open PRs (#1–#5, #7, #9, #11–#13) should be closed after this consolidation merges to `main`

**Next task:**

- Merge this consolidate branch to `main`, then close superseded PRs; wire disease scenarios into the physiological pipeline and clinical panel

---

## 2026-07-30 — Consolidated latest (EP lab + vector ECG + docs)

**Completed:**

- Consolidated open chat/PR work into one latest application build
- Merged EP laboratory UI redesign (#12) including electrical vector engine and body-surface → lead → ECG pipeline (#11)
- Merged AI Project Control Center documentation system (#9)
- Ported post-merge V3 adult thorax proportion fixes from conduction-viz (body `BODY_SCALE` independent of mediastinal heart scale)
- Supersedes older draft ECG/UI PRs (#1–#5) whose pipelines were replaced by the vector/body-surface path; core data model types (#7) already present via merged #8/#10

**Modified:**

- Application: `src/components/lab/*`, `src/components/vector/*`, `src/vector-engine/*`, `src/ecg-generator/*`, `src/ep/*`, V3 heart/torso assets, lab styles
- Docs: Control Center root + `docs/modules/*`

**Current limitations:**

- Disease packs / clinical scenario switching not yet wired into the lab UI
- Bilingual (zh/en) UI from earlier branches not carried forward into the lab chrome
- Explore / Study / Simulation modes specified in docs but not implemented as separate modes
- GLB heart asset remains opt-in (`HEART_GLB_MODE = 'off'`)

**Next task:**

- Wire disease scenarios into the physiological pipeline and clinical panel; consider restoring bilingual chrome

---

## 2026-07-30

**Completed:**

- Established AI Project Control Center under `/docs`
- Created root memory documents: vision, product requirements, architecture, development rules, medical model, roadmap, changelog
- Created module memory files for heart anatomy, electrophysiology engine, vector engine, ECG generator, clinical engine, and UI system
- Preserved prior concept docs: `product-requirement-document.md`, `software-architecture-design.md`

**Modified:**

- `/docs` tree (new structured Control Center files + `modules/`)

**Current limitations:**

- No application source code in the repository yet
- Architecture and medical model are design baselines only
- User modes (Explore / Study / Simulation) are specified but not implemented
- Disease packs and runtime contracts exist on paper only

**Next task:**

- Begin **Phase 1 — Foundation**: choose/confirm implementation stack, define typed public contracts for anatomy → EP → vector → ECG → clinical, and scaffold module package boundaries without building UI features yet

---

## Entry Template (copy for future sessions)

```
## YYYY-MM-DD

**Completed:**

- …

**Modified:**

- …

**Current limitations:**

- …

**Next task:**

- …
```
