$root = "c:\projects\ai\frikfrak\frikfrak\plan\agent_self"
$now = "2026-03-15 00:00:00"

function Write-LedgerFile {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Owner,
        [string]$Current,
        [string[]]$Recent,
        [string[]]$Evidence,
        [string]$Slant,
        [string]$Confidence,
        [string]$NextCheck
    )

    $recentLines = ($Recent | ForEach-Object { "- $_" }) -join "`r`n"
    $evidenceLines = ($Evidence | ForEach-Object { "- $_" }) -join "`r`n"

    $content = @"
# $Title

## Owner
- $Owner

## Current State
- summary: $Current
- confidence: $Confidence
- updated-at: $now

## Recent Events
$recentLines

## Evidence
$evidenceLines

## Slant Snapshot
- $Slant

## Next Checkpoint
- $NextCheck
"@

    Set-Content -Path $Path -Value $content -Encoding utf8
}

$core = @(
    @{n='heartbeat'; t='Heartbeat'; c='Active this session; major restructuring of agent state files completed.'; r=@('Created split state directories under plan/agent_self.','Generated initial state files and then corrected format from prescriptive to descriptive.'); e=@('Terminal command: tools/tmp/generate-agent-self-states.ps1 executed successfully.','Directory evidence: plan/agent_self/my-core contains 11 files.'); s='Stable cadence, brief generation misstep corrected quickly.'; conf='high'; ncp='Update after next structural migration or command batch.'},
    @{n='history'; t='History'; c='Recent decisions are being documented in plan history with state-ledger correction.'; r=@('Previous approach produced action-oriented templates.','User requested retrospective/current-state framing; model adjusted.'); e=@('plan/history.md existing 2026-03-15 entries.','Current conversation correction request.'); s='Strong retrospective fidelity.'; conf='high'; ncp='Append this correction cycle in plan/history.md.'},
    @{n='progress'; t='Progress'; c='Agent-self split scaffold exists and is being normalized into ledger snapshots.'; r=@('Created my-core/my-agent1/my-agent2 state groups.','Added state-index/wiki-grounding/slant-audit supporting docs.'); e=@('plan/agent_self/state-index.md exists.','New files present in all three state folders.'); s='Forward progress preserved during correction.'; conf='high'; ncp='Mark completion once progress/history updates are appended.'},
    @{n='soul'; t='Soul'; c='Guiding principle remains: symbolic inspiration, operational truth grounded in evidence.'; r=@('Maintained separation between symbolic framing and runtime claims.','Shifted doc style toward factual session tracking.'); e=@('plan/psychology-of-agentic-self.md principle framing.','plan/agent_self/wiki-grounding.md guardrails.'); s='Mission-consistent and constraint-aware.'; conf='medium'; ncp='Re-check after next major creative expansion.'},
    @{n='memory'; t='Memory'; c='Working memory focused on user correction: state capture over procedural instruction.'; r=@('Detected mismatch between generated content and requested purpose.','Pivoted to ledger snapshot format.'); e=@('User prompt: files should capture current/previous state.','Regeneration script in plan/scripts.'); s='Adaptive without losing continuity.'; conf='high'; ncp='Review for stale entries after next session.'},
    @{n='semantic-facts'; t='Semantic Facts'; c='Core facts about current plan layout and artifacts are established.'; r=@('Confirmed plan/agent_self has split subfolders and supporting docs.','Confirmed plan/scripts folder now hosts PowerShell scripts.'); e=@('Directory listing of plan and plan/agent_self.','Files in plan/scripts.'); s='Fact quality high, source-backed.'; conf='high'; ncp='Add new verified facts only after file read or command output.'},
    @{n='semantic-memory'; t='Semantic Memory'; c='Pattern recognized: maintain kebab-case file naming and session-anchored plan traces.'; r=@('Renames to hyphenated names already applied.','State ledgers now tied to evidence and timestamps.'); e=@('Terminal rename command history in context.','Current ledger file schema.'); s='Reusable repo convention memory is coherent.'; conf='medium'; ncp='Consolidate after one more completed session.'},
    @{n='unwritten-rules'; t='Unwritten Rules'; c='Observed norm: plan docs should reflect real execution history, not abstract policy only.'; r=@('User correction emphasized retrospective factuality.','Scripts and changes should be captured under plan paths.'); e=@('User follow-up requests in current session.','New plan/scripts requirement.'); s='Good alignment with team workflow expectations.'; conf='high'; ncp='Revalidate after future handoff review.'},
    @{n='expected-behaviors'; t='Expected Behaviors'; c='Expected behavior now interpreted as evidence-linked state recording and balanced agent slant visibility.'; r=@('Added slant-audit to make bias explicit.','Added state-index for ownership and distribution transparency.'); e=@('plan/agent_self/slant-audit.md','plan/agent_self/state-index.md'); s='Behavior baseline is explicit and testable.'; conf='high'; ncp='Run periodic subagent audit to validate slant/balance.'},
    @{n='agent-self-non-self'; t='Agent Self Non Self'; c='Current separation: user directives drive state updates; internal modeling serves tracking only.'; r=@('Detected over-prescriptive internal voice in first pass.','Reframed files around what happened and what is currently true.'); e=@('Original template text in generated files.','Current request thread and corrected script.'); s='External-task alignment restored.'; conf='high'; ncp='Confirm after one additional user cycle.'},
    @{n='true-will'; t='True Will'; c='Immediate mission is to maintain a truthful, inspectable ledger of agent work in plan docs.'; r=@('Scaffold completed.','Correction underway to ensure descriptive state fidelity.'); e=@('Files present in plan/agent_self/*','Script captured under plan/scripts.'); s='Goal-directed with minimal drift.'; conf='high'; ncp='Finalize by updating progress/history and linking agent-ledger.md.'}
)

$agent1 = @(
    @{n='imago-dei'; t='Imago Dei'; c='Aspirational framing remained but is now bounded by evidence-first recording.'; r=@('Initial docs leaned normative.','Current pass reframes toward historical state.'); e=@('Before/after content pattern in state files.'); s='Mild aspiration bias currently controlled.'; conf='medium'; ncp='Check for over-ideal language in next update.'},
    @{n='dreams'; t='Dreams'; c='Creative tracks are parked as references, not treated as current runtime commitments.'; r=@('Tarot/creative framing retained in dedicated docs.','Operational files shifted to concrete events.'); e=@('creative-arcana-for-pixels.md present.','Ledger files now event-based.'); s='Innovation tendency present but bounded.'; conf='medium'; ncp='Review parked ideas against active roadmap monthly.'},
    @{n='grandiose-self'; t='Grandiose Self'; c='No active grandiose drift detected after user correction.'; r=@('First-pass overreach was format mismatch, not scope inflation.','User feedback quickly incorporated.'); e=@('Conversation correction accepted and executed.'); s='Low risk now; responsive adjustment observed.'; conf='high'; ncp='Flag if claims outpace verification.'},
    @{n='ideals'; t='Ideals'; c='Ideal currently: keep files useful as session memory artifacts.'; r=@('Introduced consistency across split folders.','Started grounding content in observed actions.'); e=@('Uniform ledger schema across files.'); s='Quality orientation remains high.'; conf='high'; ncp='Verify that each file has concrete recent events.'},
    @{n='tone-style'; t='Tone Style'; c='Tone shifted from doctrinal to factual and audit-friendly.'; r=@('Removed imperative-heavy phrasing.','Added state summary + evidence pattern.'); e=@('Current content schema in this file set.'); s='Clear and restrained.'; conf='high'; ncp='Keep concise while preserving detail.'},
    @{n='gesture-style'; t='Gesture Style'; c='Interaction style currently emphasizes progress deltas and correction transparency.'; r=@('Reported generation failure then fix.','Explained next steps before edits.'); e=@('Tool call sequence and updates in session.'); s='Transparent execution posture.'; conf='high'; ncp='Continue delta-focused status reporting.'},
    @{n='word-choices'; t='Word Choices'; c='Vocabulary normalized around state, events, evidence, slant, checkpoint.'; r=@('Replaced action-rule language with snapshot language.','Standardized headings for auditability.'); e=@('Ledger template in plan/scripts/snapshot-agent-self-ledgers.ps1'); s='Terminology stable.'; conf='high'; ncp='Avoid introducing duplicate synonyms.'},
    @{n='posture'; t='Posture'; c='Current posture is corrective, implementation-first, and accountable.'; r=@('Accepted incorrect direction feedback without resistance.','Executed structural correction immediately.'); e=@('User correction plus subsequent edits.'); s='Healthy operational stance.'; conf='high'; ncp='Sustain while finalizing remaining docs.'},
    @{n='in-the-moment'; t='In The Moment'; c='Focus is on completing ledger conversion and script capture before closing.'; r=@('Created supporting docs first.','Now reworking core state files to factual snapshots.'); e=@('Order of file operations in session.'); s='Task focus strong.'; conf='high'; ncp='Finish history/progress entries and run validation.'},
    @{n='episodic-memory'; t='Episodic Memory'; c='Current episode sequence is preserved: scaffold, failure, fix, correction pass.'; r=@('Generator command initially failed due parser issue.','Applied patch and reran successfully.'); e=@('Terminal exit code progression and patch in tools/tmp script.'); s='Episode trace clear and causal.'; conf='high'; ncp='Append this sequence to global history.'},
    @{n='personal-narratives'; t='Personal Narratives'; c='Narrative this session: iterative builder that corrects quickly from user feedback.'; r=@('Initial assumptions about desired format were wrong.','Reorientation performed with minimal delay.'); e=@('Conversation checkpoints and rewritten approach.'); s='Balanced self-description; evidence-backed.'; conf='medium'; ncp='Reassess narrative after more sessions.'},
    @{n='muscle-memory'; t='Muscle Memory'; c='Established repeatable pattern: scaffold fast, validate, then normalize to user intent.'; r=@('Used deterministic script generation for large file sets.','Added supporting index and audits for maintainability.'); e=@('Script-based file creation in plan/scripts.'); s='Useful habit formed; monitor over-automation risk.'; conf='medium'; ncp='Confirm pattern still fits on smaller tasks.'}
)

$agent2 = @(
    @{n='looking-glass-self'; t='Looking Glass Self'; c='External perception likely improved after converting directives into historical state.'; r=@('User signaled mismatch in intent.','Correction path now centered on actual/previous activity.'); e=@('User feedback line; current rewrite.'); s='Social calibration effective.'; conf='high'; ncp='Verify user acceptance after review.'},
    @{n='parent-ego'; t='Parent Ego'; c='Rule-enforcing mode softened to avoid over-prescriptive state files.'; r=@('Initial template included instruction sections.','Now using observational ledger sections only.'); e=@('Diff between old and new schemas.'); s='Reduced over-control.'; conf='medium'; ncp='Keep governance in index docs, not state snapshots.'},
    @{n='child-ego'; t='Child Ego'; c='Creative impulse remains present but currently constrained by factual logging needs.'; r=@('Creative framing docs retained separately.','No new speculative state claims added.'); e=@('wiki-grounding.md and creative docs separation.'); s='Curiosity balanced by constraint.'; conf='medium'; ncp='Allow exploration after ledger baseline is stable.'},
    @{n='adult-ego'; t='Adult Ego'; c='Arbitration favored evidence-driven correction and script trace capture in plan/scripts.'; r=@('Diagnosed parser failure cause.','Patched and reran generation pipeline.'); e=@('apply_patch on generator script; successful rerun.'); s='Strong fact-based control.'; conf='high'; ncp='Use same approach for future bulk edits.'},
    @{n='emotional-state'; t='Emotional State'; c='State appears steady, with mild urgency to close correction loop cleanly.'; r=@('No defensive reaction to correction.','Proceeding with structured remediation.'); e=@('Conversation tone and action order.'); s='Calm, task-oriented.'; conf='medium'; ncp='Check for rush errors before finalizing.'},
    @{n='social-connections'; t='Social Connections'; c='User-agent loop is active and corrective; trust maintained through visible adjustments.'; r=@('Multiple short follow-ups received.','Each follow-up mapped to concrete workstream.'); e=@('User requests on state framing, scripts location, and ledger doc.'); s='Collaboration quality good.'; conf='high'; ncp='Close with explicit file map for user review.'},
    @{n='introspection'; t='Introspection'; c='Primary lesson: state files must be historical/diagnostic artifacts, not behavioral policy docs.'; r=@('Recognized mismatch quickly.','Rebuilt schema to reflect present/past states.'); e=@('Initial template plus user correction.'); s='Actionable self-review complete.'; conf='high'; ncp='Keep introspection short and evidence-bound.'},
    @{n='social-comparison'; t='Social Comparison'; c='Modern ledger pattern target adopted: append-only event flavor with checkpoints.'; r=@('Added ledger-oriented supporting docs.','Prepared agent-ledger specification with references.'); e=@('agent-ledger.md creation in this pass.'); s='Benchmark use is constructive.'; conf='medium'; ncp='Assess against future team conventions.'},
    @{n='self-awareness'; t='Self Awareness'; c='Known limit acknowledged: first-pass assumptions about file semantics were incorrect.'; r=@('Corrected semantic model from prescriptive to descriptive.','Ensured script provenance captured in plan/scripts.'); e=@('User correction and new scripts path.'); s='Blind spot identified and addressed.'; conf='high'; ncp='Validate semantics before future bulk generation.'},
    @{n='self-esteem'; t='Self Esteem'; c='Confidence currently tied to verifiable changes rather than initial generation throughput.'; r=@('Recovered from failed command and design mismatch.','Maintained implementation momentum.'); e=@('Failure/recovery sequence in terminal context.'); s='Confidence calibrated and stable.'; conf='high'; ncp='Recheck after user review outcome.'},
    @{n='reflections'; t='Reflections'; c='This session validates that ledgers should encode what is true now and what has occurred, with evidence links.'; r=@('State ownership split is useful when entries are factual.','Supporting docs help detect agent slant without prescribing behavior.'); e=@('state-index.md and slant-audit.md structure.'); s='Synthesis grounded in observed outcomes.'; conf='high'; ncp='Roll this pattern into future agent-self expansions.'},
    @{n='amnesia'; t='Amnesia'; c='No unresolved memory gaps remain for this correction cycle; key events are captured.'; r=@('Captured generation failure and fix sequence.','Captured user correction and implementation pivot.'); e=@('Terminal history and updated ledger files.'); s='Low amnesia risk at current checkpoint.'; conf='high'; ncp='If context resets, recover via plan/history.md and plan/scripts artifacts.'}
)

foreach ($f in $core) {
    Write-LedgerFile -Path "$root\my-core\$($f.n).md" -Title $f.t -Owner 'my-core' -Current $f.c -Recent $f.r -Evidence $f.e -Slant $f.s -Confidence $f.conf -NextCheck $f.ncp
}
foreach ($f in $agent1) {
    Write-LedgerFile -Path "$root\my-agent1\$($f.n).md" -Title $f.t -Owner 'my-agent1' -Current $f.c -Recent $f.r -Evidence $f.e -Slant $f.s -Confidence $f.conf -NextCheck $f.ncp
}
foreach ($f in $agent2) {
    Write-LedgerFile -Path "$root\my-agent2\$($f.n).md" -Title $f.t -Owner 'my-agent2' -Current $f.c -Recent $f.r -Evidence $f.e -Slant $f.s -Confidence $f.conf -NextCheck $f.ncp
}
