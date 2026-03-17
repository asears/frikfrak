# Product Scope Options

## Purpose
Capture plausible directions for Frikfrak without letting all of them become active scope at once.

## Option A: Agent Operator Console
### Summary
A pixel-based operations console for watching and testing agent orchestrations in VS Code.

### Why It Fits
- Matches existing hooks, ticker, diagnostics, AST, and teletext surfaces.
- Uses the extension's current strengths rather than requiring a new data plane.
- Encourages deterministic, inspectable workloads.

### Likely Features
- agent/session telemetry pages
- task and diagnostics pages
- hook event timeline
- world objects or teletext monitors reflecting live status

### Risk
- Can become a generic dashboard if signals are not curated.

## Option B: Workspace Insight Kiosk
### Summary
A retro UI that surfaces extension metadata, VS Code configuration, repo health, and coding-session facts.

### Why It Fits
- Low integration risk.
- High usefulness for local testing and demos.
- Aligns with existing diagnostics and file indexing.

### Risk
- Less distinctive than orchestration-focused tooling.

## Option C: Feed Observer Portal
### Summary
A teletext-style reading surface for Wikipedia, NPR, Hackernoon, Hacker News, or other feeds while agents run.

### Why It Fits
- Already partially implemented via teletext pages and cache-backed fetches.
- Good for ambient context during long-running sessions.

### Risk
- Can drift into a novelty reader instead of improving orchestration workflows.

## Option D: Hybrid Pixel Sandbox
### Summary
Blend operator console, workspace insight kiosk, and feed portal into a single extension experience.

### Risk
- Highest novelty and highest drift risk.
- Most likely to produce shallow progress across too many fronts.

## Recommendation
Choose Option A as the primary direction.
Use Option B as the bounded support layer.
Keep Option C as an optional teletext sidecar.
Do not pursue Option D until the other three are individually coherent.

## Non-Goals For The Next Cycle
- No new product identity beyond the current extension.
- No full social/news client.
- No broad autonomous agent platform claims.
- No new runtime channel unless it directly supports the chosen workload.

