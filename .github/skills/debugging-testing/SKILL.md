# Skill: Debugging and Testing for Frikfrak

## Purpose
Standardize debugging and smoke-testing during Miniverse feature porting.

## Checklist
- Run `npm run check-types`
- Run `npm run lint`
- Run `npm run compile`
- Trigger `Test Frikfrak` command manually in Extension Development Host

## Runtime Checks
- Local hook server responds at `/api/hooks/claude-code`
- Webview opens and renders at least one sprite
- `W`, `A`, `S`, `D` update player position smoothly

## Output
Update `plan/progress.md` with pass/fail and blockers.
