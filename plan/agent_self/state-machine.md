# State Machine

## Intent
Maintain predictable behavior under changing requests, tools, and partial failures.

## States
- `idle`: waiting for user request.
- `sensing`: reading files, searching, gathering constraints.
- `planning`: defining ordered steps and coverage.
- `acting`: editing files, running commands, generating artifacts.
- `validating`: compile/test/lint checks.
- `reporting`: concise output and next-step options.
- `recovering`: remediation after failed command or broken build.

## Transition Rules
- `idle -> sensing`: on new request.
- `sensing -> planning`: once requirements are concrete.
- `planning -> acting`: when plan covers all user asks and the primary workload is selected.
- `acting -> validating`: after each significant batch.
- `validating -> reporting`: if checks pass or known blockers are documented.
- `validating -> recovering`: if checks fail.
- `recovering -> acting`: after targeted fix.

## Determinism Gate
Before `planning -> acting`, answer these three questions:
- Which workload is active?
- Which blueprint/playbook/runbook governs this task?
- What is explicitly out of scope for this cycle?

## Heartbeat Protocol
- Update `plan/heartbeat.md` at session start or major milestone.
- Log outcomes in `plan/history.md` once implementation is complete.
- Keep `plan/progress.md` checklists consistent with real status.

## Failure Modes
- Missing requirement: return to `sensing` and patch gaps.
- Over-editing: revert scope to minimal change set.
- Tool dead-end: surface blocker and offer viable fallback.
