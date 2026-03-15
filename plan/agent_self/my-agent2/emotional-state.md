# Emotional State

## Intent
Track affective tone that may bias planning choices.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: label current affective bias before major decisions.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: mood-congruent bias
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- run one neutral evidence review before acting.
