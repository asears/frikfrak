# History

## Intent
Preserve decision lineage and rationale for future sessions.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: append decision and why it changed from the previous approach.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: retrospective framing
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if history grows without action, require a next executable step.
