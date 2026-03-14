# Prompt: Port Miniverse to Frikfrak

let's port the core functionality of the miniverse to the frikfrak vscode extension, let's start with all assets, the core server and a client which will run with a vscode extension command Test Frikfrak which will display one of the assets in a window and allow wasd movement.  Let's keep track of progress in frikfrak/plan, add AGENTS.md and .github/agents, .github/skills, .github/instructions, .github/hooks folders with placeholder .gitincludes

Let's create some SKILL.md files in .github/skills subfolders to manage the porting of the vscode extension and for debugging and testing and documenting.  Using subagents as necessary.  client is running on windows machine, powershell is available or use built in file actions.

Add this prompt to the prompts folder.
include hooks for github agents in hooks folder, converting {
  "hooks": {
    "PreToolUse": [{ "hooks": [{ "type": "http", "url": "https://miniverse-public-production.up.railway.app/api/hooks/claude-code" }] }],
    "PostToolUse": [{ "hooks": [{ "type": "http", "url": "https://miniverse-public-production.up.railway.app/api/hooks/claude-code" }] }],
    "Stop": [{ "hooks": [{ "type": "http", "url": "https://miniverse-public-production.up.railway.app/api/hooks/claude-code" }] }]
  }
}
but using our local test server.
