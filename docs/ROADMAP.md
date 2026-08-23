# Roadmap

**Document role:** Development stages and sequencing for AI agents  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`PRODUCT_REQUIREMENTS.md`](./PRODUCT_REQUIREMENTS.md), [`CHANGELOG.md`](./CHANGELOG.md)  
**Status:** Phase 0 complete (Control Center docs); Phase 1 next

---

Progress through phases in order unless a documented exception is approved. Do not jump to clinical disease packs before the physiology → vector → ECG spine exists.

---

## Phase 0 — Project Control Center *(current baseline)*

- [x] Establish `/docs` AI knowledge system
- [x] Capture vision, requirements, architecture, medical model, rules, roadmap
- [x] Define module memory files

**Exit criteria:** Future agents can onboard from `/docs` without prior chat context.

---

## Phase 1 — Foundation

**Goal:** Architecture and data model ready for implementation.

- Finalize public contracts: RegionId, ConductionGraph, ActivationMap, TissueState, InstantaneousField, LeadVoltages, SimulationCommand, DiseasePack shape
- Repository/package layout aligned with module boundaries
- Shared simulation clock concept
- Headless test harness skeleton (no UI required)
- CHANGELOG discipline in active use

**Exit criteria:** Typed (or clearly specified) contracts exist; empty or stub modules compile/link in chosen stack; one golden “identity” test path documented.

---

## Phase 2 — Heart Visualization

**Goal:** Learners can see cardiac structure in space.

- 3D (or equivalent interactive) anatomy presentation
- Cardiac structures: chambers, key vessels as needed for teaching
- Conduction system landmarks and myocardial territories
- Electrode / lead educational overlays
- Selection sync hooks for later EP/ECG highlighting

**Exit criteria:** Explore Mode anatomy navigation works against the Anatomy module — still without requiring full ECG pathology.

---

## Phase 3 — Electrical Simulation

**Goal:** Time-evolving conduction and activation.

- Conduction system graph operational (SA → AV → His → branches → Purkinje → myocardium)
- Activation wave / region activation map over time
- Basic rate, pause, and time-scale controls
- Refractory / simple block hooks
- Visualization of activation on anatomy

**Exit criteria:** Headless EP step produces ActivationMap; Explore/Study can show activation without disease packs.

---

## Phase 4 — ECG Generation

**Goal:** Body-surface ECG from the model chain.

- Electrical vector / dipole (v1) from activation
- Lead axis projection (12-lead)
- Sampling, calibration conventions, monitor/strip views
- Annotations (P/QRS/T timing hooks as available)
- Normal sinus ECG demonstrably produced via activation → vector → leads

**Exit criteria:** Normal 12-lead stream generated without disease-name voltage cheats; Study Mode can teach mechanism on normal rhythm.

---

## Phase 5 — Clinical Simulation

**Goal:** Clinical reasoning scenarios on top of the spine.

- STEMI (territory + severity → injury current → lead pattern)
- Atrial fibrillation
- AV block
- Mechanism explanations + derived findings
- Simulation Mode case loop (interpret → reason → debrief); AI tutor later

**Exit criteria:** At least STEMI, AF, and AV block as disease packs; Simulation Mode usable for teaching cases; findings derived from model state.

---

## Beyond Phase 5 (Backlog)

Not scheduled until Phase 5 exit:

- Electrolyte packs (hyper/hypokalemia) as first-class scenarios
- Evolving MI stages, bundle branch block library
- Broader organ-system simulations
- Virtual hospital workflow
- Full AI medical tutor ecosystem

Track these in CHANGELOG “Next task” only when prior phase exit criteria are met.

---

## Phase Dependency Diagram

```
Phase 1 Foundation
      ↓
Phase 2 Heart visualization
      ↓
Phase 3 Electrical simulation
      ↓
Phase 4 ECG generation
      ↓
Phase 5 Clinical simulation
```

Visualization (Phase 2) may iterate in parallel with early Phase 3 stubs **only if** anatomy contracts remain stable and no duplicate ECG path is introduced.
