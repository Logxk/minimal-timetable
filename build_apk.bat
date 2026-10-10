@echo off
chcp 65001 >nul
title Minimal Timetable - APK Builder

powershell.exe -ExecutionPolicy Bypass -File "%~dp0build_apk.ps1"

echo.
pause
