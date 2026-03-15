# Agent Ledger

## Purpose
Maintain an append-oriented, evidence-backed record of agent state across sessions.
This ledger describes what is currently true and what previously happened.

## Ledger Model Used Here
- Unit: one state file per concept under plan/agent_self/my-core, my-agent1, my-agent2.
- Record shape: current summary + recent events + evidence + slant snapshot + next checkpoint.
- Evidence preference: repo files and command outputs over narrative claims.

## Why This Pattern
- Supports continuity when context windows reset.
- Makes behavior drift auditable.
- Keeps state claims falsifiable and maintainable.

## Update Cadence
- Update after major plan edits, script runs, failures, or user-course corrections.
- Preserve prior events; do not rewrite history into prescriptions.

## Minimal Integrity Rules
- Every non-trivial state claim should cite evidence.
- Confidence should reflect evidence quality, not preference.
- Slant entries should describe observed direction, not intended personality.

## Worked Drift-Repair Example
- Observation: my-agent1/grandiose-self.md reports confidence spike with medium evidence.
- Counter-check: my-agent2/adult-ego.md records arbitration note and requests one additional evidence source.
- Consolidation: my-core/progress.md appends correction event with updated confidence.
- Outcome: slant-audit.md logs drift as resolved in next checkpoint cycle.

## Related Files
- state-index.md
- slant-audit.md
- wiki-grounding.md
- ../history.md
- ../progress.md

## Reference Documentation
- Martin Fowler, Event Sourcing: https://martinfowler.com/eaaDev/EventSourcing.html
- Martin Fowler, CQRS: https://martinfowler.com/bliki/CQRS.html
- OpenTelemetry Concepts (for trace-friendly event recording ideas): https://opentelemetry.io/docs/concepts/
- Hyperledger Fabric Docs (append-oriented ledger concepts): https://hyperledger-fabric.readthedocs.io/
- AWS QLDB Concepts (immutable journal + derived state pattern): https://docs.aws.amazon.com/qldb/latest/developerguide/concepts.html

## Local Scripts
- ../scripts/snapshot-agent-self-ledgers.ps1
- ../scripts/rename-agent-self-kebab-case.ps1
- ../scripts/generate-agent-self-states-initial.ps1
