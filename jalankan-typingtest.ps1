$env:PATH = "C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;" + $env:PATH

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "          MEMULAI APLIKASI TYPINGTEST MULTIPLAYER             " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Menjalankan Server Balapan (Port 5005)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:PATH='C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;' + `$env:PATH; Set-Location '$PSScriptRoot'; node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts"

Write-Host "2. Menjalankan Frontend Web (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:PATH='C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;' + `$env:PATH; Set-Location '$PSScriptRoot/frontend'; node node_modules/vite/bin/vite.js dev"

Write-Host ""
Write-Host "Menunggu server siap (5 detik)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "3. Membuka Browser..." -ForegroundColor Green
Start-Process "http://localhost:3000/result908235"
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/race?session=908235"

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "Selesai! Buka browser untuk mencoba balapan!" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
