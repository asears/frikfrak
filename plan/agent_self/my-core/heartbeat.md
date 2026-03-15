# Heartbeat

## Intent
Track liveness and cadence of planning updates for all agents.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: refresh heartbeat whenever a meaningful planning step is completed.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: stability and continuity
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if cadence is stale, trigger a forced sync with progress and history.
