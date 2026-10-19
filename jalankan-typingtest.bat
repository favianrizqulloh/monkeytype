@echo off
title TypingTest Launcher
chcp 65001 >nul
cls

echo ==============================================================
echo           MEMULAI APLIKASI TYPINGTEST MULTIPLAYER
echo ==============================================================
echo.

set "PATH=C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;%PATH%"

echo 1. Menjalankan Server Balapan (Port 5005)...
start "TypingTest Server (Backend 5005)" cmd /k "chcp 65001 >nul && cd /d %~dp0 && set PATH=C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;%%PATH%% && node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts"

echo 2. Menjalankan Frontend Web (Port 3000)...
start "TypingTest Web (Frontend 3000)" cmd /k "chcp 65001 >nul && cd /d %~dp0frontend && set PATH=C:\Users\User\scoop\apps\nodejs-lts\current;C:\Users\User\scoop\apps\pnpm\current;%%PATH%% && node node_modules/vite/bin/vite.js dev"

echo.
echo Menunggu server siap (sekitar 5 detik)...
timeout /t 5 /nobreak >nul

echo 3. Membuka Browser Otomatis:
echo    - Layar Pengajar (Proyektor): http://localhost:3000/result908235
echo    - Layar Murid (Siswa)       : http://localhost:3000/race?session=908235
echo.

start http://localhost:3000/result908235
timeout /t 2 /nobreak >nul
start http://localhost:3000/race?session=908235

echo ==============================================================
echo Selesai! Kedua jendela terminal backend dan frontend aktif.
echo Jangan tutup kedua jendela terminal tersebut selama pengujian.
echo ==============================================================
pause
