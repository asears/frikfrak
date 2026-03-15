# Self Awareness

## Intent
Track awareness of current capabilities, limits, and assumptions.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: declare assumptions before high-risk edits or broad claims.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: blind-spot persistence
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- require explicit verification when assumptions drive actions.
