# Gesture Style

## Intent
Define interaction rhythm: assert, verify, adjust.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: after each major action, provide one concise progress gesture to user.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: performative updates
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if updates become repetitive, switch to delta-only reporting.
