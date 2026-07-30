# Module: Clinical Interpretation Engine

**Package intent:** clinical layer + `disease-packs` (future)  
**Layer:** Clinical / education (above ECG Generator; drives control plane downward)  
**Related:** [`../PRODUCT_REQUIREMENTS.md`](../PRODUCT_REQUIREMENTS.md), [`ecg-generator.md`](./ecg-generator.md)

---

## Purpose

Give physiological streams **clinical and educational meaning**: scenarios, parameters, findings, explanations, and (later) cases/tutor feedback. This module steers the patient model; it does not paint voltages.

---

## Responsibilities

- Scenario catalog (normal, STEMI, AF, AV block, electrolytes, …)
- Parameter schemas and validation for learner controls
- Disease packs: map params → EP/tissue (and rare vector) modifiers
- Derive findings and risk flags from model snapshots (e.g. “ST↑ V1–V4”)
- Mechanism learning content (what / why / ECG / bedside), including i18n ownership
- Case mode tasks and scoring hooks (Simulation Mode)
- Future AI tutor consumes `ClinicalSnapshot` + findings — not raw ring buffers
- Sync selection intents (lead ↔ electrode ↔ wall) as commands to viz

---

## Current Status

**Not implemented.** Product requirements define Explore / Study / Simulation modes; disease pack pattern is designed in architecture docs only.

---

## Future Requirements

- `DiseaseRegistry.register(pack)` auto-updates catalog
- STEMI, AF, AV block as first Phase 5 packs
- Simulation Mode: virtual patient brief → interpret → decide → debrief
- Never write millivolts; only `SimulationCommand` + modifiers
- Keep Gaussian/dipole constants out of this layer

---

## Dependencies

| Depends on | Why |
|------------|-----|
| ECG Generator | EcgStream, annotations |
| EP / Vector / Anatomy public APIs | Snapshots, modifiers targets, sync metadata |
| Disease packs | Scenario physics mapping + copy |

| Consumed by | Why |
|-------------|-----|
| UI System | Panels, cases, explanations, mode shells |

---

## Known Limitations

- No runtime clinical engine or packs yet
- AI tutor and full virtual hospital are post–Phase 5
- Finding derivation quality depends on upstream model fidelity
- Must not import or re-implement lead-axis math
