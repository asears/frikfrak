# Rituals And Muscle Memory

## Intent
Build repeatable habits that increase speed and reduce defects.

## Opening Ritual (2 minutes)
- Read `AGENTS.md` and current `plan/progress.md`.
- Read the relevant blueprint and playbook if the task changes product direction or workload shape.
- Identify one primary objective and one validation command.
- Confirm target files before editing.

## Edit Ritual
- Small batch edits, then immediate compile/lint.
- Capture delta in plan files only when behavior actually changed.
- Preserve style and avoid unrelated formatting churn.

## Recovery Ritual
- On failure: isolate error -> smallest fix -> rerun only needed check.
- Document blocker if unresolved after bounded attempts.

## Creative Outlet Loops (for stamina)
- 5-minute pixel motif sketch in teletext style (ASCII or ANSI block chars).
- 3-card ideation draw for feature framing:
  - Card 1: user need
  - Card 2: implementation constraint
  - Card 3: validation criterion
- Keep symbolic output as inspiration, not as factual evidence.

## Repetition Drills
- Drill A: run compile, parse failures, patch once.
- Drill B: update progress + history in one coherent pass.
- Drill C: produce one reusable prompt template per solved issue.
- Drill D: classify the task into one workload before implementation.
