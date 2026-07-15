@echo off
title Iniciar Ranchillo Inventario
cd /d "%~dp0"

:: Buscar si Google Chrome esta instalado en las rutas estandar
set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"

:: Buscar si Microsoft Edge esta instalado en las rutas estandar (alternativa)
set "EDGE_PATH="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

:: Lanzar en modo aplicacion
if not "%CHROME_PATH%"=="" (
    start "" "%CHROME_PATH%" --app="%cd%\index.html" --window-size=1200,800
) else if not "%EDGE_PATH%"=="" (
    start "" "%EDGE_PATH%" --app="file:///%cd:\=/%/index.html" --window-size=1200,800
) else (
    :: Fallback a abrir con el navegador predeterminado del sistema si no encuentra Chrome o Edge
    start "" "index.html"
)
exit
