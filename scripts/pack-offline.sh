#!/usr/bin/env bash
# Pack a self-contained offline bundle of this repo for air-gapped / USB use.
# After unpacking on the target machine: npm ci && npm run build && npm run preview
# (or serve the pre-built dist/ with any static file server).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${ROOT}/offline-bundle"
ARCHIVE_NAME="ecg-learning-simulator-offline-${STAMP}"
STAGE="${OUT_DIR}/${ARCHIVE_NAME}"

rm -rf "${STAGE}"
mkdir -p "${STAGE}"

echo "==> Installing dependencies (needed once while online)…"
npm ci

echo "==> Building production assets…"
npm run build

echo "==> Staging source + lockfile + dist…"
# Source & tooling (exclude bulky / derived dirs)
rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'offline-bundle' \
  --exclude 'dist' \
  --exclude '*.tsbuildinfo' \
  "${ROOT}/" "${STAGE}/"

# Include the built static site so the target machine can run without building
mkdir -p "${STAGE}/dist"
rsync -a "${ROOT}/dist/" "${STAGE}/dist/"

# Vendor node_modules so `npm ci` is optional on a fully air-gapped machine
echo "==> Vendoring node_modules into the bundle…"
rsync -a "${ROOT}/node_modules/" "${STAGE}/node_modules/"

cat > "${STAGE}/OFFLINE-README.txt" <<'EOF'
ECG Learning Simulator — Offline Bundle
=======================================

This package is self-contained. No cloud hosting, CDN, or remote API is required.

Quick start (already-built UI)
------------------------------
1. Open a terminal in this folder.
2. Serve the static build locally, for example:

     npx --yes serve dist -l 4173

   Or any other static file server pointed at the `dist/` folder.
3. Open http://127.0.0.1:4173 in a browser.

Develop / rebuild locally
-------------------------
1. node_modules is already included. If you need a clean install (and have npm
   cache / network): `npm ci`
2. `npm run dev`     — local Vite server at http://127.0.0.1:5173
3. `npm run build`   — rebuild `dist/`
4. `npm run preview` — preview the production build at http://127.0.0.1:4173

Architecture note
-----------------
All ECG waveforms are synthesised in the browser. There is no backend and no
external network call at runtime.
EOF

mkdir -p "${OUT_DIR}"
TAR_PATH="${OUT_DIR}/${ARCHIVE_NAME}.tar.gz"
echo "==> Creating ${TAR_PATH}…"
tar -czf "${TAR_PATH}" -C "${OUT_DIR}" "${ARCHIVE_NAME}"

# Drop the unpacked stage; keep the tarball
rm -rf "${STAGE}"

BYTES="$(wc -c < "${TAR_PATH}" | tr -d ' ')"
echo "==> Done. Offline archive: ${TAR_PATH} (${BYTES} bytes)"
echo "    Copy this file to your local machine / USB. Do not deploy to a cloud host."
