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

## Notes
- Local hook endpoint target: `http://localhost:4321/api/hooks/claude-code`
- Initial client is an MVP webview implementation for quick iteration on movement and rendering.
- Assets copied from `miniverse/demo/public/universal_assets` and `miniverse/demo/public/worlds` into `assets/miniverse`.
- Test client now renders the Cozy Startup office directly from copied Miniverse tiles and prop art.
- Dexter uses 64x64 Miniverse frames, idles from the actions sheet, and switches to the walk sheet while moving.
- Press `Z` near the espresso machine to launch it with a simple gravity and bounce simulation.
- A minimal Rust WASM core now exposes frame and problem-count state for the dedicated WASM test client.
- Desk monitors render the current VS Code diagnostics count on a green screen overlay.
