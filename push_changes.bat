@echo off
setlocal
where git >nul 2>&1 || (
  echo Git is not installed or not on PATH.
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_changes.ps1"
exit /b %ERRORLEVEL%
