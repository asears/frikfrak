# Frikfrak — GitHub Copilot Agent Hooks

This folder wires up all six GitHub Copilot coding-agent hook triggers so that
every agent lifecycle event is forwarded to the running Frikfrak VS Code extension,
displayed in the **scrolling stock-ticker** at the bottom of the Test Frikfrak webview,
and logged to the **Frikfrak Hooks** VS Code output channel.

---

## How it works

```
GitHub Copilot agent
        │  fires hook (stdin JSON)
        ▼
frikfrak-hook.ps1 / frikfrak-hook.sh
        │  HTTP POST  →  http://127.0.0.1:<port>/api/hooks/<hookType>
        ▼
FrikfrakCoreServer (Node.js / extension host)
        │  emits 'hookEvent'
        ├─► VS Code "Frikfrak Hooks" output channel  (always)
        ├─► webview postMessage → ticker bar          (always)
        └─► logs/hooks.log                            (when logToFile: true)
```

---

## Hook triggers

| Key in `hooks` object   | When it fires                                      |
|-------------------------|----------------------------------------------------|
| `sessionStart`          | A new agent session begins (or is resumed)         |
| `sessionEnd`            | The session completes, errors, or is aborted       |
| `userPromptSubmitted`   | The user submits a prompt to the agent             |
| `preToolUse`            | **Before** any tool call — can `deny` execution    |
| `postToolUse`           | **After** any tool call completes                  |
| `errorOccurred`         | An unhandled error occurs during agent execution   |

---

## Configuration — `hooks-config.json`

| Field        | Type    | Default | Description                                          |
|--------------|---------|---------|------------------------------------------------------|
| `serverPort` | number  | `4321`  | Port the Frikfrak extension server is listening on   |
| `logToFile`  | boolean | `false` | Set `true` to append log entries to `logs/hooks.log` |
| `logFolder`  | string  | `"logs"`| Folder (relative to repo root) for the log file      |

Example — enable file logging:

```json
{
  "serverPort": 4321,
  "logToFile": true,
  "logFolder": "logs"
}
```

> **Note:** `logs/hooks.log` is not committed to git. Add `logs/` to your `.gitignore`.

---

## Hook scripts

| File                            | Purpose                        |
|---------------------------------|--------------------------------|
| `scripts/frikfrak-hook.ps1`     | PowerShell (Windows / cross-platform pwsh) |
| `scripts/frikfrak-hook.sh`      | Bash (Linux / macOS / WSL)     |

Both scripts:
1. Read the agent-supplied JSON from **stdin**
2. Load `hooks-config.json` to resolve the server port and logging settings
3. `POST` a structured payload to `http://127.0.0.1:<port>/api/hooks/<hookType>`
4. Optionally append a timestamped line to `<logFolder>/hooks.log`

The hook type is injected via the `FRIKFRAK_HOOK_TYPE` environment variable set in
`agent-hooks.json`.

---

## Payload format sent to the server

```json
{
  "hookType": "preToolUse",
  "timestamp": 1704614600000,
  "data": { /* original agent-provided stdin JSON */ }
}
```

---

## Agent hooks file format reference

See the official GitHub docs:
- [Using hooks with GitHub Copilot agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks configuration reference](https://docs.github.com/en/copilot/reference/hooks-configuration)

---

## Local hooks (not committed)

`agent-hooks.local.json` is **not** picked up by the GitHub agent — it is a
local-only reference copy showing the legacy Claude Code HTTP hook format.
The committed `agent-hooks.json` is the live configuration.
