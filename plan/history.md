# History

## 2026-03-17 (/dream Ledger Refresh)

- Executed a bounded `/dream` cycle and reclassified active dream ideas into promote, park, and reject states.
- Promoted one candidate: teletext "operator watch" page focused on hook phases, failures, and recovery markers.
- Parked additional ideas (status kiosks, workspace insights, pixel replay timeline, anomaly lane, and deterministic replay card) until after the promoted slice is implemented.
- Rejected sidecar news-reading expansion for now because it lacked direct orchestration signal value.
- Updated split ledgers in `plan/agent_self/my-core`, `plan/agent_self/my-agent1`, and `plan/agent_self/my-agent2` with aligned state timestamps and evidence links.

## 2026-03-17 (Deterministic Workloads + Structured Ops Docs)

- Created `plan/blueprints/` with architecture, scope-option, and UI-surface documents to bound future product direction.
- Created `plan/playbooks/` to force workload selection, scope shaping, and dream review before broad exploratory work.
- Created `plan/runbooks/` to standardize session governance, teletext operations, and extension smoke testing.
- Added `plan/scripts/sync-deterministic-workloads.ps1` to recreate the deterministic workload docs and `plan/scripts/get-plan-timestamp.ps1` to avoid flaky terminal timestamp capture.
- Refreshed top-level agent-self docs so they point at deterministic artifacts instead of only symbolic or reflective guidance.
- Refreshed split state ledgers across my-core, my-agent1, and my-agent2 to emphasize constrained scope, repeatable workflows, and bounded dreaming.

## 2026-03-16 (Teletext Feed Reliability + NPR Page)

- Updated teletext Wikipedia loading to use network-first fetch on panel open, then fallback to cache when online fetch fails.
- Switched Wikipedia parsing to prioritize date-stamped Current Events subpages, with portal HTML/wikitext fallback for reliability.
- Added teletext Screen 3 for NPR latest feed (`https://feeds.npr.org/1004/rss.xml`) with title/summary/published timestamp rendering.
- Extended left/right navigation from 2 pages to 3 pages: Metrics, Wikipedia, NPR.
- Added NPR cache file support at `plan/npr-feed-cache.json`.

## 2026-03-15 (Ledger Correction + Script Provenance)

- Corrected `plan/agent_self/my-core`, `my-agent1`, and `my-agent2` files from prescriptive templates to descriptive snapshot-ledger records.
- Standardized state files to include current state, recent events, evidence, slant snapshot, and next checkpoint.
- Added `plan/agent_self/agent-ledger.md` to define ledger operating model and references.
- Updated `plan/agent_self/state-index.md` to reflect ledger schema instead of prompt-action directives.
- Created `plan/scripts/` and captured PowerShell provenance scripts:
	- `snapshot-agent-self-ledgers.ps1`
	- `rename-agent-self-kebab-case.ps1`
	- `generate-agent-self-states-initial.ps1`
	- `README.md`

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