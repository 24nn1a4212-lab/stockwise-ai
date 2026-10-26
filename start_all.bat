@echo off
title StockWise AI - Complete Application Launcher
echo =====================================================================
echo          StockWise AI - Business Operations and Intelligence
echo =====================================================================
echo.
echo [1/3] Starting Python FastAPI Backend Server (Port 8000)...
start "StockWise AI - Backend" cmd /k "%~dp0run_backend.bat"

echo [2/3] Starting React Vite Frontend (Port 5173)...
start "StockWise AI - Frontend" cmd /k "%~dp0run_frontend.bat"

echo [3/3] Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening StockWise AI in your web browser...
start http://localhost:5173

echo =====================================================================
echo StockWise AI is running!
echo.
echo - Web Dashboard:  http://localhost:5173
echo - Backend API:    http://127.0.0.1:8000
echo - Swagger Docs:   http://127.0.0.1:8000/docs
echo.
echo Keep the backend and frontend terminal windows open while using the app.
echo To stop the application, simply close those terminal windows.
echo =====================================================================
pause
