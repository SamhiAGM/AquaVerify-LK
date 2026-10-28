# AquaVerify LK - Master Test Suite Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Running AquaVerify LK Full-Stack Test Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backend tests
Write-Host "`n[1/2] Running Backend Spring Boot & JUnit 5 Tests..." -ForegroundColor Yellow
Set-Location -Path "d:\AquaVerify LK\backend"
cmd /c "mvnw.cmd test"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "[SUCCESS] All Backend tests passed!" -ForegroundColor Green

# 2. Frontend build & typecheck
Write-Host "`n[2/2] Running Frontend TypeScript Typecheck & Production Build..." -ForegroundColor Yellow
Set-Location -Path "d:\AquaVerify LK\frontend"
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "[SUCCESS] Frontend build completed with 0 errors!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  All Full-Stack Tests Passed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
