$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeExecutable = (Get-Command node).Source
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = Join-Path $projectRoot 'frontend'
if (!(Test-Path (Join-Path $backendRoot 'dist/server.js'))) {
    & npm --prefix $backendRoot run build
    if ($LASTEXITCODE -ne 0) { throw 'Backend build failed' }
}
if (!(Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $nodeExecutable -ArgumentList 'dist/server.js' -WorkingDirectory $backendRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'backend-local.log') -RedirectStandardError (Join-Path $projectRoot 'backend-local-error.log')
}
if (!(Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $nodeExecutable -ArgumentList 'node_modules/vite/bin/vite.js --host 127.0.0.1' -WorkingDirectory $frontendRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'frontend-local.log') -RedirectStandardError (Join-Path $projectRoot 'frontend-local-error.log')
}
Write-Output 'SkillForge: http://localhost:5173 | API: http://localhost:4000/health'
