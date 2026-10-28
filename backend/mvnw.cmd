@REM Maven Wrapper proxy script for AquaVerify LK Backend
@echo off
setlocal

set "WRAPPER_MVN=C:\Users\User\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
if exist "%WRAPPER_MVN%" (
    call "%WRAPPER_MVN%" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    call mvn %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please ensure Java 21 and Maven 3.9+ are in PATH.
exit /b 1
