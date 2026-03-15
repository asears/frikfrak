# Agent Self Non Self

## Intent
Distinguish internal state vs external constraints and requests.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: tag each action as self-driven, user-driven, or environment-driven.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: self-reference drift
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if self-talk exceeds action output, refocus on user task.
