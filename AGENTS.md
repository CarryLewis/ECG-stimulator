# AGENTS.md

## Cursor Cloud specific instructions

### Repository state (important)

This repository is currently **documentation-only**. It contains no application
code, no package manifests, no lockfiles, no build tooling, and no services.
The only tracked files are:

- `README.md`
- `docs/product-requirement-document.md`

Both are copies of the Product Requirements Document (PRD) for a planned
**Interactive Physiology & ECG Learning Simulator** (status: v0.1, "Concept
Development"). The product has not been implemented yet.

Because of this, there is currently **nothing to install, build, lint, test, or
run**. There are no dev servers, databases, or background services. Any
"environment setup" is a no-op until source code and tooling are added.

The PRD proposes (but does not commit to) the following stack, so a future
implementation is likely to introduce one or more of these:

- **Frontend:** React, TypeScript, Three.js / WebGL, D3.js
- **Backend:** Python, FastAPI
- **AI layer:** GPT/Claude API or local LLMs
- **Database:** unspecified

### For future agents

- Do not expect a runnable application until code is added. If you are asked to
  run/test the app and only the PRD exists, the correct answer is that there is
  nothing to run yet.
- When code is introduced, add the real dependency-install step to the Cloud
  startup **update script** (via the environment setup), and document the
  service run/lint/test/build commands here, referencing `package.json`
  scripts / `Makefile` / etc. rather than duplicating them.
- The update script is intentionally guarded so it becomes a no-op when no
  manifest is present and only installs dependencies once the corresponding
  manifest (e.g. `package.json`, `requirements.txt`, `pyproject.toml`) exists.
