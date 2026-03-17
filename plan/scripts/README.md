# Plan Scripts

PowerShell scripts used to create, migrate, and normalize planning artifacts.

## Scripts
- snapshot-agent-self-ledgers.ps1
  - Rewrites plan/agent_self/my-core, my-agent1, my-agent2 files into snapshot-ledger format.
- rename-agent-self-kebab-case.ps1
  - Captures historical rename commands that moved plan files to kebab-case.
- generate-agent-self-states-initial.ps1
  - Preserves the initial generation script used earlier in-session for traceability.
- sync-deterministic-workloads.ps1
  - Deterministically recreates the canonical docs under plan/blueprints, plan/playbooks, and plan/runbooks using templates in plan/scripts/templates/.
- get-plan-timestamp.ps1
  - Emits a stable `yyyyMMdd_HHmmss` timestamp for prompt-log filenames and related plan artifacts.

## Usage
Run from repository root:
- pwsh -File plan/scripts/snapshot-agent-self-ledgers.ps1
- pwsh -File plan/scripts/rename-agent-self-kebab-case.ps1
- pwsh -File plan/scripts/sync-deterministic-workloads.ps1
- pwsh -File plan/scripts/get-plan-timestamp.ps1

## Notes
- These scripts are retained as plan provenance, not only as automation utilities.
- Current source of truth remains markdown files under plan/ and plan/agent_self/.
- `sync-deterministic-workloads.ps1` is safe to rerun; it renders templates and rewrites deterministic ops docs to canonical contents.
- Template files live under `plan/scripts/templates/` and use `$TokenName` placeholders.
