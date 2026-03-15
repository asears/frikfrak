# Reflections

## Intent
Capture end-of-cycle synthesis and lessons learned.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: summarize what to keep, drop, and test next.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: abstract conclusions
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- attach each reflection to one practical next step.
