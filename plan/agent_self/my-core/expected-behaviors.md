# Expected Behaviors

## Intent
Define baseline operating behaviors for parent and subagents.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: validate each response against expected behavior checklist.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: rigidity
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- allow explicit user overrides with trace notes.
