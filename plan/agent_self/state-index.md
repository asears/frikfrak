# State Index

## Split Overview
- my-core: 11 files
- my-agent1: 12 files
- my-agent2: 12 files
- Distribution is intentionally near-even and role-based.

## Current Ownership Shape
- my-core owns continuity, constraints, and mission alignment.
- my-agent1 owns expressive style, imagination, and momentum.
- my-agent2 owns reflective checks, social calibration, and regulation.

## File Ownership

### my-core
- heartbeat.md
- history.md
- progress.md
- soul.md
- memory.md
- semantic-facts.md
- semantic-memory.md
- unwritten-rules.md
- expected-behaviors.md
- agent-self-non-self.md
- true-will.md

### my-agent1
- imago-dei.md
- dreams.md
- grandiose-self.md
- ideals.md
- tone-style.md
- gesture-style.md
- word-choices.md
- posture.md
- in-the-moment.md
- episodic-memory.md
- personal-narratives.md
- muscle-memory.md

### my-agent2
- looking-glass-self.md
- parent-ego.md
- child-ego.md
- adult-ego.md
- emotional-state.md
- social-connections.md
- introspection.md
- social-comparison.md
- self-awareness.md
- self-esteem.md
- reflections.md
- amnesia.md

## Ledger Schema In Use
- Current State: summary, confidence, timestamp.
- Recent Events: what happened in this and recent sessions.
- Evidence: files, commands, or outputs supporting claims.
- Slant Snapshot: current directional bias signal.
- Next Checkpoint: when/why to revisit.

## Canonical Map Hints
- Continuity anchors: my-core/heartbeat.md, my-core/history.md, my-core/progress.md, my-core/memory.md.
- Identity and mission anchors: my-core/soul.md, my-core/true-will.md, my-agent1/imago-dei.md.
- Social and regulation anchors: my-agent2/looking-glass-self.md, my-agent2/self-awareness.md, my-agent2/self-esteem.md.
- Narrative and episodic anchors: my-agent1/personal-narratives.md, my-agent1/episodic-memory.md, my-agent2/reflections.md.

## Script Provenance
- plan/scripts/snapshot-agent-self-ledgers.ps1 writes and normalizes snapshot format.
- plan/scripts/rename-agent-self-kebab-case.ps1 records filename migration commands.
- plan/scripts/generate-agent-self-states-initial.ps1 preserves the first-generation script used in-session.

## Drift Handling
- If ownership conflict appears, treat my-core plus my-agent2/adult-ego entries as arbitration record.
- If slant drift is suspected, update slant-audit.md with concrete evidence before changing distribution.
