@echo off
title NUMM Frontend Server (Vite :3000)
cd /d "%~dp0"
if exist "C:\Program Files\nodejs" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)
if exist "%APPDATA%\npm" (
    set "PATH=%APPDATA%\npm;%PATH%"
)
echo Starting NUMM React + Vite Frontend Dashboard...
call npm.cmd run dev
if %ERRORLEVEL% NEQ 0 (
    call npm run dev
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend failed to start.
    pause
)
