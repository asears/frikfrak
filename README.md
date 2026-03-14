# Frikfrak

Frikfrak is a VS Code extension project that is incrementally porting Miniverse runtime features.

## Origins

https://github.com/ianscott313/miniverse/

## Current MVP

- Local core server starts on activation (default `127.0.0.1:4321`, auto-increments if occupied).
- Standalone local core server is available via `npm run server`.
- Local test hook endpoint: `POST /api/hooks/claude-code`.
- Command: `Test Frikfrak` opens a webview client.
- Webview renders one Miniverse sprite asset and supports WASD movement.

## Commands

- `Hello World`
- `Test Frikfrak`

## Port Tracking

- Progress checklist: `plan/progress.md`
- Agent setup: `AGENTS.md`
- Agent hooks: `.github/hooks/agent-hooks.local.json`

## Development

```bash
npm run compile
npm run server
```

Run the extension in the Extension Development Host and execute `Test Frikfrak` from the command palette.
