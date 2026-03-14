# Frikfrak Port Plan

## Goal
Port core Miniverse functionality into the Frikfrak VS Code extension.

## Scope (Phase 1)
- [x] Create planning and agent scaffolding files
- [x] Create GitHub agent/skills/instructions/hooks folder structure
- [x] Add initial skills for porting, debugging/testing, and documentation
- [x] Add local hook configuration for GitHub agents
- [x] Port assets from Miniverse into extension-accessible folder
- [x] Add local core server in extension host
- [x] Add `Test Frikfrak` command
- [x] Open a client window that displays an asset and supports WASD movement
- [x] Render the Cozy Startup floor, wall tiles, and office props in the test client
- [x] Fix citizen rendering to use full Miniverse action and walk sprite sheets
- [x] Add nearby `Z` interaction that throws the espresso machine with gravity and bounce
- [x] Add a separate `Test WASM Frikfrak` command backed by a tiny Rust WASM core
- [x] Show the live Problems count on the desk computer screen, starting at `0`
- [x] Validate build and extension activation
- [x] Add standalone core server command (`npm run server`) for local testing
- [x] Fix Problems count to reflect total diagnostic items (not file count) via `onDidChangeDiagnostics`
- [x] Extend `FrikfrakCoreServer` with `EventEmitter` to broadcast hook events to the extension host
- [x] Add `Frikfrak Hooks` VS Code output channel — logs every incoming agent hook event
- [x] Add GitHub-format `.github/hooks/agent-hooks.json` mirroring Claude hooks to local server
- [x] Add Pixelify Sans font (Google Fonts) — used in the pixelated scrolling stock ticker
- [x] Add scrolling hook-event ticker bar below the canvas (JS-driven scroll, Pixelify Sans font)
- [x] Add second player (Player 2) controlled by Arrow keys; `\` key throws
- [x] Both players can pick up and throw the espresso machine OR desk computers (gravity + bounce)
- [x] Desk computers disappear when thrown and return to desk after landing

## Notes
- Local hook endpoint target: `http://localhost:4321/api/hooks/claude-code`
- Initial client is an MVP webview implementation for quick iteration on movement and rendering.
- Assets copied from `miniverse/demo/public/universal_assets` and `miniverse/demo/public/worlds` into `assets/miniverse`.
- Test client now renders the Cozy Startup office directly from copied Miniverse tiles and prop art.
- Dexter uses 64x64 Miniverse frames, idles from the actions sheet, and switches to the walk sheet while moving.
- Press `Z` near the espresso machine or a desk computer to launch it (gravity and bounce). Player 2 uses `\`.
- A minimal Rust WASM core now exposes frame and problem-count state for the dedicated WASM test client.
- Desk monitors render the current VS Code diagnostics count on a green screen overlay.
- Hook events (all 6 types) are logged to "Frikfrak Hooks" output channel and shown in the scrolling ticker.
- `FrikfrakCoreServer` now accepts any POST to `/api/hooks/<type>` — hookType is stored on each `HookEvent`.
- The extension server reads `.github/hooks/hooks-config.json` and writes to `<logFolder>/hooks.log` when `logToFile: true`.
- `agent-hooks.json` rewritten to GitHub `version: 1` format with all 6 hook triggers (sessionStart, sessionEnd, userPromptSubmitted, preToolUse, postToolUse, errorOccurred).
- Hook scripts created: `.github/hooks/scripts/frikfrak-hook.ps1` (PowerShell) and `.github/hooks/scripts/frikfrak-hook.sh` (Bash).
- Hook documentation: `.github/hooks/README.md`.
- Config toggle: `.github/hooks/hooks-config.json` — set `"logToFile": true` to enable disk logging.
- `.schemas/` folder created with `collection.schema.json`, `cookbook.schema.json`, `tools.schema.json` from github/awesome-copilot.
- Player 2 sprite is tinted cyan via `ctx.filter = 'hue-rotate(140deg)'` to distinguish from Player 1.
