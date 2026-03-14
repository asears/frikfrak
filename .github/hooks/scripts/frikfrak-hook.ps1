#!/usr/bin/env pwsh
# Frikfrak hook dispatcher (PowerShell)
#
# Receives agent hook input on stdin, forwards it to the Frikfrak extension
# server, and optionally writes a timestamped log entry to disk.
#
# Configuration: ../.github/hooks/hooks-config.json
#   serverPort  (number)  – port the Frikfrak extension server is listening on  [4321]
#   logToFile   (bool)    – whether to append events to a log file              [false]
#   logFolder   (string)  – log folder relative to repo root                    ["logs"]

param()
$ErrorActionPreference = "SilentlyContinue"

# 1. Read JSON input from stdin
$raw = $null
try { $raw = [Console]::In.ReadToEnd() } catch { $raw = "" }
$inputData = $null
if ($raw) {
    try { $inputData = $raw | ConvertFrom-Json } catch { $inputData = @{ raw = $raw } }
}

# 2. Load hooks-config.json (repo root relative — hooks run with cwd=".")
$configPath = ".github/hooks/hooks-config.json"
$serverPort = 4321
$logToFile  = $false
$logFolder  = "logs"
if (Test-Path $configPath) {
    try {
        $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($null -ne $cfg.serverPort) { $serverPort = [int]$cfg.serverPort }
        if ($null -ne $cfg.logToFile)  { $logToFile  = [bool]$cfg.logToFile }
        if ($null -ne $cfg.logFolder)  { $logFolder  = [string]$cfg.logFolder }
    } catch { }
}

# 3. Build payload
$hookType  = if ($env:FRIKFRAK_HOOK_TYPE) { $env:FRIKFRAK_HOOK_TYPE } else { "unknown" }
$tsMs      = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$tsIso     = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$payloadObj = @{ hookType = $hookType; timestamp = $tsMs; data = $inputData }
$payloadJson = $payloadObj | ConvertTo-Json -Compress -Depth 10

# 4. POST to the Frikfrak extension server
try {
    $uri = "http://127.0.0.1:$serverPort/api/hooks/$hookType"
    $null = Invoke-RestMethod -Uri $uri -Method POST -Body $payloadJson `
        -ContentType "application/json" -TimeoutSec 3
} catch { }

# 5. Optionally write to log file
if ($logToFile) {
    try {
        if (-not (Test-Path $logFolder)) {
            New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
        }
        $logLine = "$tsIso [$hookType] $payloadJson"
        Add-Content -Path (Join-Path $logFolder "hooks.log") -Value $logLine -Encoding UTF8
    } catch { }
}
