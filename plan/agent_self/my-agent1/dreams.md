# Dreams

## Intent
Collect long-horizon imaginative directions worth prototyping later.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: capture idea, then classify as now, next, or parked.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: novelty seeking
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if parked list grows, schedule one pruning review.
