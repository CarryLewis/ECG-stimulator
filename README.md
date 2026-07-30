# ECG Stimulator — Cardiac Electrophysiology Laboratory

Physiology-first teaching SPA: a laboratory interface with a large interactive 3D heart, live ECG monitor, conduction timeline, and clinical interpretation panels.

## Run

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

## Interface

| Region | Role |
|--------|------|
| **Main stage** | Large interactive 3D heart (anatomy / conduction / leads / torso / vectors) |
| **ECG monitor** | Live leads from activation → vector → body surface → lead calculation |
| **Timeline** | Physiological cascade + playback (time scale, heart rate) |
| **Clinical** | Mechanism copy, mean axis, activation contributions, structure notes |

## ECG pipeline

```
Cardiac activation → Electrical vector → Body surface potential → Lead calculation → ECG waveform
```

P ← atrial activation · QRS ← ventricular depolarization · T ← repolarization
