@echo off
rem Windows launcher. Mirrors bin/hellhound, which is bash-only.
cd /d "%~dp0.."
call npm.cmd run app:plain
