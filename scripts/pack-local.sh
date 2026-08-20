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

echo "==> Staging view bundle…"
cp -R dist/. "${VIEW_DIR}/"
cp "${ROOT}/scripts/view-local.sh" "${VIEW_DIR}/view.sh"
cp "${ROOT}/scripts/view-local.bat" "${VIEW_DIR}/view.bat"
chmod +x "${VIEW_DIR}/view.sh"

cat > "${VIEW_DIR}/VIEW.txt" <<'EOF'
ECG Stimulator — local view bundle
心电图模拟器 — 本地查看包
=================================

Do not open index.html with file://  /  不要用 file:// 直接打开 index.html
ES modules will fail. Serve over local HTTP.

macOS / Linux:  ./view.sh
Windows:        view.bat
Then open:      http://127.0.0.1:4173

Need to debug / change code? Download the source ZIP or clone the GitHub repo
and follow “本地下载与调试” / “Download locally and debug” in the README:

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

rm -rf "${VIEW_DIR}"

echo "==> Done."
echo "    ${VIEW_ZIP}"
echo "    ${SOURCE_ZIP}"
ls -lh "${VIEW_ZIP}" "${SOURCE_ZIP}"
