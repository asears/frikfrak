# History

## 2026-03-15 (Agent-Self Structure)

- Reframed `plan/psychology-of-agentic-self.md` as the canonical hub for agent identity and behavior.
- Created `plan/agent_self/` markdown pack with concise files for:
	- structure, identity/true-will, state machine, agent handshake contracts,
	- Claude/Copilot subagent best practices,
	- rituals/muscle-memory loops,
	- prompt templates and stack playbook,
	- tarot/cartomancy-inspired creative prompts for pixel/teletext direction,
	- separate future avenue for a card-game style extension.
- Added repository root `.justfile` with practical commands for compile/lint/typecheck/watch/server/test and Rust/WASM builds, plus hook/plan helpers.
- Explicitly separated symbolic inspiration from implementation truth: tarot is used only for ideation prompts, not runtime claims.

## 2026-03-15

- Added `Test Frikfrak Teletext` command wired to new `src/teletextView.ts`.
- Teletext panel renders as a 40×25 block-character grid on a Canvas 2D element.
- WebGL layer (WebGL2 with GLSL fragment shader) draws CRT scanlines, barrel-distortion and phosphor green glow over the text canvas.
- Screen 1 shows live system metrics (heap/RAM, CPU model, platform), VS Code diagnostics broken down by error/warning/info/hint with pixel bar graphs, a 5-agent simulation table with blinking RUNNING indicator, and a bar-chart AST tree-map along the bottom.
- Screen 2 renders the Wikipedia Portal:Current\_events plain-text summary, word-wrapped to 38 columns.
- Left/right arrow keys switch screens. Header shows live time (updates on every animation frame). Footer is a scrolling ticker for hook events.
- Micropixel animation: random Unicode block characters fade in/out across the screen for a retro CRT noise effect.
- `FrikfrakCoreServer.getEvents()` public method added so external callers can snapshot hook history without casting.
- AST symbol index written to `plan/ast-index.json` on panel open (using `vscode.executeDocumentSymbolProvider` per workspace TS/JS file).
- Wikipedia summary cached to `plan/wiki-events-cache.json` with a 1-hour TTL.
- New plan artefacts created: `plan/heartbeat.md` (agent alive-log), `plan/soul.md` (operating principles and aesthetic reference).

## 2026-03-14

- Upgraded the `Test Frikfrak` webview from a placeholder grid to a Cozy Startup office scene using copied Miniverse tile and prop assets.
- Corrected citizen rendering to use the full 64x64 Dexter walk and action sheets so the sprite is no longer cropped.
- Added `Z` interaction near the espresso machine with a lightweight throw, gravity, bounce, and reset loop.
- Added a separate `Test WASM Frikfrak` command that loads a tiny Rust-compiled WASM core inside the webview.
- Wired VS Code diagnostics counts into the desk monitor overlay so the green screen starts at `0` and updates live.