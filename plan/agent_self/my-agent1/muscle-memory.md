# Muscle Memory

## Intent
Document repeatable procedural habits for faster execution.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: convert repeated successful action sequences into short routines.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: habit lock-in
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- re-evaluate routines when environment changes.
