#!/usr/bin/env bash
# Guard the "always latest after every code update" rule.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

fail() {
  echo "verify-latest-download: $*" >&2
  exit 1
}

expect_file_contains() {
  local file="$1"
  local needle="$2"
  grep -F -q "$needle" "$file" || fail "$file must contain: $needle"
}

forbid_file_contains() {
  local file="$1"
  local needle="$2"
  if grep -F -q "$needle" "$file"; then
    fail "$file must not pin a stale latest URL: $needle"
  fi
}

echo "==> Checking download URLs track live main / local-latest…"

expect_file_contains src/download/localCopy.ts \
  'archive/refs/heads/main.zip'
expect_file_contains src/download/localCopy.ts \
  'releases/download/local-latest/ecg-stimulator-view.zip'
expect_file_contains src/download/localCopy.ts \
  'commits/main'

forbid_file_contains src/download/localCopy.ts \
  'releases/latest/download/'

for f in README.md docs/local-download.md; do
  expect_file_contains "$f" 'archive/refs/heads/main.zip'
  expect_file_contains "$f" 'releases/download/local-latest/ecg-stimulator-view.zip'
  forbid_file_contains "$f" 'releases/latest/download/ecg-stimulator'
done

expect_file_contains README.md '每次代码更新'
expect_file_contains README.md 'every code update'

if [[ -f local-bundle/ecg-stimulator-view.zip && -f local-bundle/ecg-stimulator-source.zip ]]; then
  echo "==> Checking packed zips embed BUILD.txt…"
  [[ -f local-bundle/latest.json ]] || fail "missing local-bundle/latest.json"
  unzip -l local-bundle/ecg-stimulator-view.zip | grep -q 'BUILD.txt' \
    || fail "view zip missing BUILD.txt"
  unzip -l local-bundle/ecg-stimulator-source.zip | grep -q 'BUILD.txt' \
    || fail "source zip missing BUILD.txt"
  python3 - <<'PY'
import json
from pathlib import Path
data = json.loads(Path("local-bundle/latest.json").read_text())
for key in ("sha", "sourceZip", "sourceZipMain", "viewZip"):
    if not data.get(key):
        raise SystemExit(f"latest.json missing {key}")
if "local-latest" not in data["viewZip"]:
    raise SystemExit("viewZip must use local-latest")
if "refs/heads/main.zip" not in data["sourceZipMain"]:
    raise SystemExit("sourceZipMain must be live main archive")
print("latest.json ok:", data["shortSha"])
PY
fi

echo "==> verify-latest-download: ok"
