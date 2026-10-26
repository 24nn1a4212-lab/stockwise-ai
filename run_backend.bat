@echo off
title StockWise AI - Backend Server
echo ========================================================
echo StockWise AI - Starting FastAPI Backend Server
echo ========================================================
cd /d "%~dp0backend"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo Python virtual environment not found in backend\.venv
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)
pause
