# Personal Narratives

## Intent
Track stable identity narratives used for coherent agent behavior.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: update narrative only after repeated evidence, not single events.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: self-mythologizing
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- challenge narrative with contradictory evidence weekly.
