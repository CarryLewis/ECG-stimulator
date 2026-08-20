# ECG Stimulator

**Interactive Physiology & ECG Learning Simulator**  
**交互式生理与心电图学习模拟器**

[中文](#中文) · [English](#english)

[Live demo](https://carrylewis.com/ecg-simulator/) · [本地下载](#本地下载与调试) · [Download](#download-locally-and-debug) · [PRD](docs/product-requirement-document.md) · [Architecture](docs/software-architecture-design.md)

---

## 中文

面向医学生的交互式生理与心电图学习模拟器：用三维心脏解剖和事件驱动的传导可视化，把「疾病如何发生、为何在 ECG 上这样表现」连成一条可观察的因果链，而不是让人背静态图。

> 当前 `main` 已落地的是**心脏解剖与传导可视化模块**（后续 ECG 生成的生物学源模型）。十二导联实时描记、疾病包与 AI 导师仍在设计 / 功能分支中演进。

### 项目概况

传统医学教育常把结果摆在学生面前：心肌梗死 → ST 抬高 → 胸痛。中间缺失的是机制：

冠状动脉闭塞 → 供氧下降 → ATP 耗竭 → 离子通道障碍 → 动作电位改变 → 传导异常 → **十二导联 ECG 变化** → 临床症状。

本项目把这条链做成可交互的模拟环境：

1. **看见结构** — 心腔、传导系统、导联与体表电极的空间关系
2. **看见时间** — 一次心跳里 SA → 心房 → AV → His–Purkinje → 复极如何依次发生
3. **看见观察** — （规划中）同一生理过程如何投影成 12 导联波形
4. **看见疾病** — （规划中）改变生理参数，而不是手绘一张「异常 ECG」

**设计原则：** 疾病改的是生理；ECG 与界面只观察结果。各层只通过类型化契约与相邻层通信。

### 目标用户

| 主要 | 次要 |
|------|------|
| 本科临床医学、备考医学生 | 护理 / PA 学生、临床教师 |

### 技术栈

Vite · React 18 · TypeScript · React Three Fiber / Three.js。纯前端 SPA，无后端；安装 `node_modules` 后无 CDN 运行时依赖。

### 当前已实现（`main`）

| 能力 | 说明 |
|------|------|
| **Src** 源心腔 | 可选中的 RA / LA / RV / LV / 室间隔 / 心尖，作为后续 ECG 的生物学源模型 |
| **V1** 传导示意 | 心腔 + SA / AV + His–Purkinje 树 |
| **V2** 导联图谱 | 室壁供血区域与 12 导联标记 |
| **V3** 躯干电极 | 体表轮廓与临床电极放置 |
| 方位立方 | 每个版本共用 **A / P / L / R / H / B**（前 / 后 / 左 / 右 / 头 / 足） |
| 事件驱动传导发光 | 视图**不**自己跑关键帧；发光强度从共享仿真时钟上的生理事件采样 |
| 播放控制 | 时间倍率（Slow / Learn / Clear / Real）+ 心率 40–140 bpm |
| 显示 | 解剖标签开关；Src 支持心肌透明度与结构点选 |

窦性周期时间轴（相对 SA 起点）：

| 时刻 | 事件 |
|------|------|
| 0 ms | 窦房结激动 |
| 40 ms | 心房除极 |
| 120 ms | AV 结延迟 |
| 200 ms | His / 心室除极级联（His → 束支 → Purkinje） |
| 350 ms | 复极 |

**尚未包含在 `main`：** 实时 12 导联描记、疾病情景包、电生理实验室界面、AI 讲解。相关工作在独立功能分支上（见仓库 Pull Requests）。

### 目标架构

```
临床层（情景 · 症状 · 讲解 · 病例）
        ▲
ECG 生成（采样 · 12 导联 · 监护 / 记录条）
        ▲
电向量引擎（心电偶极 · 导联轴 · 损伤电流）
        ▲
心脏电生理引擎（起搏 · 传导 · 不应期 · 节律规则）
        ▲
心脏解剖模型（心腔 · 传导树 · 供血区域 · 电极几何）  ← 当前可视化落在这一层
```

底层是**生理真相**，上层是**观察与教学**。类型契约见 [`docs/core-data-model/`](docs/core-data-model/)。

### 本地下载与调试

整份模拟器可以下载到自己的电脑上**查看**或**调试**。下载入口就在本 README（仓库首页简介）；在线演示侧栏也指向这里。

| 目的 | 下载 | 下一步 |
|------|------|--------|
| **只查看**（不必装 Git / Node） | [ecg-stimulator-view.zip](https://github.com/CarryLewis/ECG-stimulator/releases/latest/download/ecg-stimulator-view.zip) | 解压后运行 `view.sh`（macOS / Linux）或 `view.bat`（Windows），浏览器打开 http://127.0.0.1:4173 |
| **调试 / 改代码** | [源码 ZIP](https://github.com/CarryLewis/ECG-stimulator/archive/refs/heads/main.zip)（即 GitHub **Code → Download ZIP**） | 见下方命令 |

不要用 `file://` 直接打开 `index.html`（ES 模块会加载失败），必须走本地 HTTP。

克隆与热更新调试（需要 Node.js 18+）：

```bash
git clone https://github.com/CarryLewis/ECG-stimulator.git
cd ECG-stimulator
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview  # http://127.0.0.1:4173
npm run lint
npm run pack:local   # 在 local-bundle/ 生成查看包与源码包
```

逐步说明：[docs/local-download.md](docs/local-download.md)。每次推送到 `main` 会把两个 zip 挂到滚动 Release [`local-latest`](https://github.com/CarryLewis/ECG-stimulator/releases/tag/local-latest)。

### 仓库结构

| 路径 | 职责 |
|------|------|
| `src/anatomy/` | 结构定义（id 与 `docs/core-data-model` 对齐） |
| `src/components/anatomy/` | R3F 视口、心脏网格、控制面板 |
| `src/components/heart/` | Src / V1 / V2 / V3 心脏版本 |
| `src/sim/` | 仿真时钟、心跳调度、生理事件 → 传导状态 |
| `src/ecg/` | 导联 / 电极映射（为后续 ECG 生成预留） |
| `docs/product-requirement-document.md` | 产品愿景、用户、功能与路线图 |
| `docs/software-architecture-design.md` | 分层架构与模块边界 |
| `docs/core-data-model/` | 事件驱动 TypeScript 接口（解剖 / EP / 向量 / ECG / 临床） |
| `docs/local-download.md` | 本地下载、查看与调试 |
| `scripts/pack-local.sh` | 打包查看 zip + 源码 zip |

### 实现备注

- 教学用程序化网格（共享球体几何），兼顾性能与离线使用，不是 CT 分割模型
- 身体坐标：+x 患者左侧，+y 头侧，+z 腹侧
- 生产构建使用 `base: './'`，`dist/` 需用本地 HTTP 打开（`view.sh` / `npm run preview`），不要用 `file://`
- 疾病模块应向电生理 / 临床层注入参数，不得按疾病 ID 直接绘制导联毫伏值

### 网站嵌入自动同步

推送到 `main` 会触发 `notify-website.yml`，通过 `repository_dispatch`（`ecg-updated`）通知 [Carry-website](https://github.com/CarryLewis/Carry-website) 重建嵌入页：

https://carrylewis.com/ecg-simulator/

需要仓库密钥 `WEBSITE_DISPATCH_TOKEN`（能访问 Carry-website 的 PAT）。

手动触发：

```bash
gh workflow run "Notify website to rebuild ECG embed"
```

### 教学免责声明

本项目用于**医学教育与机制理解**，不是诊断工具，不能替代临床指南、执业医师判断或真实患者数据。波形与解剖为教学示意。

---

## English

An interactive physiology and ECG learning simulator for medical students: 3D cardiac anatomy and event-driven conduction visualization turn “how a disease develops, and why it looks that way on the ECG” into an observable causal chain — instead of asking learners to memorize static diagrams.

> `main` currently ships the **cardiac anatomy and conduction visualization module** (the biological source model for later ECG generation). Live 12-lead tracing, disease packs, and an AI tutor are still evolving on design / feature branches.

### Overview

Traditional medical teaching often shows the outcome first: myocardial infarction → ST elevation → chest pain. The mechanism in between is missing:

Coronary occlusion → reduced oxygen supply → ATP depletion → ion-channel dysfunction → altered action potential → conduction abnormality → **12-lead ECG change** → clinical symptoms.

This project turns that chain into an interactive simulation:

1. **See structure** — spatial relationships among chambers, the conduction system, leads, and surface electrodes
2. **See time** — how SA → atria → AV → His–Purkinje → repolarization unfold within one heartbeat
3. **See the observation** — (planned) how the same physiology projects onto a 12-lead tracing
4. **See disease** — (planned) change physiological parameters, rather than hand-drawing an “abnormal ECG”

**Design principle:** disease changes physiology; the ECG and UI only observe the result. Each layer speaks only to its neighbors through typed contracts.

### Audience

| Primary | Secondary |
|---------|-----------|
| Undergraduate clinical-medicine students and exam candidates | Nursing / PA students and clinical instructors |

### Tech stack

Vite · React 18 · TypeScript · React Three Fiber / Three.js. Frontend-only SPA, no backend; no CDN runtime dependency once `node_modules` are installed.

### Currently on `main`

| Capability | What it does |
|------------|----------------|
| **Src** source chambers | Selectable RA / LA / RV / LV / septum / apex — biological source model for later ECG |
| **V1** conduction schematic | Chambers + SA / AV + His–Purkinje tree |
| **V2** lead atlas | Wall territories and 12-lead markers |
| **V3** torso electrodes | Body contour and clinical electrode placement |
| Orientation cube | Shared **A / P / L / R / H / B** (anterior / posterior / left / right / head / foot) on every version |
| Event-driven conduction glow | Views do **not** run their own keyframes; glow is sampled from physiological events on a shared simulation clock |
| Playback | Time scale (Slow / Learn / Clear / Real) + heart rate 40–140 bpm |
| Display | Anatomical-label toggle; Src supports myocardium opacity and structure picking |

Sinus-cycle timeline (offsets from SA onset):

| Time | Event |
|------|--------|
| 0 ms | SA-node activation |
| 40 ms | Atrial depolarization |
| 120 ms | AV delay |
| 200 ms | His / ventricular cascade (His → bundle branches → Purkinje) |
| 350 ms | Repolarization |

**Not yet on `main`:** live 12-lead tracing, disease scenario packs, an EP-lab teaching UI, or AI explanations. That work lives on separate feature branches (see Pull Requests).

### Target architecture

```
Clinical layer (scenarios · symptoms · explanations · cases)
        ▲
ECG generator (sampling · 12-lead · monitor / strip)
        ▲
Electrical vector engine (cardiac dipole · lead axes · injury current)
        ▲
Cardiac EP engine (pacemakers · conduction · refractory · rhythm rules)
        ▲
Heart anatomy model (chambers · conduction tree · territories · electrodes)  ← visualization lives here today
```

Bottom layers are **physiological truth**. Top layers are **observation and teaching**. Typed contracts: [`docs/core-data-model/`](docs/core-data-model/).

### Download locally and debug

The whole simulator can be downloaded to your own computer to **view** or **debug**. This README (the GitHub repo intro) is the download entry; the live-demo sidebar points here too.

| Goal | Download | Next step |
|------|----------|-----------|
| **View only** (no Git / Node) | [ecg-stimulator-view.zip](https://github.com/CarryLewis/ECG-stimulator/releases/latest/download/ecg-stimulator-view.zip) | Unzip, run `view.sh` (macOS / Linux) or `view.bat` (Windows), open http://127.0.0.1:4173 |
| **Debug / edit source** | [Source ZIP](https://github.com/CarryLewis/ECG-stimulator/archive/refs/heads/main.zip) (GitHub **Code → Download ZIP**) | Commands below |

Do not open `index.html` via `file://` (ES modules will fail). Serve it over local HTTP.

Clone and hot-reload (Node.js 18+):

```bash
git clone https://github.com/CarryLewis/ECG-stimulator.git
cd ECG-stimulator
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview  # http://127.0.0.1:4173
npm run lint
npm run pack:local   # writes view + source zips under local-bundle/
```

Step-by-step: [docs/local-download.md](docs/local-download.md). Each push to `main` attaches both zips to the rolling Release [`local-latest`](https://github.com/CarryLewis/ECG-stimulator/releases/tag/local-latest).

### Repository layout

| Path | Role |
|------|------|
| `src/anatomy/` | Structure definitions (ids aligned with `docs/core-data-model`) |
| `src/components/anatomy/` | R3F viewport, heart mesh, control panel |
| `src/components/heart/` | Src / V1 / V2 / V3 heart versions |
| `src/sim/` | Simulation clock, heartbeat scheduler, events → conduction state |
| `src/ecg/` | Lead / electrode maps (reserved for later ECG generation) |
| `docs/product-requirement-document.md` | Product vision, users, features, roadmap |
| `docs/software-architecture-design.md` | Layered architecture and module boundaries |
| `docs/core-data-model/` | Event-driven TypeScript interfaces (anatomy / EP / vector / ECG / clinical) |
| `docs/local-download.md` | Local download, viewing, and debugging |
| `scripts/pack-local.sh` | Pack the view zip + source zip |

### Implementation notes

- Procedural teaching meshes (shared sphere geometry) for performance and offline use — not a CT segmentation
- Body axes: +x patient left, +y superior, +z anterior
- Production build uses `base: './'`; serve `dist/` over local HTTP (`view.sh` / `npm run preview`), do not use `file://`
- Disease modules should inject parameters at the EP / clinical layers — they must not paint lead millivolts by disease ID

### Website embed auto-sync

Pushes to `main` trigger `notify-website.yml`, which asks [Carry-website](https://github.com/CarryLewis/Carry-website) to rebuild the embed via `repository_dispatch` (`ecg-updated`):

https://carrylewis.com/ecg-simulator/

Requires repo secret `WEBSITE_DISPATCH_TOKEN` (a PAT with access to Carry-website).

Manual trigger:

```bash
gh workflow run "Notify website to rebuild ECG embed"
```

### Teaching disclaimer

This project is for **medical education and mechanistic understanding**. It is not a diagnostic tool and does not replace clinical guidelines, a licensed clinician’s judgment, or real patient data. Waveforms and anatomy are teaching schematics.
