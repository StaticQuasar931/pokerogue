@echo off
setlocal
cd /d "%~dp0"
title PokeRogue
where node >nul 2>nul
if errorlevel 1 (
  echo PokeRogue needs Node.js installed to start its local file server.
  echo Install Node.js 24 LTS from https://nodejs.org and then open PLAY.cmd again.
  pause
  exit /b 1
)
node "%~dp0scripts\serve-game.mjs" %*
if errorlevel 1 pause
