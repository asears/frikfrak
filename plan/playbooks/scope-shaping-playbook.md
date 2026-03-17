# Scope Shaping Playbook

## Intent
Keep Frikfrak from drifting into an undifferentiated mix of portal, dashboard, game, and feed reader.

## Questions To Answer Before Work Starts
- What single job is this slice doing?
- Which existing UI surface owns that job?
- What is the smallest proof that the slice works?
- What tempting adjacent ideas must be excluded?

## Scope Labels
- core-now: directly improves the chosen workload and current extension behavior.
- sidecar-later: useful, but not needed for this slice.
- parked-dream: interesting idea retained only in dreams or blueprints.

## Decision Rules
- Prefer constraints over optionality.
- Prefer one excellent page over three partial views.
- Prefer existing runtime signals over new integrations.
- Prefer docs that sharpen selection over docs that widen possibility.

## Useful Constraint Examples
- one new page only
- one new signal source only
- one validation path only
- one command surface only

## Escalation
If scope feels broad, move ideas into:
- plan/blueprints/
- plan/playbooks/
- plan/agent_self/my-agent1/dreams.md

