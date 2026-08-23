# Module: ECG Generator

**Package intent:** `ecg-generator` (future)  
**Layer:** Simulation Engine (sampling / clinical ECG products)  
**Related:** [`vector-engine.md`](./vector-engine.md), [`clinical-engine.md`](./clinical-engine.md)

---

## Purpose

Turn continuous lead voltages into clinical ECG products learners recognize: sampled 12-lead streams, monitor/strip presentations data, annotations, and calibration conventions.

---

## Responsibilities

- Temporal sampling at fixed `fs` (e.g. 250–500 Hz), live and batch
- Assemble standard 12 leads (I–III, aVR–aVF, V1–V6)
- Provide data for display modes: cascade monitor, paper strip, rhythm strip
- Annotations: P/QRS/T fiducials, RR, measured HR (from EP timing contracts where available)
- Calibration conventions: 25 mm/s, 10 mm/mV
- Optional display realism: baseline wander, muscle tremor (presentation noise only)

---

## Current Status

**Not implemented.** Specified as a pure sampling/assembly layer that must not decide disease morphology.

---

## Future Requirements

- Strict rule: no `if (disease === …)` millivolt adjustments
- Split engine (sampling) from view (Canvas/SVG/WebGL monitors) — views live in UI System
- Headless dump of `.ecg.json` / fixtures for golden tests
- Normal sinus demonstrator for Phase 4 exit criteria
- Worker/off-main-thread option if browser performance requires it

---

## Dependencies

| Depends on | Why |
|------------|-----|
| Electrical Vector Engine | Instantaneous field / lead voltages |
| EP annotations (contract) | Fiducial timing when provided |

| Consumed by | Why |
|-------------|-----|
| Clinical Engine | EcgStream + measured metrics |
| UI System | Monitor/strip rendering |

---

## Known Limitations

- No runtime generator yet
- Early morphology quality will inherit vector-engine approximations
- Artifact models are cosmetic and must not be mistaken for physiology
- Must not contain STEMI territory logic or K⁺ decision trees
