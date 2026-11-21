# Source 2.0 with the preserved Source 1.0 model

The app remains 2.0. The new model is **源 2.0 / Source 2.0**, and the previous source model is **源 1.0 / Source 1.0**. Both are selectable in the existing view controls. The sidebar settings, disease parameters, initial V1 view, 12-lead monitor, signal generation and other heart views retain their existing behavior. It is a simplified teaching model, not a patient-specific anatomical reconstruction.

## Visible changes

- Continuous tapered LV geometry contains the apex; the apex is a selectable landmark rather than a separate chamber-like sphere. The RV uses a curved anterior crescent surface; the atria and connected vessel cues use a quieter matte palette.
- Fixed-size labels use projected leader lines and separate left/right lanes. Full names appear on hover, keyboard focus or selection. Labels follow camera changes without scaling into large cards.
- Selecting **IVS** aligns to the anterior aspect and opens an actual window in both ventricular shells. The cutaway includes inner surfaces and connected cut edges. The septum remains internal in the normal opaque view; reducing opacity reveals it.
- Selection uses a camera-dependent contour, not extra emissive brightness. Warm electrical glow represents depolarization; blue represents repolarization. These use the existing shared conduction state. The geometry does not feed back into the ECG equations.
- The opacity slider is honored across its full 20–100% range, including during selection. Tissue outside a selected region is de-emphasized without forcing the selected region opaque.
- Source-specific camera fitting reserves room for the existing overlays. On phones the source stage gets enough vertical space, and the orientation cube is smaller; all original controls and all 12 leads remain available.

## Interaction checks

1. Open **源 2.0 / Source 2.0**; the full model fits and six labels remain readable.
2. Select each structure from either its label or the existing sidebar; selection and detail text agree.
3. Select IVS, inspect the exposed septum, then close the cutaway or select a different structure to restore the exterior.
4. Change opacity to 20%, select a structure, and verify that it is not forced back to full opacity.
5. Toggle anatomical labels, rotate with A/P/L/R/H/B, switch languages, and use pause/resume.
6. Check 1440×1000, 1440×900, 1101×900, 390×844 and 320×740. The sidebar order, parameter ranges/defaults and ECG cell count remain unchanged.

## Verification

- `npm run build`
- `npm run lint` (four existing Fast Refresh warnings)
- `npm run check:anatomy` (Node 22.6+): finite positions/normals, closed manifold edges, outward-facing surfaces, continuous LV apex and hollow ventricular cutaways.

The new surfaces deliberately leave detailed valves, myocardial fiber architecture, mechanical contraction and spatial electrophysiology for later work. Regional electrical values are reused from the current model; this iteration does not claim an anatomical field solver.

Anatomical and teaching references: [OpenStax heart anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy) and [cardiac electrical activity](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity).

## Model naming and release — 2026-11-21

- Source 2.0 is available at `?view=source-2`; Source 1.0 at `?view=source-1`. The ordinary URL retains its original V1 initial view.
- Source 1.0 restores the original components and structure data from `feaa7e53ad5d1b617ce28ac6f97d4d7e726236d7`; it is not an alias for the new geometry.
- Structure selection and opacity changes stay within Source 1.0 when it is active. ECG lead selection still opens the original lead atlas.
- The main website, project descriptions and structured project record use the same model names and direct links.
