$env:Path = "C:\Program Files\nodejs;" + $env:Path
Write-Host "Starting NUMM Frontend on http://127.0.0.1:3000 ..." -ForegroundColor Cyan
& "C:\Program Files\nodejs\npm.cmd" run dev
