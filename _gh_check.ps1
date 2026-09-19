$ProgressPreference = 'SilentlyContinue'
Write-Output "=== GitHub API reachable? ==="
try {
    $r = Invoke-WebRequest "https://api.github.com" -UseBasicParsing -TimeoutSec 15 -Headers @{ "User-Agent" = "PAWF-site" }
    Write-Output ("api.github.com -> " + $r.StatusCode)
} catch {
    Write-Output ("api.github.com -> " + $_.Exception.Message)
}

Write-Output ""
Write-Output "=== Does the target account exist / is it reachable? ==="
try {
    $u = Invoke-RestMethod "https://api.github.com/users/thegoodnessfredrickfoundation-stack" -TimeoutSec 20 -Headers @{ "User-Agent" = "PAWF-site" }
    Write-Output ("login   : " + $u.login)
    Write-Output ("name    : " + $u.name)
    Write-Output ("type    : " + $u.type)
    Write-Output ("repos   : " + $u.public_repos)
} catch {
    Write-Output ("user lookup failed: " + $_.Exception.Message)
}

Write-Output ""
Write-Output "=== Any stored GitHub credentials? ==="
$candidates = @(
    "$env:USERPROFILE\.git-credentials",
    "$env:USERPROFILE\.gitconfig",
    "$env:APPDATA\GitHub CLI\hosts.yml",
    "$env:LOCALAPPDATA\GitHubDesktop"
)
foreach ($c in $candidates) {
    if (Test-Path $c) { Write-Output ("EXISTS: " + $c) }
    else { Write-Output ("none  : " + $c) }
}

Write-Output ""
Write-Output "=== Token in environment? ==="
$envNames = @("GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT")
foreach ($n in $envNames) {
    $v = [Environment]::GetEnvironmentVariable($n)
    if ([string]::IsNullOrEmpty($v)) { Write-Output ($n + " = (not set)") }
    else { Write-Output ($n + " = SET (len " + $v.Length + ")") }
}

Write-Output ""
Write-Output "=== Windows credential store entries mentioning github ==="
try {
    $out = cmdkey /list 2>&1 | Out-String
    if ($out -match "github") { Write-Output "Found github entry in credential manager" }
    else { Write-Output "No github entry found in credential manager output" }
} catch {
    Write-Output "cmdkey unavailable"
}
