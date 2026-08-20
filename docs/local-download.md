# Local download — view and debug

Download the whole ECG Stimulator onto your own computer. The **public entry** for these files is the GitHub repository introduction (README):

- [中文：本地下载与调试](https://github.com/CarryLewis/ECG-stimulator#本地下载与调试)
- [English: Download locally and debug](https://github.com/CarryLewis/ECG-stimulator#download-locally-and-debug)

There is no cloud account requirement. Runtime has no backend.

## Rule: always the latest after every code update

After every update to `main`:

1. **Source ZIP** is GitHub’s live archive of current `main` — [ECG-stimulator-main.zip](https://github.com/CarryLewis/ECG-stimulator/archive/refs/heads/main.zip). It is generated at download time, so it cannot point at an old commit.
2. **View ZIP** is deleted and recreated as Release [`local-latest`](https://github.com/CarryLewis/ECG-stimulator/releases/tag/local-latest). The filename stays `ecg-stimulator-view.zip`; the bytes are the newest production build. The in-app **Source ZIP** button also resolves the latest `main` SHA from the GitHub API right before opening the archive.

Do not pin GitHub’s generic “Latest release” download URL (that follows whatever GitHub marks as Latest, which may not be this rolling bundle).

## View (no Git)

1. Download [ecg-stimulator-view.zip](https://github.com/CarryLewis/ECG-stimulator/releases/download/local-latest/ecg-stimulator-view.zip).
2. Unzip. You should see `index.html`, `BUILD.txt`, `view.sh`, `view.bat`, and `assets/`.
3. Run `./view.sh` (macOS / Linux) or `view.bat` (Windows).
4. Open http://127.0.0.1:4173

Do **not** double-click `index.html`. The production build uses ES modules; `file://` will fail.

If the latest release is missing (first run of the workflow), build from source:

```bash
npm ci
npm run build
npm run view:local   # same helper, serves dist/ on http://127.0.0.1:4173
```

## Debug (source)

1. Download [source ZIP](https://github.com/CarryLewis/ECG-stimulator/archive/refs/heads/main.zip) (GitHub **Code → Download ZIP**), or:

   ```bash
   git clone https://github.com/CarryLewis/ECG-stimulator.git
   cd ECG-stimulator
   git pull origin main
   ```

2. Requires **Node.js 18+**.

   ```bash
   npm ci
   npm run dev      # http://127.0.0.1:5173 — hot reload
   ```

3. Lint / production preview:

   ```bash
   npm run lint
   npm run build
   npm run preview  # http://127.0.0.1:4173
   ```

## Pack the zips yourself

```bash
npm run pack:local
npm run verify:download
```

Writes `local-bundle/ecg-stimulator-view.zip`, `ecg-stimulator-source.zip`, `BUILD.txt`, and `latest.json`.

Pushes to `main` run `.github/workflows/publish-local-download.yml` → `scripts/publish-local-latest.sh`, which **replaces** tag `local-latest` so downloads stay on the newest commit.

## 中文摘要

**规则：每次代码更新后，下载入口必须是最新文件。**

| 目的 | 文件 | 下一步 |
|------|------|--------|
| 只查看 | `ecg-stimulator-view.zip`（`local-latest`，每次 `main` 重建） | 解压后运行 `view.sh` / `view.bat` |
| 调试改代码 | 当前 `main` 源码 ZIP 或 `git clone` + `git pull` | `npm ci && npm run dev` |

不要用 `file://` 打开 `index.html`。完整入口在仓库首页 README 的「本地下载与调试」。
