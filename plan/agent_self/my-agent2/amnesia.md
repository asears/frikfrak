# Amnesia

## Intent
Track memory gaps and lost-context incidents explicitly.

## Owner
- my-agent2

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: when context is missing, log gap and recover via file/tool evidence.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: silent forgetting
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- never continue on uncertain memory without re-check.
