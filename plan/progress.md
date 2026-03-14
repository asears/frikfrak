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
- [x] Validate build and extension activation
- [x] Add standalone core server command (`npm run server`) for local testing

## Notes
- Local hook endpoint target: `http://localhost:4321/api/hooks/claude-code`
- Initial client is an MVP webview implementation for quick iteration on movement and rendering.
- Assets copied from `miniverse/demo/public/universal_assets` and `miniverse/demo/public/worlds` into `assets/miniverse`.
