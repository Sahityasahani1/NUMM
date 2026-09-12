@echo off
title NUMM Enterprise Platform Launcher
cls
echo ==================================================================
echo   Ministry of Petroleum ^& Natural Gas - NUMM Platform (SIH26099)
echo        One Nation * One Material Code Master System
echo ==================================================================
echo.
echo [1/3] Initializing FastAPI Backend (AI Inference Engine ^& DB)...
start "NUMM Backend Server (FastAPI :8000)" cmd /k "cd /d ""%~dp0"" && start-backend.bat"

echo [2/3] Waiting for Backend initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Initializing React + Vite Frontend Dashboard (:3000)...
start "NUMM Frontend Server (Vite :3000)" cmd /k "cd /d ""%~dp0"" && start-frontend.bat"

echo.
echo Waiting 3 seconds for Vite server to listen...
timeout /t 3 /nobreak >nul

echo Opening NUMM Dashboard in browser at http://127.0.0.1:3000 ...
start http://127.0.0.1:3000

echo.
echo ==================================================================
echo   NUMM Platform is LIVE!
echo   - Frontend: http://127.0.0.1:3000
echo   - Backend:  http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo ==================================================================
echo Keep this window open or close it when done.
pause
