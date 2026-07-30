# Project Vision

**Document role:** Highest-level project memory for AI agents and contributors  
**Product:** Interactive Physiology & ECG Learning Simulator (ECG Stimulator)  
**Status:** Concept / architecture phase — no application code yet  
**Audience:** Clinical medical students (primary)

---

## 1. Product Identity

ECG Stimulator is an interactive cardiac electrophysiology laboratory.

It is not a static ECG quiz app, a waveform drawing toy, or a generic anatomy viewer. It is a teaching environment where learners can see — and steer — how the living heart’s structure and electrical behavior become the ECG they will read at the bedside.

The product name may appear as “Interactive Physiology & ECG Learning Simulator” in educational materials. Internally and architecturally, the system is the **ECG Stimulator**: a cardiac electrophysiology simulation platform.

---

## 2. Core Philosophy

The educational and technical spine of the product is a single causal chain. Every feature, module, and learning scenario must reinforce this chain rather than skip to the final picture.

```
Anatomy
    ↓
Electrical conduction
    ↓
Myocardial activation
    ↓
Electrical vectors
    ↓
ECG generation
    ↓
Clinical interpretation
```

### What this means for learners

Students should stop memorizing “ST elevation means STEMI” as an isolated fact. They should experience:

- where the heart tissue lives in space,
- how the conduction system times activation,
- how activation becomes a changing electrical field,
- how body-surface leads sample that field,
- and how those waveforms support clinical reasoning.

### What this means for the product

Diseases and teaching scenarios change physiology. The ECG and the UI only observe the result. The platform teaches mechanism first; pattern recognition is a consequence, not a substitute.

---

## 3. Target Users

### Primary

Clinical medical students — undergraduate and early clinical trainees who must connect cardiac anatomy, electrophysiology, and ECG interpretation before (and during) patient care.

### Secondary (future reach)

Nursing and physician-assistant students, medical educators, and clinical instructors who need a shared, interactive demonstration space.

The first design priority remains the clinical medical student learning ECG mechanisms, not a full electronic health-record trainer or a research-grade cardiac model.

---

## 4. Problem the Product Exists to Solve

Traditional teaching often shows outcomes without the dynamic path that produced them. ECG learning is especially abstract: waveforms float free of anatomy and conduction timing.

The product exists so that learners can:

- see physiology as a changing system, not a fixed diagram,
- manipulate parameters and watch mechanism → ECG → meaning unfold,
- practice clinical reasoning in a safe simulated environment.

---

## 5. Long-Term Vision

Build a medical digital simulation platform — a “flight simulator” for medical education.

Near term, the platform is focused on cardiac electrophysiology and ECG. Over time it should grow into a broader AI-supported medical education ecosystem: richer disease libraries, virtual clinical cases, mechanism-aware tutoring, and personalized learning — always grounded in simulation truth rather than memorized screenshots.

Success looks like a student who can explain *why* a lead looks the way it does, adjust a disease parameter with intent, and carry that mechanistic confidence into real clinical interpretation.

---

## 6. Non-Goals (Vision Level)

- Not a replacement for supervised clinical training.
- Not a claim of diagnostic device certification or patient-care use.
- Not an unbounded multi-organ simulator in the first generations; cardiac EP → ECG → clinical teaching is the committed path.

---

## 7. How Agents Should Use This Document

When starting a new session, read this file first. If a proposed feature breaks the Anatomy → … → Clinical interpretation chain, treat that as a vision conflict and resolve it in documentation before coding.
