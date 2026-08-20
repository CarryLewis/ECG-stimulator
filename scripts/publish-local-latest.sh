#!/usr/bin/env bash
# Recreate the rolling GitHub Release `local-latest` for the current HEAD.
# Rule: every code update on main must replace these files so downloads
# always return the newest source + view zips.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

TAG=local-latest
SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
DATE="$(git log -1 --format=%cI)"
VIEW_ZIP="${ROOT}/local-bundle/ecg-stimulator-view.zip"
SOURCE_ZIP="${ROOT}/local-bundle/ecg-stimulator-source.zip"
LATEST_JSON="${ROOT}/local-bundle/latest.json"

for f in "${VIEW_ZIP}" "${SOURCE_ZIP}" "${LATEST_JSON}"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing $f — run npm run pack:local first." >&2
    exit 1
  fi
done

NOTES="Local copy of the ECG Stimulator — always the latest main.

Rule: every push to main deletes and recreates this release so the
downloadable files match commit ${SHORT} (${SHA}).

把模拟器下载到自己电脑上查看或调试。入口说明见仓库 README：
https://github.com/CarryLewis/ECG-stimulator#本地下载与调试

Built: ${DATE}
Commit: ${SHA}

- **ecg-stimulator-source.zip** — source at this commit. For the live tip of main you can also use Code → Download ZIP / archive/refs/heads/main.zip
- **ecg-stimulator-view.zip** — prebuilt UI. Unzip, run view.sh / view.bat, open http://127.0.0.1:4173

Do not open index.html via file://."

echo "==> Replacing rolling release ${TAG} at ${SHORT}…"

if gh release view "$TAG" >/dev/null 2>&1; then
  gh release delete "$TAG" --yes --cleanup-tag 2>/dev/null \
    || gh release delete "$TAG" --yes
fi
git push origin ":refs/tags/${TAG}" 2>/dev/null || true

gh release create "$TAG" \
  "${VIEW_ZIP}" \
  "${SOURCE_ZIP}" \
  "${LATEST_JSON}" \
  --title "Local download (latest · ${SHORT})" \
  --notes "${NOTES}" \
  --target "${SHA}" \
  --latest

echo "==> Published ${TAG} → ${SHA}"
