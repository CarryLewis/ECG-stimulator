# Baseline tip (current `main`)

**Status:** Canonical shipping tip after reverting the #22 consolidation (#23).  
**Content SHA equivalence:** tree matches pre-PR#22 `2957d0f` (plus this cleanup commit).

## What is in

- Interactive 3D cardiac anatomy (Src / V1 / V2 / V3)
- Shared orientation cube (A/P/L/R/H/B)
- Event-driven sinus conduction glow + timeline HUD
- Lead / electrode teaching overlays on V2 / V3
- Website embed notify workflow (`main` pushes only)

## What is not in

- Live 12-lead ECG synthesis / recording monitor
- Disease / pathology packs
- EP laboratory shell / electrical vector engine
- Active bilingual UI toggle (English chrome; some zh strings remain in data)

## How to verify

```bash
git log -1 --oneline origin/main
npm ci && npm run build && npm run lint
```

Open feature work should branch from this tip, not from superseded consolidate/pathology drafts, unless intentionally reviving that stack.
