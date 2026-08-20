# ECG Stimulator

**Interactive Physiology & ECG Learning Simulator**

面向医学生的交互式生理与心电图学习模拟器：用三维心脏解剖和事件驱动的传导可视化，把「疾病如何发生、为何在 ECG 上这样表现」连成一条可观察的因果链，而不是让人背静态图。

An interactive medical-education platform that lets learners **see** how physiology, pathology, and clinical ECG findings connect — instead of memorizing waveforms in isolation.

[Live demo](https://carrylewis.com/ecg-simulator/) · [产品需求 PRD](docs/product-requirement-document.md) · [架构设计](docs/software-architecture-design.md)

> 本仓库当前 `main` 已落地的是**心脏解剖与传导可视化模块**（ECG 生成的生物学源模型）。十二导联实时描记、疾病包与 AI 导师仍在设计 / 功能分支中演进。

---

## 项目概况

传统医学教育常把结果摆在学生面前：心肌梗死 → ST 抬高 → 胸痛。中间缺失的是机制：

冠状动脉闭塞 → 供氧下降 → ATP 耗竭 → 离子通道障碍 → 动作电位改变 → 传导异常 → **十二导联 ECG 变化** → 临床症状。

本项目的目标是把这条链做成可交互的模拟环境：

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

---

## 当前已实现（`main`）

| 能力 | 说明 |
|------|------|
| **Src** 源心腔 | 可选中的 RA / LA / RV / LV / 室间隔 / 心尖，作为后续 ECG 的生物学源模型 |
| **V1** 传导示意 | 心腔 + SA / AV + His–Purkinje 树 |
| **V2** 导联图谱 | 室壁供血区域与 12 导联标记 |
| **V3** 躯干电极 | 体表轮廓与临床电极放置 |
| 方位立方 | 每个版本共用 **A / P / L / R / H / B**（前/后/左/右/头/足） |
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

---

## 目标架构

```
临床层（情景 · 症状 · 讲解 · 病例）
        ▲
ECG 生成（采样 · 12 导联 · 监护/记录条）
        ▲
电向量引擎（心电偶极 · 导联轴 · 损伤电流）
        ▲
心脏电生理引擎（起搏 · 传导 · 不应期 · 节律规则）
        ▲
心脏解剖模型（心腔 · 传导树 · 供血区域 · 电极几何）  ← 当前可视化落在这一层
```

底层是**生理真相**，上层是**观察与教学**。类型契约见 [`docs/core-data-model/`](docs/core-data-model/)。

---

## 本地运行

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

```bash
npm run build
npm run preview  # http://127.0.0.1:4173
npm run lint
```

需要 Node.js 18+。

---

## 仓库结构

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

### 实现备注

- 教学用程序化网格（共享球体几何），兼顾性能与离线使用，不是 CT 分割模型
- 身体坐标：+x 患者左侧，+y 头侧，+z 腹侧
- 生产构建使用 `base: './'`，`dist/` 可从本地目录直接打开

---

## 网站嵌入自动同步

推送到 `main` 会触发 `notify-website.yml`，通过 `repository_dispatch`（`ecg-updated`）通知 [Carry-website](https://github.com/CarryLewis/Carry-website) 重建嵌入页：

https://carrylewis.com/ecg-simulator/

需要仓库密钥 `WEBSITE_DISPATCH_TOKEN`（能访问 Carry-website 的 PAT）。

手动触发：

```bash
gh workflow run "Notify website to rebuild ECG embed"
```

---

## 教学免责声明

本项目用于**医学教育与机制理解**，不是诊断工具，不能替代临床指南、执业医师判断或真实患者数据。波形与解剖为教学示意。

---

## Overview (English)

ECG Stimulator is the public codebase for an **Interactive Physiology & ECG Learning Simulator**. The long-term product is a layered cardiac-electrophysiology platform:

**anatomy → electrophysiology → electrical vector → 12-lead ECG → clinical teaching**

`main` currently ships the first visualization module: the heart as the **biological source model** for later ECG generation — four interchangeable 3D views, a shared orientation cube, and **event-driven conduction glow** sampled from a physiological simulation clock (not hand-authored keyframes).

Planned (and prototyped on feature branches): live 12-lead sampling, physiology-driven disease packs (STEMI, block, AF/flutter, electrolytes, …), an EP-lab teaching UI, and an AI tutor that explains *why* a tracing looks the way it does.

### Design notes

- Procedural meshes (shared sphere geometry) for performance and offline use
- Body axes: +x patient left, +y superior, +z anterior
- No CDN runtime dependency once `node_modules` are installed
- Disease modules should inject parameters at the EP / clinical layers — they must not paint lead millivolts by disease ID
