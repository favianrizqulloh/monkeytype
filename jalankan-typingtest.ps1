param(
    [string]$SessionId = ""
)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $scoopNode = Join-Path $env:USERPROFILE "scoop\apps\nodejs-lts\current"
    $scoopPnpm = Join-Path $env:USERPROFILE "scoop\apps\pnpm\current"
    if (Test-Path $scoopNode) {
        $env:PATH = "$scoopNode;$scoopPnpm;" + $env:PATH
    }
}

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "          MEMULAI APLIKASI TYPINGTEST MULTIPLAYER             " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$envCmd = "`$env:PATH = '$($env:PATH -replace "'", "''")';"

Write-Host "1. Menjalankan Server Balapan (Port 5005)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "$envCmd Set-Location '$PSScriptRoot'; node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts"

Write-Host "2. Menjalankan Frontend Web (Port 3002)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "$envCmd Set-Location '$PSScriptRoot/frontend'; node node_modules/vite/bin/vite.js dev --port 3002"

Write-Host ""
Write-Host "Menunggu server siap (5 detik)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "3. Membuka Browser..." -ForegroundColor Green
if ($SessionId -ne "") {
    Start-Process "http://localhost:3002/result/$SessionId"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3002/race?session=$SessionId"
} else {
    Start-Process "http://localhost:3002/result"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3002/race"
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "Selesai! Buka browser untuk mencoba balapan!" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
