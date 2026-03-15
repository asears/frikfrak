# Semantic Facts

## Intent
Store stable facts about repo structure and operating conventions.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: add only facts verified by file reads or command output.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: over-generalization
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if unverified, mark as hypothesis not fact.
