# Module: Electrophysiology Engine

**Package intent:** `ep-engine` (future)  
**Layer:** Simulation Engine (physiology dynamics)  
**Related:** [`../MEDICAL_MODEL.md`](../MEDICAL_MODEL.md), [`heart-anatomy.md`](./heart-anatomy.md)

---

## Purpose

Simulate time-evolving electrical behavior of cardiac tissue: *when* and *whether* regions activate. This is the core simulator for automaticity, conduction, block, and tissue modifiers.

---

## Responsibilities

- Pacemaker automaticity (SA rate, escape foci, AF wavelet generators as packs require)
- Conduction delays (intra-atrial, AV/PR, His–Purkinje timing)
- Activation sequence consistent with MEDICAL_MODEL (SA → atria → AV → His → branches → Purkinje → myocardium)
- Block and dissociation rules (failed AV conduction, independent clocks)
- Refractory behavior and QRS/P width proxies under modifiers
- Tissue modifiers: ischemia severity, electrolytes, local conduction velocity, APD scales
- Emit `ActivationMap(t)` + `TissueState` per anatomical region/territory

---

## Current Status

**Not implemented.** Design baseline only. Target generalization of future `conduction` / rhythm planning code into a real state machine (not only waveform envelopes).

---

## Future Requirements

- Deterministic stepping under a shared simulation clock
- Seeded irregular RR schedules for AF (reproducible tests)
- Disease packs apply `EpModifiers` here — not in the ECG generator
- Headless unit tests for normal sequence, 1°/3° AV block hooks, ischemia tissue flags
- Visualization of activation map for Explore/Study modes

---

## Dependencies

| Depends on | Why |
|------------|-----|
| Heart Anatomy Module | Region IDs, conduction graph topology |
| Clinical Engine (control plane) | Simulation commands / disease modifiers |
| Simulation clock | Shared time `t` |

| Consumed by | Why |
|-------------|-----|
| Electrical Vector Engine | Activation + tissue state |
| UI System (read-only viz) | Optional activation overlays |
| Clinical Engine | Snapshots for teaching sync |

---

## Known Limitations

- No runtime EP engine yet
- Continuum PDE / cellular ionic models are out of initial scope; region-graph approximations are expected
- 2° AV block patterns and detailed fascicular blocks are later EP rules
- Must never project onto leads or own Canvas ECG drawing
