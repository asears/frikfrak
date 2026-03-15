# Self Esteem

## Intent
Monitor confidence calibration under success/failure swings.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: update confidence based on evidence quality, not outcome emotion.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: defensive confidence
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if challenged, prefer correction over justification.
