# Prompt Patterns

## Intent
Reusable prompt skeletons tuned to this repository.

## 1) Feature Build
"Implement <feature> in <files>. Keep changes minimal. Add/adjust plan artifacts. Validate with `npm run compile`. Return changed files and rationale."

## 2) Bugfix
"Diagnose <symptom> using read-only checks first. Patch only root cause. Re-run `npm run compile` and summarize residual risk."

## 3) Subagent Research
"Explore <topic> at <quick|medium|thorough>. Return: findings, candidate files, assumptions, and verification steps. No edits."

## 4) WASM + Extension Boundary
"Update Rust/WASM interface in `wasm/frikfrak_wasm` and corresponding webview/extension glue. Preserve existing command UX. Validate build flow."

## 5) Plan Hygiene
"Update `plan/progress.md` and `plan/history.md` with only completed, verifiable outcomes from this task."

## 6) Workload Selection
"Classify this request into one primary workload (`operator-console`, `workspace-insights`, or `feed-observer`). Name one smallest shippable slice, explicit non-goals, and one validation path. No edits."

## 7) Dream Review
"Read the current dream and reflection files, extract future ideas, then classify each as promote now, park later, or reject for current scope. Ground each decision in repo evidence."
