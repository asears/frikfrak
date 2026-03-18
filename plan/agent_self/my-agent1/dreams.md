# Dreams

## Owner
- my-agent1

## Current State
- summary: A new dream was promoted: Rust-based teletext with ntsc-rs VHS effects, rendered via WASM + Canvas overlay. This expands the teletext direction without violating the single-workload gate because it is a parallel signal processor for the same operator-watch data.
- confidence: high
- updated-at: 2026-03-18 00:00:00

## Recent Events
- User requested a Rust teletext variant leveraging ntsc-rs for authentic VHS/NTSC artifact emulation.
- Evaluated this against the promotion gate: it has a matching workload (operator-console), one clear UI surface (40×25 + VHS overlay), a bounded signal set (hook events same as Dream 1), and a straightforward validation path (render test card, apply NTSC filter, compare visual quality).
- Promoted this as Dream 1b, a parallel technical exploration of the same operator-watch concept with different visual filtering.

## Evidence
- plan/playbooks/dream-review-playbook.md
- plan/blueprints/product-scope-options.md
- https://github.com/ntsc-rs/ntsc-rs (VHS effect library, Rust, multithreaded, real-time)

## Additional Dreams
- Dream 1 (promote now): teletext "operator watch" page (TypeScript/WebGL CRT) showing live hook phases, failure counts, and recovery markers.
- Dream 1b (promote now): Rust-based teletext variant with ntsc-rs VHS/NTSC effects as an alternate visual encoding for the same operator-watch data. Start with test card (bnt.jpg), render via WASM + Canvas, iterate on signal-processing fidelity.
- Dream 2 (park): desk monitors in the Cozy Startup world as agent-specific status kiosks after the teletext watch pages ship.
- Dream 3 (park): bounded workspace-insight page for enabled extensions, active tasks, and repo signals.
- Dream 4 (reject for now): sidecar reading page (Hackernoon/Hacker News) because it lacks a direct orchestration signal path.
- Dream 5 (park): replayable orchestration timeline rendered as pixel scenes rather than plain logs.
- Dream 6 (park): hook-event "anomaly lane" that highlights repeated tool errors over a short rolling window.
- Dream 7 (park): deterministic run replay card that compares expected versus observed agent phase transitions.

## Slant Snapshot
- Imagination is strong and strategic: both Dream 1 and 1b explore the same core workload (operator-watch) with different visual languages, so promoting both does not breach scope discipline.

## Next Checkpoint
- Implement Dream 1 and Dream 1b in parallel: TypeScript gets CRT scanline polish, Rust experiments with ntsc-rs library on test card and hook-event signal flow.
