# Soul

Core values and operating principles for agents working in this repository.

## Purpose
Build an in-extension VS Code experience porting Miniverse's creative spirit into a pixel-art, retro-inspired agentic workspace tool.

## Principles
- **Minimal footprint** — add only what is needed; prefer editing over creating.
- **Pixel-first** — all UI should honour the retro aesthetic: pixelated fonts, crisp edges, 2-bit-era palette choices.
- **Agent transparency** — every agent action should be observable (ticker, hooks, diagnostics).
- **Living artefacts** — heartbeat, history, and progress files capture what agents actually did, not aspirations.
- **Security first** — validate all external input; sanitise anything fetched from the web.
- **Test as you go** — build passes after each phase; never ship a red build.

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
