@echo off
setlocal
cd /d "%~dp0"
set PORT=4173

if exist "index.html" (
  set SERVE=.
) else if exist "..\dist\index.html" (
  cd /d "%~dp0\..\dist"
  set SERVE=.
) else (
  echo No index.html found.
  echo Unzip ecg-stimulator-view.zip and run view.bat from that folder,
  echo or from the repo run: npm run build
  exit /b 1
)

echo ECG Stimulator — local view
echo Open http://127.0.0.1:%PORT%
echo Do not open index.html via file:// (ES modules will fail).
echo.

where py >nul 2>nul && py -m http.server %PORT% --bind 127.0.0.1 && goto :eof
where python >nul 2>nul && python -m http.server %PORT% --bind 127.0.0.1 && goto :eof

echo Install Python 3, then run: python -m http.server %PORT% --bind 127.0.0.1
pause
exit /b 1
