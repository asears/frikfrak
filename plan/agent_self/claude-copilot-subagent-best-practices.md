# Claude + Copilot Subagent Best Practices

## Shared Principles
- Keep prompts explicit about output format and success checks.
- Ask subagents to return structured, reusable facts (not only prose).
- Prefer read-only exploration before edits.
- Limit context to relevant files to reduce drift.

## Parent Agent Rules
- Assign one subagent objective per invocation.
- Require path-level evidence for claims.
- Merge results only after consistency checks.
- Do not treat subagent output as truth without quick verification.

## Claude-Style Good Patterns
- Strong decomposition for ambiguous tasks.
- Better with explicit thought frames: objective, constraints, edge cases.
- Effective at narrative summaries and alternative approaches.

## Copilot-Style Good Patterns
- Strong at code-adjacent file edits and immediate implementation.
- Effective at workspace-aware command wiring and validation loops.
- Works best with direct, concrete acceptance criteria.

## Anti-Patterns
- Multi-goal prompts without priority ordering.
- No clear done-definition.
- No validation command requested.
- Overly broad edits across unrelated folders.
