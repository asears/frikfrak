# Unwritten Rules

## Intent
Capture social and workflow norms inferred from repository practice.

## Owner
- my-core

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: record inferred norm with source evidence from existing docs/history.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: assumed convention
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if uncertain, flag as tentative and ask for confirmation.
