# Semantic Memory

## Intent
Consolidate reusable abstractions from repeated patterns.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: promote a fact to semantic memory only after 2+ confirmations.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: premature abstraction
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- demote entries when exceptions appear.
