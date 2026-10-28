# AquaVerify LK - Vite Frontend Launcher (Port 5173)
$frontendDir = "d:\AquaVerify LK\frontend"

Write-Host "Starting AquaVerify LK Frontend on http://localhost:5173..." -ForegroundColor Cyan
Set-Location -Path $frontendDir
npm run dev
