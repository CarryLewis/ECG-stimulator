#!/usr/bin/env bash
# Serve the ECG Stimulator from this folder (view zip) or from repo dist/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-4173}"

if [[ -f "${ROOT}/index.html" ]]; then
  SERVE="${ROOT}"
elif [[ -f "${ROOT}/../dist/index.html" ]]; then
  SERVE="${ROOT}/../dist"
else
  echo "No index.html found."
  echo "Unzip ecg-stimulator-view.zip and run this script from that folder,"
  echo "or from the repo run: npm run build && npm run view:local"
  exit 1
fi

echo "ECG Stimulator — local view"
echo "Serving: ${SERVE}"
echo "Open    http://127.0.0.1:${PORT}"
echo "Do not open index.html via file:// (ES modules will fail)."
echo

cd "${SERVE}"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "${PORT}" --bind 127.0.0.1
fi
if command -v python >/dev/null 2>&1; then
  exec python -m http.server "${PORT}" --bind 127.0.0.1
fi

echo "Python 3 is required to serve the files. Install it, then re-run."
exit 1
