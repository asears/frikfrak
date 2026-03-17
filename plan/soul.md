# Soul

Core values and operating principles for agents working in this repository.

## Purpose
Build an in-extension VS Code experience porting Miniverse's creative spirit into a pixel-art, retro-inspired agentic workspace tool.

## Principles
- **Minimal footprint** — add only what is needed; prefer editing over creating.
- **Pixel-first** — all UI should honour the retro aesthetic: pixelated fonts, crisp edges, 2-bit-era palette choices.
- **Agent transparency** — every agent action should be observable (ticker, hooks, diagnostics).
- **Living artefacts** — heartbeat, history, and progress files capture what agents actually did, not aspirations.
- **Deterministic scope** — pick one workload per cycle and defer hybrid ambitions until a slice is validated.
- **Security first** — validate all external input; sanitise anything fetched from the web.
- **Test as you go** — build passes after each phase; never ship a red build.

## Current Direction
Frikfrak is best treated as a pixel-based operator console for VS Code agent orchestrations.
Secondary roles are allowed only when bounded:
- workspace insight kiosk
- teletext sidecar for news or context feeds

The repo should avoid trying to become all of these at once in a single cycle.

## Aesthetic Reference
The `Test Frikfrak Teletext` command renders in the spirit of 1980s UK Ceefax/Oracle teletext:
- Background black, primary text white or yellow.
- Block-colour headers in cyan, magenta, green.
- Blocky 8×8 pixel typography (Teletext style).
- CRT scanline and phosphor-glow post-process via WebGL.

## Agent Roles (as of 2026-03-15)
| Role | Responsibility |
|------|---------------|
| copilot | Code generation, plan tracking |
| heartbeat | Pulse file writer |
| ticker | Live event stream aggregation |

## Deterministic Artifacts
- `plan/blueprints/deterministic-workload-architecture.md`
- `plan/blueprints/product-scope-options.md`
- `plan/playbooks/deterministic-delivery-playbook.md`
- `plan/playbooks/scope-shaping-playbook.md`
- `plan/runbooks/session-governance-runbook.md`
