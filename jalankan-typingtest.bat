@echo off
title TypingTest Launcher
chcp 65001 >nul
cls

echo ==============================================================
echo           MEMULAI APLIKASI TYPINGTEST MULTIPLAYER
echo ==============================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\scoop\apps\nodejs-lts\current" (
        set "PATH=%USERPROFILE%\scoop\apps\nodejs-lts\current;%USERPROFILE%\scoop\apps\pnpm\current;%PATH%"
    )
)

set "SESSION=%~1"

echo 1. Menjalankan Server Balapan (Port 5005)...
start "TypingTest Server (Backend 5005)" cmd /k "chcp 65001 >nul && cd /d %~dp0 && node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts"

echo 2. Menjalankan Frontend Web (Port 3002)...
start "TypingTest Web (Frontend 3002)" cmd /k "chcp 65001 >nul && cd /d %~dp0frontend && node node_modules/vite/bin/vite.js dev --port 3002"

echo.
echo Menunggu server siap (sekitar 5 detik)...
ping -n 6 127.0.0.1 >nul

echo 3. Membuka Browser Otomatis:
if defined SESSION (
    echo    - Layar Pengajar (Proyektor): http://localhost:3002/result/%SESSION%
    echo    - Layar Murid (Siswa)       : http://localhost:3002/race?session=%SESSION%
    start http://localhost:3002/result/%SESSION%
    ping -n 3 127.0.0.1 >nul
    start http://localhost:3002/race?session=%SESSION%
) else (
    echo    - Layar Pengajar (Proyektor): http://localhost:3002/result
    echo    - Layar Murid (Siswa)       : http://localhost:3002/race
    start http://localhost:3002/result
    ping -n 3 127.0.0.1 >nul
    start http://localhost:3002/race
)

echo.
echo ==============================================================
echo Selesai! Kedua jendela terminal backend dan frontend aktif.
echo Jangan tutup kedua jendela terminal tersebut selama pengujian.
echo ==============================================================
pause
