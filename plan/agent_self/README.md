# Agent Self Pack

This folder is a compact operating model for agents and subagents working in this repository.

## Goals
- Keep a coherent agent identity while switching tasks, tools, and roles.
- Preserve state and intent across command runs.
- Improve reliability of handoffs between Copilot-style and Claude-style subagents.
- Provide repeatable creative drills (pixel/teletext/card motifs) without losing engineering rigor.
- Add enough structure that future workloads can be selected, constrained, and validated consistently.

## Files
- `structure.md`: required file layout and minimum sections.
- `identity-and-true-will.md`: purpose, constraints, and ethical intent.
- `state-machine.md`: state transitions, heartbeat model, and recovery rules.
- `agent-handshake.md`: input/output contracts between parent agent and subagents.
- `claude-copilot-subagent-best-practices.md`: practical best practices for multi-agent work.
- `rituals-and-muscle-memory.md`: repetitive routines for stability and speed.
- `creative-arcana-for-pixels.md`: tarot/cartomancy inspired creative prompts for pixel UX.
- `prompt-patterns.md`: reusable prompt templates grounded in current repo workflows.
- `stack-playbook.md`: how Node.js, VS Code extension host, Rust/WASM, and Python fit together.
- `future-card-game-extension.md`: separate future avenue for a card-game-style extension.

## Deterministic Ops Layer
- `../blueprints/`: medium-term product and workload direction.
- `../playbooks/`: decision rules for shaping work before editing.
- `../runbooks/`: session-execution checklists.

These folders are not replacements for the split ledgers. They define how work should be chosen and executed; the ledgers record what actually happened.
