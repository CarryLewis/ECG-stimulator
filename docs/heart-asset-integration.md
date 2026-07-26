# Heart asset integration (Unity → Web)

The V3 torso schematic (`HeartTorsoV3`) seats an anatomical heart in a
semi-transparent male torso and labels clinical **12-lead ECG** electrode
sites (RA / LA / RL / LL / V1–V6) plus derived lead callouts (I–III, aVR–aVF,
V1–V6).

## Source asset

Local Unity package (not committed — proprietary / large binary):

```
/Users/carrylewis/Desktop/Heart Animated Realistic 1.0.unitypackage
```

The web app cannot import `.unitypackage` directly. Export a runtime mesh to
**GLB/GLTF**, then drop it into this repo.

## Export steps (Unity Editor)

1. Create an empty Unity project (same major version as the package expects).
2. **Assets → Import Package → Custom Package…** and select
   `Heart Animated Realistic 1.0.unitypackage`.
3. Open the heart prefab / scene; confirm materials and any morph / animation
   clips for the beat cycle.
4. Install a GLTF exporter (e.g. Unity GLTFast or Khronos UnityGLTF).
5. Export the heart root as:
   ```
   public/models/heart-animated-realistic.glb
   ```
6. Prefer:
   - Y-up, metres
   - Embedded textures (or a sibling `.bin` + textures kept next to the GLB)
   - Morph targets or a simple scale pulse if a beat clip exists
7. In Unity, note the local pivot: the mesh should sit with the **apex inferior
   and slightly left**, matching mediastinal anatomy in the reference torso
   cutaway.

## Wire into the simulator

1. Place the file at `public/models/heart-animated-realistic.glb`.
2. Open `src/components/heart/RealisticHeart.tsx`.
3. Set `USE_REALISTIC_HEART_GLB = true` and load with `useGLTF` from
   `@react-three/drei`, applying `HEART_MEDIASTINUM_POSE` so the asset aligns
   with the translucent torso and electrode landmarks in
   `src/ecg/electrodeMap.ts`.
4. Keep the procedural cutaway as `Suspense` fallback so offline builds without
   the GLB still run.

Until the GLB is present, V3 uses the **procedural cutaway heart** (aorta red,
pulmonary trunk blue, left-of-midline tilt) so electrode teaching works without
the commercial mesh.

## Spatial contract (V3)

Body axes (standing, anterior view):

| Axis | Direction        |
|------|------------------|
| +x   | Patient's left   |
| +y   | Superior         |
| +z   | Anterior         |

Electrode landmarks live in `src/ecg/electrodeMap.ts` and should stay on the
torso *surface* even after swapping the heart mesh. Adjust only
`HEART_MEDIASTINUM_POSE` if the imported GLB pivot differs.

## Licensing

Do **not** commit the Unity package or exported GLB unless redistribution rights
are confirmed. Document the local path and keep `public/models/` gitignored for
binaries if needed.
