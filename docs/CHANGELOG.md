# Changelog

**Document role:** AI-readable project history  
**Rule:** Every completed task updates this file ([`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) Rule 6)  
**Format:** Newest entries first

---

## 2026-07-30 — Consolidated latest (EP lab + vector ECG + docs)

**Completed:**

- Consolidated open chat/PR work into one latest application build
- Merged EP laboratory UI redesign (#12) including electrical vector engine and body-surface → lead → ECG pipeline (#11)
- Merged AI Project Control Center documentation system (#9)
- Ported post-merge V3 adult thorax proportion fixes from conduction-viz (body `BODY_SCALE` independent of mediastinal heart scale)
- Supersedes older draft ECG/UI PRs (#1–#5) whose pipelines were replaced by the vector/body-surface path; core data model types (#7) already present via merged #8/#10

**Modified:**

- Application: `src/components/lab/*`, `src/components/vector/*`, `src/vector-engine/*`, `src/ecg-generator/*`, `src/ep/*`, V3 heart/torso assets, lab styles
- Docs: Control Center root + `docs/modules/*`

**Current limitations:**

- Disease packs / clinical scenario switching not yet wired into the lab UI
- Bilingual (zh/en) UI from earlier branches not carried forward into the lab chrome
- Explore / Study / Simulation modes specified in docs but not implemented as separate modes
- GLB heart asset remains opt-in (`HEART_GLB_MODE = 'off'`)

**Next task:**

- Wire disease scenarios into the physiological pipeline and clinical panel; consider restoring bilingual chrome

---

## 2026-07-30

**Completed:**

- Established AI Project Control Center under `/docs`
- Created root memory documents: vision, product requirements, architecture, development rules, medical model, roadmap, changelog
- Created module memory files for heart anatomy, electrophysiology engine, vector engine, ECG generator, clinical engine, and UI system
- Preserved prior concept docs: `product-requirement-document.md`, `software-architecture-design.md`

**Modified:**

- `/docs` tree (new structured Control Center files + `modules/`)

**Current limitations:**

- No application source code in the repository yet
- Architecture and medical model are design baselines only
- User modes (Explore / Study / Simulation) are specified but not implemented
- Disease packs and runtime contracts exist on paper only

**Next task:**

- Begin **Phase 1 — Foundation**: choose/confirm implementation stack, define typed public contracts for anatomy → EP → vector → ECG → clinical, and scaffold module package boundaries without building UI features yet

---

## Entry Template (copy for future sessions)

```
## YYYY-MM-DD

**Completed:**

- …

**Modified:**

- …

**Current limitations:**

- …

**Next task:**

- …
```
