# Module: Heart Anatomy

**Package intent:** `anatomy` (future)  
**Layer:** Physiology Model  
**Related:** [`../ARCHITECTURE.md`](../ARCHITECTURE.md), [`../MEDICAL_MODEL.md`](../MEDICAL_MODEL.md)

---

## Purpose

Provide the spatial and topological truth of the heart and teaching body context — the scene graph of cardiac education. This module answers *where things are* and *how structures connect*, not *when they fire* or *how many millivolts a lead shows*.

---

## Responsibilities

- Chambers (RA, LA, RV, LV), septum, valves, and great vessels as needed for teaching
- Conduction anatomy nodes: SA node, atrial pathways, AV node, His, bundle branches, Purkinje regions
- Myocardial territories (anterior, septal, inferior, lateral; later coronary → territory maps)
- Electrode geometry (limb + precordial sites) in body coordinates
- Lead educational metadata (which wall a lead “faces,” placement notes)
- Visualization assets (meshes, pins, torso contour) as data/assets — rendering belongs to UI/Visualization

---

## Current Status

**Not implemented.** Spec and architecture only. Prior design notes live in [`../software-architecture-design.md`](../software-architecture-design.md).

---

## Future Requirements

- Versioned `RegionId` / `TerritoryId` catalogs consumed by EP and Vector engines
- `ConductionGraph` with nominal delays (data only; timing behavior owned by EP)
- Stable electrode/lead axis inputs for the vector engine
- Explore Mode navigation: select structure → highlight related leads/territories
- Optional GLB/procedural mesh swap without changing EP contracts

---

## Dependencies

| Depends on | Why |
|------------|-----|
| None (domain) | Pure data/asset package |
| Shared math utils (optional) | Coordinates, transforms |

| Consumed by | Why |
|-------------|-----|
| Electrophysiology Engine | Region IDs, conduction graph |
| Electrical Vector Engine | Lead axes, territory directions |
| UI System / Visualization | Meshes, pins, labels |

---

## Known Limitations

- No runtime anatomy package yet
- Territory and coronary mapping detail TBD beyond teaching four walls
- Fascicular-level left bundle detail optional/later
- Must not absorb EP timing or ECG sampling logic as the codebase grows
