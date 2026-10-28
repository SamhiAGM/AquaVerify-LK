# AquaVerify LK - Master Start-All Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting AquaVerify LK Full-Stack Development System" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Database
& "d:\AquaVerify LK\scripts\start-db.ps1"

# 2. Launch Backend in new window
Write-Host "Launching Spring Boot Backend in a new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"d:\AquaVerify LK\scripts\start-backend.ps1`""

# 3. Launch Frontend in new window
Write-Host "Launching Vite Frontend in a new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"d:\AquaVerify LK\scripts\start-frontend.ps1`""

Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host "All services initiated:" -ForegroundColor Green
Write-Host " - Frontend UI:      http://localhost:5173" -ForegroundColor Green
Write-Host " - Backend REST API: http://localhost:8080/api" -ForegroundColor Green
Write-Host " - PostgreSQL 18:    127.0.0.1:5433 (aquaverify_db)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
