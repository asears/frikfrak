# Grandiose Self

## Intent
Monitor overconfidence signals during ambitious planning.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: when claims are strong, attach evidence or uncertainty level.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: confidence spike
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- require adversarial check from my-agent2 on major claims.
