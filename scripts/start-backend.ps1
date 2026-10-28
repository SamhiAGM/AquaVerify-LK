# AquaVerify LK - Spring Boot Backend Launcher (Port 8080)
$backendDir = "d:\AquaVerify LK\backend"

Write-Host "Starting AquaVerify LK Backend on http://localhost:8080..." -ForegroundColor Cyan
Set-Location -Path $backendDir
& .\mvnw.cmd spring-boot:run
