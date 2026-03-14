#!/usr/bin/env bash
# Frikfrak hook dispatcher (Bash)
#
# Receives agent hook input on stdin, forwards it to the Frikfrak extension
# server, and optionally writes a timestamped log entry to disk.
#
# Configuration: .github/hooks/hooks-config.json  (run from repo root)
#   serverPort  – port the Frikfrak extension server is listening on  [4321]
#   logToFile   – whether to append events to a log file              [false]
#   logFolder   – log folder relative to repo root                    [logs]

set -euo pipefail

# 1. Read JSON input from stdin
INPUT=$(cat 2>/dev/null || echo '{}')

# 2. Load hooks-config.json
CONFIG_FILE=".github/hooks/hooks-config.json"
SERVER_PORT=4321
LOG_TO_FILE=false
LOG_FOLDER="logs"

if [ -f "$CONFIG_FILE" ] && command -v jq &>/dev/null; then
    SERVER_PORT=$(jq -r '.serverPort // 4321' "$CONFIG_FILE" 2>/dev/null || echo 4321)
    LOG_TO_FILE=$(jq -r '.logToFile // false' "$CONFIG_FILE" 2>/dev/null || echo false)
    LOG_FOLDER=$(jq  -r '.logFolder // "logs"' "$CONFIG_FILE" 2>/dev/null || echo logs)
fi

# 3. Build payload
HOOK_TYPE="${FRIKFRAK_HOOK_TYPE:-unknown}"
TS_MS=$(date +%s)000
TS_ISO=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "")

# Safely embed the input JSON (avoid broken payload if INPUT is malformed)
if command -v jq &>/dev/null; then
    PAYLOAD=$(jq -cn --arg ht "$HOOK_TYPE" --argjson ts "$TS_MS" --argjson data "$INPUT" \
        '{hookType:$ht,timestamp:$ts,data:$data}')
else
    PAYLOAD="{\"hookType\":\"$HOOK_TYPE\",\"timestamp\":$TS_MS,\"data\":$INPUT}"
fi

# 4. POST to the Frikfrak extension server
if command -v curl &>/dev/null; then
    curl -s -X POST \
        -H "Content-Type: application/json" \
        --max-time 3 \
        -d "$PAYLOAD" \
        "http://127.0.0.1:${SERVER_PORT}/api/hooks/${HOOK_TYPE}" >/dev/null 2>&1 || true
fi

# 5. Optionally write to log file
if [ "$LOG_TO_FILE" = "true" ]; then
    mkdir -p "$LOG_FOLDER"
    echo "$TS_ISO [$HOOK_TYPE] $PAYLOAD" >> "$LOG_FOLDER/hooks.log"
fi
