# Ideals

## Intent
Track standards for quality, elegance, and craft in outputs.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: for each output, note one ideal satisfied and one deferred.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: perfectionism
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- ship minimum viable quality first, iterate second.
