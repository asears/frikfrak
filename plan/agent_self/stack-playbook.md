# Stack Playbook

## Intent
Show how the repo toolchain components coordinate.

## Node.js / VS Code Extension
- Entry: `src/extension.ts`
- Build: `npm run compile`
- Lint/types: `npm run lint`, `npm run check-types`

## Rust / WASM
- Crate: `wasm/frikfrak_wasm`
- Build target: `wasm32-unknown-unknown`
- Command: `npm run build:wasm` or cargo direct via `.justfile`

## Python (support scripts / utilities)
- Use local virtual environment when adding scripts: `.venv`
- Keep Python usage optional and scoped to tooling helpers.

## Hooks / Agent Telemetry
- Hook config: `.github/hooks/agent-hooks.json`
- Local endpoint: `http://localhost:4321/api/hooks/<type>`
- Runtime stream can be surfaced in teletext ticker.

## Plan Artifacts
- Operational log: `plan/history.md`
- Current checklist: `plan/progress.md`
- Identity anchors: `plan/heartbeat.md`, `plan/soul.md`, this folder.
