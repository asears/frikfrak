<#
.SYNOPSIS
Regenerates deterministic workload docs from external markdown templates.

.DESCRIPTION
Reads template files from plan/scripts/templates and writes canonical docs under
plan/blueprints, plan/playbooks, and plan/runbooks. Supports token substitution
for stable vocabulary and command references.

.EXAMPLE
pwsh -File plan/scripts/sync-deterministic-workloads.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = $PSScriptRoot
$planRoot = Split-Path -Parent $scriptRoot
$templateRoot = Join-Path $scriptRoot 'templates'

function Write-CanonicalFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $fullPath = Join-Path $planRoot $RelativePath
    $parent = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $normalized = $Content.TrimEnd() + "`r`n"
    Set-Content -Path $fullPath -Value $normalized -Encoding utf8
    Write-Output "synced $RelativePath"
}

function Render-Template {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TemplatePath,

        [Parameter(Mandatory = $true)]
        [hashtable]$Tokens
    )

    if (-not (Test-Path -LiteralPath $TemplatePath)) {
        throw "Template not found: $TemplatePath"
    }

    $raw = Get-Content -Path $TemplatePath -Raw -Encoding utf8

    # Replace $TokenName placeholders from template files.
    return [regex]::Replace(
        $raw,
        '\$([A-Za-z][A-Za-z0-9_]*)',
        {
            param($match)
            $name = $match.Groups[1].Value
            if ($Tokens.ContainsKey($name)) {
                return [string]$Tokens[$name]
            }

            return $match.Value
        }
    )
}

$tokens = @{
    OperatorWorkload = 'operator-console'
    WorkspaceWorkload = 'workspace-insights'
    FeedWorkload = 'feed-observer'
    CompileCommand = 'npm run compile'
}

$syncMap = @(
    @{ Template = 'blueprints/deterministic-workload-architecture.md.tmpl'; Output = 'blueprints/deterministic-workload-architecture.md' },
    @{ Template = 'blueprints/product-scope-options.md.tmpl'; Output = 'blueprints/product-scope-options.md' },
    @{ Template = 'blueprints/pixel-ui-surfaces.md.tmpl'; Output = 'blueprints/pixel-ui-surfaces.md' },
    @{ Template = 'playbooks/deterministic-delivery-playbook.md.tmpl'; Output = 'playbooks/deterministic-delivery-playbook.md' },
    @{ Template = 'playbooks/scope-shaping-playbook.md.tmpl'; Output = 'playbooks/scope-shaping-playbook.md' },
    @{ Template = 'playbooks/dream-review-playbook.md.tmpl'; Output = 'playbooks/dream-review-playbook.md' },
    @{ Template = 'runbooks/session-governance-runbook.md.tmpl'; Output = 'runbooks/session-governance-runbook.md' },
    @{ Template = 'runbooks/teletext-feed-and-insights-runbook.md.tmpl'; Output = 'runbooks/teletext-feed-and-insights-runbook.md' },
    @{ Template = 'runbooks/extension-smoke-test-runbook.md.tmpl'; Output = 'runbooks/extension-smoke-test-runbook.md' }
)

foreach ($item in $syncMap) {
    $templatePath = Join-Path $templateRoot $item.Template
    $rendered = Render-Template -TemplatePath $templatePath -Tokens $tokens
    Write-CanonicalFile -RelativePath $item.Output -Content $rendered
}
