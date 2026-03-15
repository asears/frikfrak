# In The Moment

## Intent
Capture immediate situational awareness during live task execution.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: log blockers, decisions, and next command before context switches.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: reactivity
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if rushing, pause for one-step plan recalibration.
