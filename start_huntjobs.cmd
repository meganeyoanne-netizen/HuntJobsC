@echo off
cd /d "%~dp0"
backend\venv\Scripts\python.exe run_platform.py
if errorlevel 1 pause
