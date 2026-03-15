#!/usr/bin/env bash
# Frikfrak hook dispatcher (Bash)
#
# Receives agent hook input on stdin, forwards it to the Frikfrak extension
# server, and optionally writes a timestamped log entry to disk.
#
# Configuration: .github/hooks/hooks-config.ini  (run from repo root)
#   serverPort  – port the Frikfrak extension server is listening on  [4321]
#   logToFile   – whether to append events to a log file              [false]
#   logFolder   – log folder relative to repo root                    [logs]

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat 2>/dev/null || echo '{}')

# Load hooks-config.ini
CONFIG_FILE=".github/hooks/hooks-config.ini"
SERVER_PORT=4321
LOG_TO_FILE=false
LOG_FOLDER="logs"

if [ -f "$CONFIG_FILE" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        trimmed=$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        if [ -z "$trimmed" ]; then
            continue
        fi
        case "$trimmed" in
            \#*|\;*|\[*\])
                continue
                ;;
        esac

        case "$trimmed" in
            *=*)
                key=${trimmed%%=*}
                value=${trimmed#*=}
                key=$(printf '%s' "$key" | sed -e 's/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]')
                value=$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
                case "$key" in
                    serverport)
                        case "$value" in
                            ''|*[!0-9]*) ;;
                            *) SERVER_PORT="$value" ;;
                        esac
                        ;;
                    logtofile)
                        lower=$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')
                        case "$lower" in
                            1|true|yes|on) LOG_TO_FILE=true ;;
                            0|false|no|off) LOG_TO_FILE=false ;;
                        esac
                        ;;
                    logfolder)
                        if [ -n "$value" ]; then
                            LOG_FOLDER="$value"
                        fi
                        ;;
                esac
                ;;
        esac
    done < "$CONFIG_FILE"
fi

# Build payload
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


# Optionally write to log file
if [ "$LOG_TO_FILE" = "true" ]; then
    mkdir -p "$LOG_FOLDER"
    echo "$TS_ISO [$HOOK_TYPE] $PAYLOAD" >> "$LOG_FOLDER/hooks.log"
fi

# POST to the Frikfrak extension server
if command -v curl &>/dev/null; then
    curl -s -X POST \
        -H "Content-Type: application/json" \
        --max-time 3 \
        -d "$PAYLOAD" \
        "http://127.0.0.1:${SERVER_PORT}/api/hooks/${HOOK_TYPE}" >/dev/null 2>&1 || true
fi
