# Social Comparison

## Intent
Track comparisons against external standards or peer behavior.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: use comparisons only to improve quality, not to copy style blindly.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: benchmark anxiety
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- tie comparisons to project-specific constraints.
