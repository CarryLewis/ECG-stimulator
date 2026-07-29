# Heart asset integration (GLB drop-in — no Unity)

The V3 torso schematic (`HeartTorsoV3`) seats an anatomical heart in a
semi-transparent male torso and labels clinical **12-lead ECG** electrode
sites. You do **not** need Unity.

## Quick start (recommended)

1. Download any anatomical heart as **`.glb`** or **`.gltf`**  
   (Sketchfab, TurboSquid, etc. — check licence / redistribution rights).
2. Rename / copy it to:
   ```
   public/models/heart-animated-realistic.glb
   ```
3. Restart `npm run dev` (or hard-refresh the browser).  
   Default `HEART_GLB_MODE = 'off'` uses the procedural heart so a missing
   file cannot blank the canvas. Set `HEART_GLB_MODE = 'force'` only after
   the GLB is in place.
4. If the mesh is tilted / too large, tweak `HEART_MEDIASTINUM_POSE` in
   `src/components/heart/heartAsset.ts`.

While the file is absent, V3 keeps the **procedural cutaway heart** so electrode
teaching still works offline.

## Modes (`src/components/heart/heartAsset.ts`)

| `HEART_GLB_MODE` | Behaviour |
|------------------|-----------|
| `'auto'` (default) | Try the GLB; missing/broken → procedural fallback |
| `'force'` | Same as auto (kept for clarity / future preload hooks) |
| `'off'` | Always procedural |

## Asset tips

Prefer:

* Y-up, roughly metres
* Embedded textures (single `.glb`)
* Apex inferior and slightly left (mediastinal pose)
* Under ~15–20 MB for snappy local loads

Body axes for V3 (standing, anterior view):

| Axis | Direction      |
|------|----------------|
| +x   | Patient's left |
| +y   | Superior       |
| +z   | Anterior       |

Electrode landmarks stay in `src/ecg/electrodeMap.ts` on the torso surface.
Only adjust `HEART_MEDIASTINUM_POSE` when the imported mesh pivot differs.

## Optional: Unity package you already own

If you later install Unity and still want to use
`Heart Animated Realistic 1.0.unitypackage`:

1. Import the package into a Unity project.
2. Install a GLTF exporter (GLTFast / UnityGLTF).
3. Export the heart root to `public/models/heart-animated-realistic.glb`.

This path is optional — a store-bought GLB is simpler.

## Licensing

Do **not** commit commercial GLBs unless redistribution is allowed.
`public/models/*.glb` is gitignored; keep assets local or behind your own licence.
