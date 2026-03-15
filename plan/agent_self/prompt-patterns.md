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
