@echo off
rem Windows launcher. Lives outside bin/ because that holds an extensionless
rem bash script, which Windows cannot execute.
cd /d "%~dp0.."
call npm.cmd run app:plain
