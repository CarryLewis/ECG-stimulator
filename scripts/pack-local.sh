#!/usr/bin/env bash
# Build downloadable local bundles: a static view zip and a source zip.
# Used by `npm run pack:local` and by the publish-local-download workflow.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

OUT="${ROOT}/local-bundle"
VIEW_DIR="${OUT}/ecg-stimulator-view"
SOURCE_ZIP="${OUT}/ecg-stimulator-source.zip"
VIEW_ZIP="${OUT}/ecg-stimulator-view.zip"

echo "==> Building production assets (relative paths, base: './')…"
npm run build

rm -rf "${OUT}"
mkdir -p "${VIEW_DIR}"

bash "${ROOT}/scripts/write-build-info.sh" "${OUT}"
SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"

echo "==> Staging view bundle…"
cp -R dist/. "${VIEW_DIR}/"
cp "${ROOT}/scripts/view-local.sh" "${VIEW_DIR}/view.sh"
cp "${ROOT}/scripts/view-local.bat" "${VIEW_DIR}/view.bat"
cp "${OUT}/BUILD.txt" "${VIEW_DIR}/BUILD.txt"
chmod +x "${VIEW_DIR}/view.sh"

cat > "${VIEW_DIR}/VIEW.txt" <<EOF
ECG Stimulator — local view bundle
心电图模拟器 — 本地查看包
=================================

commit ${SHORT} (${SHA})
This zip is rebuilt on every push to main.

Do not open index.html with file://  /  不要用 file:// 直接打开 index.html
ES modules will fail. Serve over local HTTP.

macOS / Linux:  ./view.sh
Windows:        view.bat
Then open:      http://127.0.0.1:4173

Need to debug / change code? Download the source ZIP of current main:
https://github.com/CarryLewis/ECG-stimulator/archive/refs/heads/main.zip

README:
https://github.com/CarryLewis/ECG-stimulator#本地下载与调试
https://github.com/CarryLewis/ECG-stimulator#download-locally-and-debug
EOF

echo "==> Zipping view bundle…"
rm -f "${VIEW_ZIP}"
(
  cd "${OUT}"
  zip -r -q "$(basename "${VIEW_ZIP}")" "$(basename "${VIEW_DIR}")"
)

echo "==> Zipping source (no node_modules / dist)…"
rm -f "${SOURCE_ZIP}"
git archive --format=zip --prefix=ECG-stimulator/ -o "${SOURCE_ZIP}" HEAD
STAGE="$(mktemp -d)"
mkdir -p "${STAGE}/ECG-stimulator"
cp "${OUT}/BUILD.txt" "${STAGE}/ECG-stimulator/BUILD.txt"
(
  cd "${STAGE}"
  zip -q -g "${SOURCE_ZIP}" ECG-stimulator/BUILD.txt
)
rm -rf "${STAGE}"

rm -rf "${VIEW_DIR}"

echo "==> Done."
echo "    ${VIEW_ZIP}"
echo "    ${SOURCE_ZIP}"
ls -lh "${VIEW_ZIP}" "${SOURCE_ZIP}" "${OUT}/latest.json"
