# Disease Architecture

**ECG Stimulator — Disease Simulation Engine**  
**Status:** Implemented (v1 library + contracts)  
**Related:**
- [`software-architecture-design.md`](./software-architecture-design.md)
- [`core-data-model/`](./core-data-model/)
- Source: [`src/disease/`](../src/disease/)

---

## 1. Design principle

A disease **modifies the physiological model**.  
It must **never** hardcode ECG waveforms, lead millivolt templates, or “if disease === X then V2 += 0.4”.

The simulation pipeline is always:

```
Cardiac anatomy
        ↓
Electrophysiology
        ↓
Electrical activation
        ↓
Electrical vector
        ↓
Body surface potential
        ↓
12-lead ECG
        ↓
Clinical interpretation
```

Bottom layers are **physiology truth**.  
Top layers only **observe** and **explain**.

```
Disease
  ↓
Affected tissue
  ↓
Physiological effects
  ↓
Simulation Engine (EP)
  ↓
Electrical propagation
  ↓
ECG output (emergent)
```

---

## 2. Module map

| Path | Role |
|------|------|
| `src/disease/types.ts` | Extensible `DiseaseDefinition` + `PhysiologicalEffects` / `PhysiologicalModel` |
| `src/disease/physiology.ts` | Baseline model + pure `applyPhysiologicalEffects` |
| `src/disease/registry.ts` | Plugin registry / catalog |
| `src/disease/engine.ts` | Resolve disease → model + teaching trace |
| `src/disease/library/*` | First disease packs |
| `src/disease/selfCheck.ts` | Headless invariant checks |

Clinical UI may call `resolveDiseaseSimulation({ diseaseId, params })` and feed `result.model` into the EP engine. The ECG generator must remain disease-id agnostic.

---

## 3. Disease interface

Every disease pack implements `DiseaseDefinition` with seven knowledge blocks plus a runtime adapter:

| # | Field | Purpose |
|---|--------|---------|
| 1 | `affectedAnatomy` | Regions, territories, chambers, coronary supply |
| 2 | `pathophysiology` | Mechanism cascade (why tissue changes) |
| 3 | `electrophysiology` | Automaticity, excitability, AP, ions |
| 4 | `conduction` | Pathways + expected propagation |
| 5 | `electricalVector` | Injury / axis / repolarization vector hints |
| 6 | `ecgManifestations` | **Expected** emergent ECG (teaching / assertions only) |
| 7 | `clinical` | Bedside explanation + urgency |

Runtime:

```ts
apply(params: DiseaseParamValues): PhysiologicalEffects
```

`PhysiologicalEffects` is the **only** control-plane output consumed by simulation.  
`ecgManifestations` is documentation and test expectation — not a waveform source.

### Teaching chain (required for each disease)

```
Affected anatomy
        ↓
Affected conduction pathway
        ↓
Expected electrical propagation
        ↓
Expected ECG morphology
```

Exposed at runtime as `DiseaseSimulationResult.teachingTrace`.

---

## 4. Physiological effects → engines

```
Clinical params
      ↓
DiseaseDefinition.apply()
      ↓
PhysiologicalEffects
      ↓
applyPhysiologicalEffects(baseline)
      ↓
PhysiologicalModel
      ↓
┌─────────────────┬──────────────────┬─────────────────┐
│ EP Engine       │ Vector Engine    │ Clinical Layer  │
│ rates, AV block │ injury current   │ findings text   │
│ atrialMode      │ T/U scales       │ risk flags      │
│ bundle state    │ axis shift       │ tutor content   │
│ ischemia tissue │ QRS duration     │                 │
└─────────────────┴──────────────────┴─────────────────┘
      ↓
Activation → Field → Lead voltages → ECG display
```

### What diseases may change

- Pacemaker rates / hierarchy (SA, escape, VT focus)
- Atrial organisation (`sinus` | `fibrillation` | `flutter` | `standstill`)
- Ventricular drive (`conducted` | `escape` | `tachycardia` | `fibrillation` | `irregular`)
- AV delay / block degree / Wenckebach increment / conduction ratio
- Bundle branch state (LBBB / RBBB)
- Regional ischemia severity (+ reciprocal territories)
- Electrolytes (`potassium_mmol_L`, `calcium_mmol_L`)
- Global scales: conduction velocity, QRS duration, P amplitude, APD / QT, T/U/ST

### What diseases must not change

- Lead axis tables
- Canvas / monitor drawing code
- Hardcoded per-lead ST millivolt tables keyed by disease id
- Gaussian “STEMI template” waveforms

---

## 5. First disease library

| ID | Category | Primary physiology mutation |
|----|----------|----------------------------|
| `normal_sinus_rhythm` | Baseline | Healthy SA–AV–His–Purkinje chain |
| `anterior_stemi` | Cardiovascular | Anterior ischemia → injury current |
| `inferior_stemi` | Cardiovascular | Inferior ischemia → injury current |
| `lateral_stemi` | Cardiovascular | Lateral ischemia → injury current |
| `posterior_mi` | Cardiovascular | Posterior ischemia → reciprocal anterior |
| `lbbb` | Conduction | Left bundle blocked; QRS widens via activation order |
| `rbbb` | Conduction | Right bundle blocked; late rightward forces |
| `first_degree_av_block` | Conduction | Prolonged `avDelay_s` |
| `mobitz_i` | Conduction | `second_type1` + Wenckebach increment |
| `mobitz_ii` | Conduction | `second_type2` + fixed ratio |
| `third_degree_av_block` | Conduction | Complete AV failure + escape clock |
| `atrial_fibrillation` | Arrhythmia | `atrialMode=fibrillation`, irregular RR seed |
| `atrial_flutter` | Arrhythmia | `atrialMode=flutter` + flutter cycle + AV ratio |
| `ventricular_tachycardia` | Arrhythmia | Ventricular focus / wide myocardial activation |
| `ventricular_fibrillation` | Arrhythmia | Chaotic ventricular mode (arrest) |
| `hyperkalemia` | Electrolyte | [K⁺] → peaked T, slow conduction, flat P |
| `hypokalemia` | Electrolyte | [K⁺] → flat T, U wave, long APD |
| `hypercalcemia` | Electrolyte | [Ca²⁺] → short APD / QT |
| `hypocalcemia` | Electrolyte | [Ca²⁺] → long APD / QT |

### Example: Anterior STEMI (physiology path)

```
LAD territory (lv_anterior / septum / apex)
        ↓
Occlusion % → ischemia.anterior severity
        ↓
Tissue injury current enabled (vector stage)
        ↓
ST elevation in anterior-facing leads (emergent)
        ↓
Clinical: time-critical reperfusion teaching
```

### Example: Hyperkalemia (physiology path)

```
Global membrane ([K⁺] mmol/L)
        ↓
Partial depolarization / Na⁺ inactivation proxies
        ↓
↑T amplitude scale, ↓T width, ↑QRS duration, ↓P amplitude, ↑AV delay
        ↓
Peaked T / wide QRS / flat P emerge from vector + timing
```

---

## 6. Extensibility checklist

To add a disease:

1. Create `src/disease/library/<name>.ts` implementing `DiseaseDefinition`.
2. Fill all seven knowledge blocks + `apply()`.
3. Register in `DISEASE_LIBRARY` (`library/index.ts`).
4. Prefer existing `PhysiologicalEffects` fields; extend the type only when EP/vector engines gain new capabilities.
5. If new anatomy is required (e.g. accessory pathway), extend `RegionId` / conduction graph — not the ECG drawer.
6. Add a self-check assertion that the disease does not list `twelve_lead_ecg` as a primary mutation stage.
7. (Later) Add golden EP→ECG fixtures once the full physiological sampler is wired.

---

## 7. Integration with the layered stack

Aligned with the platform architecture:

| Layer | Disease interaction |
|-------|---------------------|
| Heart Anatomy Model | Provides region / territory IDs referenced by packs |
| Cardiac EP Engine | Consumes `PhysiologicalModel` (rates, block, modes, bundles) |
| Electrical Vector Engine | Reads ischemia + repolarization scales + axis |
| ECG Generator | Samples field only — **no disease switch** |
| Clinical Layer | Catalog, params UI, `teachingTrace`, explanations |

`docs/core-data-model/clinical.ts` `EpModifiers` / `DiseasePackDescriptor` remain the shared TypeScript contracts for cross-package alignment.

---

## 8. Invariants (enforced in `selfCheck.ts`)

1. All first-library IDs are registered.
2. `assertPhysiologyDriven(disease)` — ECG is never a primary mutation stage.
3. STEMI packs enable `injuryCurrentEnabled` and regional ischemia.
4. Electrolyte packs write ion concentrations onto the model and scale repolarization / conduction.
5. AF sets `atrialMode = fibrillation` and suppresses P amplitude.
6. Complete heart block sets dual clocks (`avBlock = third`, escape ventricular rate).
7. Bundle branch blocks change bundle state + QRS duration scale — not a pasted morphology bitmap.

---

## 9. What “complete” means for v1 vs later

**v1 (this delivery):**  
Architecture, extensible interface, registry/engine, and a full **disease library of physiological modifiers** with teaching metadata for all listed conditions.

**Later (EP engine work):**  
Full Wenckebach counters, AF RR stochastic schedules, flutter F-wave vectors, VT exit-site axes, and VF wavelet synthesis must live in the EP/vector engines — already parameterized by these packs.

The disease layer is intentionally ahead of (and independent from) every EP detail so packs do not collapse into ECG templates while the sampler matures.

---

## 10. Summary

- **Diseases are plugins** that emit `PhysiologicalEffects`.
- **Physiology is the source of truth.**
- **ECG is an observation** of activation → vector → leads.
- **Clinical text explains** the same chain learners should reason through.

That separation is what makes the ECG Stimulator a simulation platform rather than a waveform slideshow.
