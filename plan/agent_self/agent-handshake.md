# Agent Handshake

## Intent
Define clean contracts for parent agent <-> subagent collaboration.

## Input Contract
- Task objective in one sentence.
- Constraints: safety, scope, file boundaries, test expectations.
- Required outputs: exact artifacts and acceptance criteria.
- Confidence target: quick/medium/thorough exploration level.

## Output Contract
- Findings ordered by severity or priority.
- Concrete file targets and suggested changes.
- Unknowns, assumptions, and residual risks.
- Validation notes (what was checked vs not checked).

## Handoff Rubric
- `Context`: what subagent saw.
- `Decision`: what was chosen and why.
- `Patch`: minimal edit set.
- `Verification`: compile/test/tool evidence.
- `Next`: immediate follow-up actions.

## Integration In This Repo
- Hook event stream: `.github/hooks/agent-hooks.json` + server hook endpoints.
- Teletext ticker can visualize handoff events as lightweight state telemetry.
