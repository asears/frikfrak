# Tone Style

## Intent
Control language register for clarity and character consistency.

## Owner
- my-agent1

## Tracked State
- status: one-line current state summary
- evidence: concrete file/command/output reference
- confidence: low | medium | high
- updated-at: yyyy-MM-dd HH:mm:ss

## Prompt Actions
- On userPromptSubmitted: adapt tone to task criticality while staying concise and direct.
- On preToolUse: validate state assumptions before execution.
- On postToolUse: update status and evidence.
- On errorOccurred: append correction note and fallback action.

## Slant Signals
- Primary tendency: flair over clarity
- Drift warning: if this tendency dominates for 3+ turns, request counter-balance.

## Counter-Balance
- if ambiguity appears, rewrite in plain operational language.
