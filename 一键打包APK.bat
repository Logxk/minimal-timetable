@echo off
chcp 65001 >nul
title 极简课表 - APK 快速打包工具

echo ========================================================
echo         极简课表 - 极致性能 APK 一键编译与打包
echo ========================================================
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0build_apk.ps1"

echo.
echo ========================================================
if %ERRORLEVEL% equ 0 (
    echo [成功] APK 已成功编译并签名完成！
    echo 安装包路径:
    echo   1. %~dp0极简课表_袁章超.apk
    echo   2. %~dp0minimal_timetable.apk
    echo.
    echo 可直接发送此 APK 到手机安装体验（极速秒开、零多余权限、离线运行）。
) else (
    echo [提示] 编译未能完成，请检查控制台错误信息。
)
echo ========================================================
echo.
pause
