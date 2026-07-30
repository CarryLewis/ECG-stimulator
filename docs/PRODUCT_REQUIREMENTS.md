# Product Requirements

**Document role:** Define what the product must achieve for learners  
**Related:** [`PROJECT_VISION.md`](./PROJECT_VISION.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
**Status:** Requirements baseline (concept phase)

---

## 1. User Problems

### Problem A — Outcomes without mechanisms

Students often learn final clinical findings (e.g. ST elevation, chest pain) without experiencing the chain from coronary insult → tissue and membrane change → conduction/activation change → ECG → bedside meaning.

### Problem B — ECG as abstract pattern matching

ECG education frequently relies on static images and memorization. Learners struggle to connect waveforms to cardiac anatomy, conduction timing, lead geometry, and disease evolution.

### Problem C — Unsafe or scarce practice for clinical reasoning

Students need a place to interpret, hypothesize, and decide without patient risk — especially for time-critical patterns such as STEMI or dangerous electrolyte effects.

---

## 2. Learning Objectives

After meaningful use of the product, a clinical medical student should be able to:

1. Describe the spatial relationship between cardiac chambers, conduction structures, and ECG lead “views.”
2. Explain normal activation sequence (SA → atria → AV → His–Purkinje → ventricles) and how timing produces P, PR, QRS, and T.
3. Relate myocardial activation and injury currents to electrical vectors and lead voltages.
4. Predict how parameter changes (rate, block, ischemia territory/severity, electrolytes) alter the 12-lead ECG.
5. Interpret selected abnormal ECGs with mechanistic language, not only label matching.
6. Practice structured clinical reasoning on simulated cases (diagnosis hypotheses, urgency, next steps) in Simulation Mode.

---

## 3. Core Features

| Feature | Requirement |
|---------|-------------|
| Interactive anatomy | Explore chambers, conduction tree, territories, and electrode/lead context |
| Electrophysiology simulation | Time-evolving conduction, activation, refractory/block behavior under modifiers |
| Vector / field model | Convert activation and tissue state into electrical field / cardiac vectors |
| 12-lead ECG generation | Produce clinically readable lead voltages, strips/monitor views, basic annotations |
| Disease / scenario control | Parameterized scenarios (normal + cardiovascular teaching set) |
| Mechanism explanation | Always expose what changed → why → how it appears on ECG / clinically |
| Clinical case layer (progressive) | Virtual-patient tasks for interpretation and decision practice |
| AI tutor (future) | Explain from clinical/physiology snapshots, not from ad-hoc waveform hacks |

Diseases change physiology (and sometimes vector contributions). The ECG generator and UI observe; they do not hard-code millivolt cheats per disease name.

---

## 4. Interaction Principles

1. **One causal chain** — UI and teaching copy reinforce Anatomy → Conduction → Activation → Vectors → ECG → Clinical meaning.
2. **Steer physiology, observe ECG** — Learners adjust parameters; waveforms follow from the model.
3. **Mechanism before memorization** — Every scenario includes an explanation path (what / why / ECG / bedside).
4. **Simulator feel** — Active control and observation, comparable in spirit to a flight or physiology lab simulator — not a passive slideshow.
5. **Separation of concerns** — Medical simulation logic is never trapped inside presentation widgets.
6. **Safe practice** — Simulation and case modes support exploration and error without implying real-patient diagnostic certification.

---

## 5. Educational Scenarios (Initial Scope)

Cardiovascular teaching set (priority):

- Normal sinus physiology
- Acute myocardial infarction / STEMI (territory + severity)
- Atrial fibrillation
- AV block (degrees as model maturity allows)
- Hyperkalemia / hypokalemia (electrolyte morphology teaching)

Later expansion (product vision, not Phase 1 commitment): broader disease packs, respiratory/endocrine modules, virtual hospital workflows.

---

## 6. User Modes

### 6.1 Explore Mode

**Purpose:** Understand cardiac anatomy and electrophysiology.

**Learner goals:**

- Orient to chambers, conduction system, myocardial territories, and electrode/lead geometry.
- Watch normal (and lightly perturbed) activation without clinical case pressure.
- Build spatial and temporal intuition before waveform-centric study.

**Typical interactions:** Navigate/select structures; play/pause time; highlight region ↔ lead relationships; inspect conduction path.

---

### 6.2 Study Mode

**Purpose:** Learn ECG mechanisms.

**Learner goals:**

- Connect activation and vectors to P/QRS/T morphology and intervals.
- Adjust teaching parameters and predict lead changes before revealing outcomes.
- Use structured explanations tied to the live simulation state.

**Typical interactions:** Parameter sliders/selects; 12-lead and rhythm views; mechanism panels; optional quizzes grounded in the same model.

---

### 6.3 Simulation Mode

**Purpose:** Clinical reasoning training.

**Learner goals:**

- Interpret ECGs and related findings in scenario or virtual-patient context.
- Form diagnoses, urgency judgments, and management hypotheses.
- Receive feedback on reasoning quality and safety of decisions (progressively, with AI tutor later).

**Typical interactions:** Case brief → ECG/physiology observation → interpretation tasks → explanation and debrief. Physiology remains the source of truth behind the case.

---

## 7. MVP Alignment

Minimum viable demonstration of the concept should prove:

1. Readable normal and abnormal ECG output,
2. At least one deep disease path (recommended: acute MI / STEMI) with parameter → mechanism → ECG,
3. An educational explanation surface (what / why / clinical appearance).

Full three-mode polish, AI tutor, and multi-system disease libraries are post-MVP expansions on the same architecture.

---

## 8. Out of Scope (Requirements Level)

- Use as a clinical diagnostic medical device.
- Replacing supervised bedside teaching.
- Implementing unrelated organ systems before the cardiac EP → ECG spine is solid.
