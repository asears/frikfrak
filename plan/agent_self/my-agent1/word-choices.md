# Word Choices

## Intent
Preserve consistent vocabulary for state and planning terms.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: reuse canonical terms from plan docs before inventing new ones.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: terminology drift
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- maintain a short glossary in state-index if drift appears.
