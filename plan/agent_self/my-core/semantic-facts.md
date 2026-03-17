# Semantic Facts

## Owner
- my-core

## Current State
- summary: Verified repo facts now include three deterministic planning folders and a working teletext surface that already hosts metrics plus remote feed pages.
- confidence: high
- updated-at: 2026-03-17 00:00:00

## Recent Events
- Confirmed `plan/blueprints`, `plan/playbooks`, and `plan/runbooks` exist.
- Confirmed teletext currently supports metrics, Wikipedia, and NPR pages.
- Confirmed the extension already exposes hooks, diagnostics, AST indexing, and feed caches.
- Confirmed deterministic helper scripts now exist for workload-doc sync and timestamp generation.

## Evidence
- plan/blueprints/*, plan/playbooks/*, plan/runbooks/*
- src/teletextView.ts
- src/extension.ts
- plan/scripts/sync-deterministic-workloads.ps1
- plan/scripts/get-plan-timestamp.ps1

## Slant Snapshot
- Fact base is stronger and more directly tied to implementation surfaces.

## Next Checkpoint
- Add more facts only when a runtime or doc surface is directly verified.
