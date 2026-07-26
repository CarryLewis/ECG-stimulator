# Offline / Local-Only Setup

This project is designed to live **on your machine**, not as a cloud service.

- No backend, database, or remote API at runtime
- All ECG waveforms are synthesised in the browser
- Production assets use relative paths (`base: './'`) so `dist/` works from any local folder

## Prerequisites (one-time, while online)

- Node.js 18+ and npm
- Clone or copy this repository onto the local disk

```bash
git clone <your-local-or-private-remote-url> ecg-stimulator
cd ecg-stimulator
npm ci
```

After `npm ci`, you can disconnect from the network and keep developing.

## Daily local use (offline)

```bash
npm run dev        # http://127.0.0.1:5173 — development
npm run build      # write production files to dist/
npm run preview    # http://127.0.0.1:4173 — production preview
npm run lint       # ESLint
```

The Vite server binds to `127.0.0.1` only (not the public network).

## Air-gapped USB / offline archive

On a machine that still has network access:

```bash
npm run pack:offline
```

This writes a tarball under `offline-bundle/` that includes:

- Full source
- `package-lock.json`
- Vendored `node_modules`
- Pre-built `dist/`
- `OFFLINE-README.txt` with unpack instructions

Copy the `.tar.gz` to USB or an internal share. On the offline machine:

```bash
tar -xzf ecg-learning-simulator-offline-*.tar.gz
cd ecg-learning-simulator-offline-*
npx serve dist -l 4173   # or any static server → dist/
```

## What not to do

- Do not deploy this app to a public cloud host as the primary storage/runtime
- Do not rely on CDNs for fonts, scripts, or ECG data — none are used
- Prefer a private git remote or local bare repo if you need backup; keep the working copy on disk
