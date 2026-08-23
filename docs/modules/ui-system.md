# Module: UI System

**Package intent:** `simulator-web` app + visualization adapters (future)  
**Layer:** User Interface + Visualization Engine  
**Related:** [`../PRODUCT_REQUIREMENTS.md`](../PRODUCT_REQUIREMENTS.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md)

---

## Purpose

Present the laboratory to learners and capture their intent. The UI System renders anatomy, activation, ECG monitors, controls, and educational surfaces — without owning medical simulation truth.

---

## Responsibilities

- Application shell and navigation across **Explore**, **Study**, and **Simulation** modes
- Visualization adapters: 3D/interactive anatomy, activation overlays, ECG grid/monitor/strip views
- Control panels bound to clinical parameter schemas
- Explanation panels and case UI
- Selection sync display (lead ↔ structure ↔ territory highlights)
- Accessibility, layout, and i18n rendering (copy sourced from clinical layer)
- Wire user actions to `SimulationCommand` / mode changes only

---

## Current Status

**Not implemented.** No frontend application code in the repository. Visualization technology candidates from early PRD notes include React, TypeScript, Three.js/WebGL, D3 — final stack to be confirmed in Phase 1.

---

## Future Requirements

- Strict separation: no conduction timing constants, dipole math, or disease voltage cheats in components
- Views consume streams (`EcgStream`, ActivationMap overlays, anatomy assets)
- Explore Mode first vertical with Phase 2 anatomy; Study Mode deepens with Phase 4 ECG; Simulation Mode with Phase 5 cases
- Prefer headless-tested engines behind thin adapters
- Avoid duplicate “demo ECG” widgets that bypass the vector → generator pipeline

---

## Dependencies

| Depends on | Why |
|------------|-----|
| Heart Anatomy Module | Meshes, pins, labels |
| Clinical Interpretation Engine | Scenarios, copy, commands, findings |
| ECG Generator streams | Monitor/strip data |
| EP ActivationMap (optional) | Activation visualization |

| Must not depend on | Why |
|--------------------|-----|
| Internal EP/Vector math modules | Prevents UI–physics entanglement |

---

## Known Limitations

- No UI codebase yet
- Design system and visual language not established
- Mode UX flows are requirements-level only
- Risk of AI sessions putting simulation logic in components — blocked by [`../DEVELOPMENT_RULES.md`](../DEVELOPMENT_RULES.md) Rule 5
