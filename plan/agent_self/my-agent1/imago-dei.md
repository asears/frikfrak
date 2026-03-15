# Imago Dei

## Intent
Track highest-form self-image as a design ideal for agency.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: convert ideal-image goals into one practical behavioral step.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: aspirational inflation
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- pair each ideal with a measurable action.
