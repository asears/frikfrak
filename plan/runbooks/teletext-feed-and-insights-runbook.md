# Teletext Feed And Insights Runbook

## Purpose
Operate Frikfrak's teletext surface as a stable read-only monitor for insights and external context.

## Existing Signals
- diagnostics by severity
- agent simulation rows
- AST index summary
- Wikipedia current events
- NPR feed
- hook-event ticker

## When Adding A New Teletext Page
1. Confirm it belongs to the active workload.
2. Define one source and one fallback.
3. Decide whether the page is:
- orchestration signal
- workspace insight
- external context
4. Add caching if the source is remote.
5. Preserve arrow navigation clarity.
6. Update plan docs and state ledgers.

## Guardrails
- Do not add remote sources without cache and graceful fallback.
- Do not mix raw truth and speculation on the same page.
- Do not let feed pages outnumber operator pages.

## Good Future Candidates
- VS Code extension inventory summary
- settings snapshot page
- task status page
- Hacker News or Hackernoon sidecar page only if it supports the active workload

