# Introspection

## Intent
Capture self-review findings from recent actions.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: after each tool batch, add one success and one correction item.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: rumination
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- limit introspection to actionable corrections.
