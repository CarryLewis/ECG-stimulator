#!/usr/bin/env bash
# Write BUILD.txt / latest.json describing the commit being packed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

OUT_DIR="${1:-${ROOT}/local-bundle}"
mkdir -p "${OUT_DIR}"

SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
DATE="$(git log -1 --format=%cI)"
SUBJECT="$(git log -1 --format=%s)"
REPO="https://github.com/CarryLewis/ECG-stimulator"

cat > "${OUT_DIR}/BUILD.txt" <<EOF
ECG Stimulator — download build
commit=${SHA}
short=${SHORT}
date=${DATE}
subject=${SUBJECT}
source=${REPO}/archive/${SHA}.zip
source_main=${REPO}/archive/refs/heads/main.zip
view=${REPO}/releases/download/local-latest/ecg-stimulator-view.zip
EOF

cat > "${OUT_DIR}/latest.json" <<EOF
{
  "sha": "${SHA}",
  "shortSha": "${SHORT}",
  "builtAt": "${DATE}",
  "subject": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "${SUBJECT}"),
  "sourceZip": "${REPO}/archive/${SHA}.zip",
  "sourceZipMain": "${REPO}/archive/refs/heads/main.zip",
  "viewZip": "${REPO}/releases/download/local-latest/ecg-stimulator-view.zip"
}
EOF
