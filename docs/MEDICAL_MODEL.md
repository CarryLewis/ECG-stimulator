# Medical Model

**Document role:** Scientific requirements that guide simulation logic  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`modules/electrophysiology-engine.md`](./modules/electrophysiology-engine.md), [`modules/vector-engine.md`](./modules/vector-engine.md)  
**Status:** Teaching-grade physiology baseline (not a research-grade whole-heart solver)

---

This document defines the medical truths the simulator must respect. Implementation may approximate magnitudes, but it must not invert causal order or invent lead voltages that contradict this model.

---

## 1. Normal Cardiac Electrophysiology — Overview

In sinus rhythm, depolarization begins in the sinoatrial (SA) node, spreads through atrial myocardium, delays in the atrioventricular (AV) node, then propagates rapidly through the His–Purkinje system to activate the ventricular myocardium in a coordinated sequence. Repolarization follows, restoring excitability for the next cycle.

Educational mapping to the ECG (normal):

| ECG feature | Primary physiological basis |
|-------------|----------------------------|
| P wave | Atrial depolarization |
| PR interval | Atrial conduction + AV nodal delay (+ His onset) |
| QRS complex | Ventricular depolarization (His–Purkinje → myocardium) |
| ST segment | Early ventricular repolarization plateau (normally isoelectric) |
| T wave | Ventricular repolarization |

---

## 2. Conduction System Components

### 2.1 SA node

- Primary pacemaker under normal autonomic conditions.
- Initiates atrial activation; rate sets sinus heart rate.
- Simulation requirement: automaticity parameter; suppression or competition with escape foci when modeled.

### 2.2 Atrial myocardium / internodal spread

- Activation propagates from SA region across right then left atrium (teaching simplification allowed if labeled).
- Produces the P wave vector sequence.
- Simulation requirement: atrial activation map distinct from ventricular activation.

### 2.3 AV node

- Introduces physiologic delay (major contributor to PR).
- Protects ventricles from excessively rapid atrial rates.
- Site of graded block (1°, 2°, 3°) in pathology modules.
- Simulation requirement: configurable delay and block modes; must support dissociation when complete block is active.

### 2.4 Bundle of His

- Continues conduction from AV node into the branching bundle system.
- Teaching model may treat His as a graph node with delay and failure modes.
- Simulation requirement: part of the ventricular input pathway; block at or below His affects QRS timing/origin.

### 2.5 Bundle branches

- Right and left bundle branches distribute activation to respective ventricles.
- Left bundle conceptually fans to fascicles in more detailed models (optional later).
- Simulation requirement: branch timing asymmetry allowed; bundle branch block scenarios alter QRS duration and vector direction.

### 2.6 Purkinje fibers

- Rapid endocardial network that enables near-synchronous myocardial activation.
- Failure or bypass changes QRS width and morphology.
- Simulation requirement: ventricular myocardium activates from Purkinje-coupled regions in normal rhythm; escape rhythms may originate lower with wider QRS.

---

## 3. Normal Activation Sequence (Required Order)

```
SA node
  → Atrial myocardium (P wave forming)
  → AV node (delay)
  → Bundle of His
  → Bundle branches
  → Purkinje fibers
  → Ventricular myocardium (QRS)
  → Ventricular repolarization (T)
```

Agents must not generate a normal QRS that is causally independent of this pathway unless an explicit escape/abnormal origin is active in the scenario.

---

## 4. Core Causal Chain for ECG Synthesis

All waveform generation must follow:

```
Electrical activation
        ↓
Vector formation
        ↓
Body surface potential
        ↓
ECG waveform
```

| Stage | Meaning for the simulator |
|-------|---------------------------|
| **Electrical activation** | Which regions are depolarizing/repolarizing at time `t` (`ActivationMap` + tissue modifiers). |
| **Vector formation** | Net cardiac dipole / field from spatial activation (and injury currents when present). |
| **Body surface potential** | Projection of the field onto lead axes defined by electrode geometry (Einthoven/Goldberger/precordial teaching model). |
| **ECG waveform** | Sampled lead voltages over time, displayed with clinical conventions (speed/gain). |

**Forbidden shortcut:** Setting lead millivolts from disease name alone without passing through activation → vector → projection.

---

## 5. Tissue and Pathology Modifiers (Guidance)

These do not replace dedicated disease docs; they constrain how packs may touch the model.

| Modifier | Physiologic idea | Preferentially applied at |
|----------|------------------|---------------------------|
| Ischemia / injury | Local membrane/metabolic dysfunction → injury current, conduction slowing | EP tissue state + vector injury contribution |
| Electrolyte (e.g. K⁺) | Resting potential / conduction / repolarization changes | EP scales + vector repolarization morphology |
| Rate / autonomic | Pacemaker rate, AV conduction tone | EP automaticity & AV delay |
| Conduction block | Failed or delayed AV/His–Purkinje transmission | EP graph rules |
| AF | Loss of organized atrial wavefront; irregular AV input | EP atrial mode + RR schedule |

ST deviation in STEMI teaching must be explained as injury-current / vector effect observable in facing leads — not as a UI overlay.

---

## 6. Lead and Territory Teaching Constraints

- Each standard lead has a teaching “view” of myocardial walls/territories.
- Anterior / septal / inferior / lateral territories (and later coronary maps) must stay consistent between anatomy highlights and expected STEMI lead patterns.
- Reciprocal changes should be representable when injury vectors are active.

---

## 7. Fidelity Policy

- **Required:** Correct causal order, plausible timing order, educationally honest lead–anatomy relationships.
- **Allowed:** Simplified magnitudes, Gaussian or envelope approximations early on, lumped territories, discrete region graphs instead of continuum PDE solvers.
- **Not allowed:** Contradicting the activation → vector → surface potential → ECG chain; silent disease-specific voltage cheats; claiming device-grade diagnostic accuracy.

When simplifying, document the simplification in the relevant module file and CHANGELOG.

---

## 8. How Simulation Engines Should Use This Document

1. EP engine implements timing and activation consistent with §2–§3.
2. Vector engine implements §4 vector formation and injury/repolarization contributions.
3. ECG generator only samples projected potentials (§4 last stages).
4. Clinical engine explains findings using the same chain students are taught.

If code and this document disagree, treat this document as the scientific requirement and fix code or explicitly revise this model with a documented decision.
