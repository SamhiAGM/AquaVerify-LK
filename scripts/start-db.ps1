# AquaVerify LK - PostgreSQL 18 Database Cluster Starter (Port 5433)
$pgPath = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
$pgData = "d:\AquaVerify LK\pgdata"

Write-Host "Checking PostgreSQL 18 on port 5433..." -ForegroundColor Cyan
$conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -WarningAction SilentlyContinue

if ($conn.TcpTestSucceeded) {
    Write-Host "[OK] PostgreSQL 18 is already active on port 5433." -ForegroundColor Green
} else {
    Write-Host "Starting PostgreSQL 18 cluster from $pgData on port 5433..." -ForegroundColor Yellow
    Start-Process -FilePath $pgPath -ArgumentList "-D `"$pgData`" -p 5433" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "[OK] PostgreSQL 18 started." -ForegroundColor Green
}
