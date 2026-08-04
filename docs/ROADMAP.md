# Roadmap

**Document role:** Development stages and sequencing for AI agents  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`PRODUCT_REQUIREMENTS.md`](./PRODUCT_REQUIREMENTS.md), [`CHANGELOG.md`](./CHANGELOG.md)  
**Status:** Phase 0–5 delivered on consolidate tip (anatomy + conduction + vector/ECG + EP lab UI + disease packs + recording); next is Simulation Mode case loop / recording↔plan voltage unify — see [`CHANGELOG.md`](./CHANGELOG.md)

---

Progress through phases in order unless a documented exception is approved. Do not jump to clinical disease packs before the physiology → vector → ECG spine exists.

---

## Phase 0 — Project Control Center

- [x] Establish `/docs` AI knowledge system
- [x] Capture vision, requirements, architecture, medical model, rules, roadmap
- [x] Define module memory files

**Exit criteria:** Future agents can onboard from `/docs` without prior chat context. ✅

---

## Phase 1 — Foundation

**Goal:** Architecture and data model ready for implementation.

- [x] Public contracts: `docs/core-data-model/*` + runtime `vector-engine` / `ecg-generator` / `ep` modules
- [x] Repository layout aligned with module boundaries (`src/anatomy`, `src/ep`, `src/vector-engine`, `src/ecg-generator`, `src/components/lab`)
- [x] Shared simulation clock (`useSimulationFrame` / event-driven conduction)
- [ ] Headless test harness skeleton (golden identity path)
- [x] CHANGELOG discipline in active use

**Exit criteria:** Typed contracts exist; modules compile in chosen stack. ✅ (tests still thin)

---

## Phase 2 — Heart Visualization

**Goal:** Learners can see cardiac structure in space.

- [x] Interactive 3D anatomy presentation (Src / V1 / V2 / V3)
- [x] Cardiac structures: chambers, vessels as teaching overlays
- [x] Conduction system landmarks and myocardial territories
- [x] Electrode / lead educational overlays (V3 torso + pins)
- [x] Selection sync hooks for EP/ECG highlighting
- [ ] Named Explore Mode as a distinct app shell

**Exit criteria:** Anatomy navigation works against the Anatomy module. ✅

---

## Phase 3 — Electrical Simulation

**Goal:** Time-evolving conduction and activation.

- [x] Conduction system graph (SA → AV → His → branches → Purkinje → myocardium)
- [x] Activation wave / region activation map over time (event-driven)
- [x] Rate, pause, and time-scale controls (lab timeline)
- [ ] Refractory / simple block hooks
- [x] Visualization of activation on anatomy

**Exit criteria:** EP step produces activation; UI can show activation without disease packs. ✅

---

## Phase 4 — ECG Generation

**Goal:** Body-surface ECG from the model chain.

- [x] Electrical vector / dipole from activation
- [x] Lead axis projection (12-lead, clinical Einthoven / precordial)
- [x] Sampling, monitor/strip views (lab ECG + Vec mini-monitor)
- [x] Annotations (P/QRS/T phase badges locked to physiology)
- [x] Normal sinus ECG via activation → vector → leads (morphology fix #13)

**Exit criteria:** Normal 12-lead stream without disease-name voltage cheats. ✅

---

## Phase 5 — Clinical Simulation

**Goal:** Clinical reasoning scenarios on top of the spine.

- [x] STEMI (territory + severity → injury current → lead pattern)
- [x] Atrial fibrillation (+ flutter, VF/flutter packs)
- [x] AV block (1° / Mobitz I–II / 3°)
- [x] Mechanism explanations + derived findings (clinical panel + pathology rail)
- [ ] Simulation Mode case loop (interpret → reason → debrief); AI tutor later

**Exit criteria:** At least STEMI, AF, and AV block as disease packs; Simulation Mode usable for teaching cases; findings derived from model state. ✅ (packs + live ECG); Simulation Mode shell still open

---

## Beyond Phase 5 (Backlog)

Not scheduled until Simulation Mode exit:

- Deeper electrolyte UI scenarios (packs already in library)
- Evolving MI stages as timed case arcs
- Broader organ-system simulations
- Virtual hospital workflow
- Full AI medical tutor ecosystem
- Unify Record-mode sampler with CyclePlan voltages (same dipole as 12-lead grid)

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
