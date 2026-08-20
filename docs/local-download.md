# Local download — view and debug

Download the whole ECG Stimulator onto your own computer. The **public entry** for these files is the GitHub repository introduction (README):

- [中文：本地下载与调试](https://github.com/CarryLewis/ECG-stimulator#本地下载与调试)
- [English: Download locally and debug](https://github.com/CarryLewis/ECG-stimulator#download-locally-and-debug)

There is no cloud account requirement. Runtime has no backend.

## View (no Git)

1. Download [ecg-stimulator-view.zip](https://github.com/CarryLewis/ECG-stimulator/releases/latest/download/ecg-stimulator-view.zip) (published on each `main` push).
2. Unzip. You should see `index.html`, `view.sh`, `view.bat`, and `assets/`.
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
```

Writes `local-bundle/ecg-stimulator-view.zip` and `local-bundle/ecg-stimulator-source.zip`.

Pushes to `main` also run `.github/workflows/publish-local-download.yml`, which attaches those zips to the rolling GitHub Release `local-latest`.

## 中文摘要

| 目的 | 文件 | 下一步 |
|------|------|--------|
| 只查看 | `ecg-stimulator-view.zip` | 解压后运行 `view.sh` / `view.bat` |
| 调试改代码 | 源码 ZIP 或 `git clone` | `npm ci && npm run dev` |

不要用 `file://` 打开 `index.html`。完整入口在仓库首页 README 的「本地下载与调试」。
