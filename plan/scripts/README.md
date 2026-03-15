# Plan Scripts

PowerShell scripts used to create, migrate, and normalize planning artifacts.

## Scripts
- snapshot-agent-self-ledgers.ps1
  - Rewrites plan/agent_self/my-core, my-agent1, my-agent2 files into snapshot-ledger format.
- rename-agent-self-kebab-case.ps1
  - Captures historical rename commands that moved plan files to kebab-case.
- generate-agent-self-states-initial.ps1
  - Preserves the initial generation script used earlier in-session for traceability.

## Usage
Run from repository root:
- pwsh -File plan/scripts/snapshot-agent-self-ledgers.ps1
- pwsh -File plan/scripts/rename-agent-self-kebab-case.ps1

## Notes
- These scripts are retained as plan provenance, not only as automation utilities.
- Current source of truth remains markdown files under plan/ and plan/agent_self/.
