@echo off
cd /d "%~dp0.."
set "PATH=C:\Program Files\nodejs;%PATH%"
node node_modules\vite\bin\vite.js --port 5190 --strictPort
