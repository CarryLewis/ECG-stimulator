# Architecture

**Document role:** High-level software architecture for AI agents and implementers  
**Status:** Design baseline (not yet implemented in application code)  
**Related:** [`PROJECT_VISION.md`](./PROJECT_VISION.md), [`MEDICAL_MODEL.md`](./MEDICAL_MODEL.md), [`modules/`](./modules/)  
**Prior art:** [`software-architecture-design.md`](./software-architecture-design.md)

---

## 1. Layered Stack

```
User Interface
        ↓
Visualization Engine
        ↓
Simulation Engine
        ↓
Physiology Model
```

| Layer | Role |
|-------|------|
| **User Interface** | Modes (Explore / Study / Simulation), controls, explanations, cases, i18n |
| **Visualization Engine** | 3D anatomy rendering, ECG monitor/strip presentation, selection highlights |
| **Simulation Engine** | Clock, EP stepping, vector evaluation, ECG sampling, disease modifier application |
| **Physiology Model** | Anatomy topology, conduction graph, tissue/region state definitions, medical constraints |

**Design principle:** Each layer speaks to its neighbors through explicit contracts. Disease packs inject parameters at electrophysiology and/or clinical meaning layers — they never rewrite ECG drawing code or lead axes by hand.

Signals flow **upward** (physiology → observation). Commands and modifiers flow **downward** (learner/scenario → physiology). UI never writes millivolts directly.

---

## 2. Module Map

Within the Simulation Engine and Physiology Model, five core domain modules form the teaching spine:

```
Heart Anatomy
      ↓
Electrophysiology Engine
      ↓
Electrical Vector Engine
      ↓
ECG Generator
      ↓
Clinical Interpretation Engine
```

Presentation (UI + Visualization) consumes anatomy assets and ECG/clinical streams; it must not own conduction timing constants or lead-axis mathematics.

Detailed per-module memory lives under [`docs/modules/`](./modules/).

---

## 3. Module Contracts

### 3.1 Heart Anatomy Module

| | |
|--|--|
| **Responsibility** | Spatial and topological truth of the heart and teaching body context: chambers, conduction tree, myocardial territories, electrode sites, lead educational metadata, visualization assets. |
| **Input** | Versioned anatomy definitions / assets (static or lightly dynamic geometry). |
| **Output** | Region IDs, conduction graph (nodes/edges + nominal delays), territory IDs, electrode positions, lead-facing metadata, meshes/pins for viz. |
| **Dependencies** | None on EP, vector, ECG, or UI logic. May use shared math utilities only. |
| **Must not** | Compute action potentials, rates, or millivolts. |

---

### 3.2 Electrophysiology Engine

| | |
|--|--|
| **Responsibility** | Time-evolving electrical behavior: automaticity, conduction delays, activation sequence, block/dissociation, refractory/width proxies, tissue modifiers (ischemia, electrolytes, velocity). |
| **Input** | Anatomy region/graph IDs; simulation clock; disease/EP modifiers from clinical control plane. |
| **Output** | `ActivationMap(t)` and `TissueState` per region/territory (activation/recovery intensity, conduction flags, ischemia/K⁺ scales, etc.). |
| **Dependencies** | Heart Anatomy Module (types and graph only). |
| **Must not** | Project onto leads or draw ECG paper. |

---

### 3.3 Electrical Vector Engine

| | |
|--|--|
| **Responsibility** | Convert spatial activation and tissue state into instantaneous electrical field / cardiac vector(s); apply injury-current and electrolyte vector effects; define lead axes and projections. |
| **Input** | Activation map + tissue state; anatomy lead axes and territory directions. |
| **Output** | Instantaneous field / dipole (and later multipole or BSPM-ready forms); lead voltages as projections; contributions needed for ST/T morphology. |
| **Dependencies** | Heart Anatomy Module (axes/territories); Electrophysiology Engine outputs. |
| **Must not** | Own disease narrative copy or Canvas/monitor widgets. |

---

### 3.4 ECG Generator

| | |
|--|--|
| **Responsibility** | Sample continuous lead voltages into clinical ECG products: fixed sampling rate, 12-lead assembly, monitor/strip modes, fiducial annotations, calibration conventions; optional display noise. |
| **Input** | Vector-engine field/lead voltages over time; annotations hooks from EP timing where applicable. |
| **Output** | ECG streams/buffers per lead, measured HR/intervals, display-ready series + annotations. |
| **Dependencies** | Electrical Vector Engine (and timing annotations as contracted). |
| **Must not** | Decide STEMI territory or K⁺ effects; never hard-code “if disease X then lead Y += c.” |

---

### 3.5 Clinical Interpretation Engine

| | |
|--|--|
| **Responsibility** | Educational and clinical meaning: scenario catalog, parameter schemas, derived findings, risk flags, mechanism explanations, case/tutor surfaces; maps user params → EP/tissue (and rare vector) modifiers via disease packs. |
| **Input** | Learner commands; ECG streams + annotations; activation/tissue snapshots as needed for teaching sync. |
| **Output** | Simulation commands / modifiers downward; clinical snapshots, findings, learning content upward to UI. |
| **Dependencies** | Public APIs of anatomy, EP, vector, and ECG modules; disease pack registry. |
| **Must not** | Embed Gaussian timing constants, lead-axis math, or direct millivolt painting. |

---

## 4. End-to-End Tick (Conceptual)

```
t → t+Δt
  Clinical params (stable)
       ↓
  EP Engine.step → ActivationMap + TissueState
       ↓
  Vector Engine.evaluate → field / lead mV
       ↓
  ECG Generator.sample → 12-lead stream + annotations
       ↓
  Clinical engine + UI / Visualization consume streams
```

A shared simulation clock is a platform concern; all engines read the same `t`.

---

## 5. Disease Packs

Diseases are **packs**, not forks of the ECG generator:

- Parameter schema for UI
- Map params → EP/tissue modifiers (primary)
- Optional named vector contributions when scientifically required
- Derive findings + explanation content for the clinical layer

Registration updates the scenario catalog. Adding STEMI, AF, AV block, or electrolyte disorders must not require editing monitor drawing code.

---

## 6. Independence Rules

1. EP + Vector + ECG must be runnable **headless** (tests/CLI) without DOM.
2. Anatomy is versioned separately from rendering assets.
3. One-way signal flow upward; downward path is commands/modifiers only.
4. UI and Visualization are adapters over public streams — not owners of physiology truth.

Suggested future package boundaries: `anatomy`, `ep-engine`, `vector-engine`, `ecg-generator`, `disease-packs`, plus a simulator web app for clinical + viz.

---

## 7. Current Implementation Reality

As of this Control Center baseline: the repository holds requirements and architecture documentation only. No application runtime modules exist yet. Future agents must treat this document and [`docs/modules/`](./modules/) as the target architecture when coding begins.
