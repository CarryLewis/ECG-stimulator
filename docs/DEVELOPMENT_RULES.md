# Development Rules

**Document role:** Prevent AI coding drift and protect architectural consistency  
**Applies to:** Every human and AI coding session on this repository  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`CHANGELOG.md`](./CHANGELOG.md)

---

These rules are mandatory. If a task conflicts with a rule, update documentation and get explicit architectural agreement before violating the rule in code.

---

## Rule 1 — Never modify unrelated modules

Change only the modules required for the assigned task.

- Do not “drive-by” refactor neighboring packages, UI chrome, or docs outside the task scope.
- If a dependency forces a cross-module change, state that explicitly in the session notes and CHANGELOG.
- Prefer the smallest diff that preserves contracts in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Rule 2 — Before coding: analyze existing architecture

Before writing or generating application code:

1. Read [`PROJECT_VISION.md`](./PROJECT_VISION.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).
2. Read the relevant file(s) under [`docs/modules/`](./modules/).
3. Read [`CHANGELOG.md`](./CHANGELOG.md) for current limitations and next task.
4. Inspect existing code and contracts — extend them; do not invent a parallel design.

No feature work starts from a blank mental model of the stack.

---

## Rule 3 — Preserve existing working functions

- Do not break or silently rewrite behavior that already works unless the task explicitly requires it.
- Prefer additive changes, adapters, and feature flags over destructive replacements.
- When replacing a component, keep tests or fixtures that lock prior educational behavior until parity is proven.

---

## Rule 4 — Do not create duplicate systems

- One anatomy model, one EP engine, one vector projection path, one ECG sampling pipeline, one clinical scenario registry.
- Do not add a second “simple ECG drawer” that bypasses the vector engine for convenience.
- Do not copy disease-specific millivolt hacks into the UI or generator.
- If two approaches exist, consolidate toward the architecture — document the decision.

---

## Rule 5 — Medical simulation logic must be separated from UI

- Electrophysiology, vectors, and ECG sampling must not live inside React/Canvas/Three widgets.
- UI may send `SimulationCommand` / parameters and render streams; it must not own conduction timing or lead-axis math.
- Headless tests must exercise simulation without mounting the DOM.
- Explanation copy and i18n belong in the clinical/presentation layer, not inside physics kernels.

---

## Rule 6 — Every completed task must update CHANGELOG.md

After each completed coding or documentation task that changes project state:

- Add a dated entry to [`CHANGELOG.md`](./CHANGELOG.md).
- Record what was completed, what was modified, current limitations, and the next task.
- AI sessions treat an outdated CHANGELOG as incomplete work.

---

## Rule 7 — Every major architectural decision must update documentation

When you:

- add/split/merge a module,
- change a public contract (ActivationMap, TissueState, lead voltages, disease pack shape),
- introduce a new user mode or disease family that affects the spine,
- or alter medical modeling assumptions,

you must update the relevant docs under `/docs` (at least `ARCHITECTURE.md`, affected `modules/*.md`, and often `MEDICAL_MODEL.md` / `ROADMAP.md`) in the same effort as the code change.

Code without doc sync is incomplete.

---

## Supporting Practices

| Practice | Expectation |
|----------|-------------|
| Disease additions | Use disease packs; never `if (disease === …) lead += …` in the ECG generator |
| Scope discipline | One job per PR/session when possible; update module “Current status” fields |
| Medical accuracy | Prefer [`MEDICAL_MODEL.md`](./MEDICAL_MODEL.md) over improvising physiology in UI strings |
| Vision conflicts | Resolve against [`PROJECT_VISION.md`](./PROJECT_VISION.md) before implementing |

---

## Quick Pre-Commit Checklist for Agents

- [ ] Touched only related modules
- [ ] Architecture and module docs reviewed
- [ ] No duplicate pipeline introduced
- [ ] Simulation logic kept out of UI
- [ ] `CHANGELOG.md` updated
- [ ] Major decisions reflected in `/docs`
