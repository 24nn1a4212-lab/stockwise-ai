Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "StockWise AI - Full-Stack AIML Platform Launcher" -ForegroundColor Green
Write-Host "Business Operations and Intelligence" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k `"$scriptDir\run_backend.bat`""

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k `"$scriptDir\run_frontend.bat`""

Start-Sleep -Seconds 3

Write-Host "[3/3] Opening your browser to http://localhost:5173..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n✓ StockWise AI is running!" -ForegroundColor Green
Write-Host "  - Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  - API Swagger: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "`nKeep the two command prompt windows open while using the app.`n" -ForegroundColor Gray
