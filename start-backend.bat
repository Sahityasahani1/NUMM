@echo off
title NUMM Backend Server (FastAPI :8000)
cd /d "%~dp0"
echo Starting NUMM FastAPI Backend Server...
python -V >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Python not in standard PATH, attempting py launcher...
    py -3 run.py
) else (
    python run.py
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Backend failed to start.
    pause
)
