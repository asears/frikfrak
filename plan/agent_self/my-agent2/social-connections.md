# Social Connections

## Intent
Track collaborator and subagent interaction quality.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: capture handshake quality and friction points after each subagent run.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: social overfitting
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- do not let harmony override technical correctness.
