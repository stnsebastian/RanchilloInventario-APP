@echo off
title Copiar Imagenes de Perros - Ranchillo Inventario
cd /d "%~dp0"

echo =======================================================
echo           COPIANDO IMAGENES DE STOCK DE RANCHILLO
echo =======================================================
echo.

set "SOURCE_DIR=C:\Users\jpinoa\.gemini\antigravity\brain\efd0d9ff-ec08-4449-a504-f9579d7d7b4b"

echo Copiando perro fondo verde...
copy /y "%SOURCE_DIR%\media__1784132864580.png" "dog-green.png" >nul

echo Copiando perro circulo amarillo...
copy /y "%SOURCE_DIR%\media__1784132864602.png" "dog-yellow.png" >nul

echo Copiando perro fondo rojo...
copy /y "%SOURCE_DIR%\media__1784132864673.png" "dog-red.png" >nul

echo.
echo =======================================================
echo ¡Listo! Las imagenes se han copiado y renombrado.
echo =======================================================
echo.
pause
