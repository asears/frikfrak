param(
    [switch]$Utc
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$dt = if ($Utc) { [DateTime]::UtcNow } else { Get-Date }
$dt.ToString('yyyyMMdd_HHmmss')