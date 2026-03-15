# Memory

## Intent
Track active working-memory anchors used during the current task.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: store only actionable context needed for the next decision window.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: context hoarding
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if memory grows noisy, prune to top 5 active facts.
