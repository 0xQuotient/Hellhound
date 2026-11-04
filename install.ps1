#Requires -Version 5.1
# Hellhound installer for Windows.
# Usage: irm https://raw.githubusercontent.com/0xQuotient/Hellhound/main/install.ps1 | iex

$ErrorActionPreference = 'Stop'

$RepoUrl    = 'https://github.com/0xQuotient/Hellhound.git'
$InstallDir = Join-Path $HOME 'Hellhound'
# Deliberately not 'bin': that holds the extensionless bash launcher, and
# PowerShell will happily find it on PATH and hand it to Windows, which has no
# association for it and opens a "choose an app" dialog instead of running it.
$BinDir     = Join-Path $InstallDir 'bin-win'

Write-Host '== Hellhound installer ==' -ForegroundColor Cyan

function Update-PathFromRegistry {
    # winget updates the stored PATH, not the PATH of this already-running session.
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user    = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';'
}

function Test-Tool($Name) {
    [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-Tool($Id, $Label, $Probe) {
    if (-not (Test-Tool 'winget')) {
        throw "$Label is not installed and winget is unavailable. Install $Label manually, then re-run this installer."
    }
    Write-Host "$Label not found, installing via winget..."
    winget install -e --id $Id --accept-package-agreements --accept-source-agreements
    Update-PathFromRegistry
    if (-not (Test-Tool $Probe)) {
        throw "$Label was installed but is not on PATH yet. Close this window, open a new terminal, and re-run this installer."
    }
}

if (-not (Test-Tool 'git')) {
    Install-Tool 'Git.Git' 'Git' 'git'
}

if (-not (Test-Tool 'node') -or -not (Test-Tool 'npm')) {
    Install-Tool 'OpenJS.NodeJS.LTS' 'Node.js' 'node'
}

Write-Host ("Using Node {0}" -f (node --version))

if (Test-Path (Join-Path $InstallDir '.git')) {
    Write-Host "Existing install found at $InstallDir, pulling latest..."
    git -C $InstallDir pull
} elseif (Test-Path $InstallDir) {
    throw "$InstallDir already exists but is not a git clone. Move or delete it, then re-run this installer."
} else {
    Write-Host "Cloning Hellhound into $InstallDir..."
    git clone $RepoUrl $InstallDir
}

Push-Location $InstallDir
try {
    Write-Host 'Installing dependencies...'
    # npm.cmd, not npm: the npm.ps1 shim is blocked under a Restricted execution policy.
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE." }
} finally {
    Pop-Location
}

Write-Host 'Linking hellhound command...'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not $userPath) { $userPath = '' }
if (($userPath -split ';') -notcontains $BinDir) {
    $newPath = (@($userPath.Trim(';'), $BinDir) | Where-Object { $_ }) -join ';'
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
}

Write-Host ''
Write-Host "Done. Open a new terminal and run 'hellhound' to launch." -ForegroundColor Green
