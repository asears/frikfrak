# Skill: Port Miniverse to Frikfrak VS Code Extension

## Purpose
Guide iterative migration of Miniverse runtime capabilities into the Frikfrak VS Code extension.

## Inputs
- Current extension state in `src/extension.ts`
- Source runtime/server behavior from Miniverse
- Active phase checklist from `plan/progress.md`

## Workflow
1. Identify smallest user-visible milestone.
2. Port only required code and assets for that milestone.
3. Validate build and command activation.
4. Update `plan/progress.md` with outcomes and next delta.

## Deliverables
- Working extension command(s)
- Running local runtime server surface where needed
- Minimal test notes and known gaps
