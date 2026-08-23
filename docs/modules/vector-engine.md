# Module: Electrical Vector Engine

**Package intent:** `vector-engine` (future)  
**Layer:** Simulation Engine (field / projection)  
**Related:** [`../MEDICAL_MODEL.md`](../MEDICAL_MODEL.md), [`electrophysiology-engine.md`](./electrophysiology-engine.md)

---

## Purpose

Convert myocardial activation in space into an electrical field / cardiac vector(s), then project onto lead axes — the bridge from activation maps to body-surface potentials.

---

## Responsibilities

- Wavefront → vector contributions (atrial, septal, apical/basal ventricular, repolarization)
- Injury current contributions from ischemic territories (STEMI teaching)
- Electrolyte-related vector/morphology proxies (T amplitude/width, U wave, global ST proxies)
- Lead axis definitions (Einthoven, Goldberger, precordial unit vectors)
- Projection \(V_{lead} = \mathbf{D} \cdot \mathbf{a}_{lead}\) (v1); design for later multipole / BSPM readiness
- Emit instantaneous field and/or lead voltages for the ECG generator

---

## Current Status

**Not implemented.** Architecture specifies dipole v1 with territory injury vectors; no code yet.

---

## Future Requirements

- Consume only ActivationMap + TissueState + anatomy axes (no disease essays)
- Named vector contributions extensible for new patterns (e.g. future Brugada-like packs) without Canvas changes
- Golden tests: anterior injury → relative ST elevation in facing precordial leads
- Reciprocal territory handling for STEMI teaching
- Keep UI-agnostic and headless-testable

---

## Dependencies

| Depends on | Why |
|------------|-----|
| Heart Anatomy Module | Lead axes, territory direction vectors |
| Electrophysiology Engine | ActivationMap, TissueState |

| Consumed by | Why |
|-------------|-----|
| ECG Generator | Field / lead mV over time |
| Clinical Engine (optional) | Teaching diagrams of vectors |

---

## Known Limitations

- No runtime vector engine yet
- Single dipole is an educational approximation, not full body-surface potential mapping
- Injury current and electrolyte effects will start as parameterized contributions, not biophysically complete models
- Must not own disease narrative text or monitor widgets
