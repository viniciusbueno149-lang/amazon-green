@echo off
chcp 65001 > nul
title Amazon Green - Deploy GitHub
echo ==========================================================
echo    🌿 AMAZON GREEN — Deploy no GitHub
echo ==========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-github.ps1"

pause
